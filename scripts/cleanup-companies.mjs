/**
 * cleanup-companies.mjs
 * - Corrige les domaines des grandes marques
 * - Supprime les petites entreprises sans logo
 * - Met à jour entreprises.ts
 *
 * Usage : node scripts/cleanup-companies.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Grandes marques : correction de domaine ───────────────────────────────────
// Format : "nom exact dans entreprises.ts" → "nouveau domaine"

const DOMAIN_FIXES = {
  "LCL banque":            "lcl.fr",
  "bnp":                   "bnpparibas.fr",
  "Bred":                  "bred.fr",
  "edf":                   "edf.fr",
  "nrj mobile":            "nrjmobile.fr",
  "PMU Turf":              "pmu.fr",
  "Pokerstars sport":      "pokerstars.fr",
  "Interactive Brokers":   "interactivebrokers.com",
  "Lacoste":               "lacoste.com",
  "L occitane":            "loccitane.com",
  "Maisons du monde":      "maisonsdumonde.com",
  "Marionnaud":            "marionnaud.fr",
  "Quick":                 "quick.fr",
  "rue du commerce":       "rueducommerce.com",
  "Micromania":            "micromania.fr",
  "gmf":                   "gmf.fr",
  "MMA Assurances":        "mma.fr",
  "Matmut Assurance":      "matmut.fr",
  "Audible":               "audible.fr",
  "Airbnb hote":           "airbnb.fr",
  "LegalPlace":            "legalplace.fr",
  "Freeletics":            "freeletics.com",
  "Fdj":                   "fdj.fr",
  "Malakoff mederic":      "malakoffhumanis.com",
  "Saxo Banque":           "home.saxo",
  "Pierre et Vacances":    "pierreetvacances.com",
  "La poste Mobile":       "lapostemobile.fr",
  "orange mobile":         "mobile.orange.fr",
  "orange fibre":          "fibre.orange.fr",
  "orange adsl":           "adsl.orange.fr",
  "Orange Bank":           "orangebank.fr",
  "Lycamobile":            "lycamobile.fr",
  "Deliveroo Rider":       "deliveroo.fr",
  "Eleclerc Drive":        "e-leclerc.com",
  "Leclerc Energies":      "energies.e.leclerc",
  "Starlink France":       "starlink.com",
  "Distingo bank":         "distingobank.fr",
  "Gaumont Pathe":         "pathe.fr",
  "cultura":               "cultura.com",
  "caisse depargne":       "caisse-epargne.fr",
  "Société générale":      "societegenerale.fr",
  "Allianz":               "allianz.fr",
  "Aviva":                 "aviva.fr",
  "Gemini":                "gemini.com",
  "Kucoin":                "kucoin.com",
  "Christophe Robin":      "christophe-robin.com",
  "Disney store":          "disneystore.fr",
};

// ── Grandes marques à garder telles quelles (domaine déjà correct) ────────────
const KEEP_AS_IS = new Set([
  "Allianz", "Aviva", "Gemini", "Kucoin", "Christophe Robin",
  "Disney store", "caisse depargne", "Société générale",
]);

// ── Entrées à supprimer explicitement (doublons ou hors-sujet) ────────────────
const DELETE_EXPLICIT = new Set([
  "Boursobank",                   // doublon de boursobank.com
  "Fortuneo assurance vie",       // doublon de fortuneo.fr
  "Auchan Prime eco energie",     // sous-produit sans identité propre
  "Home by sfr",                  // produit SFR sans domaine distinct
  "Lidl Vins",                    // pas de site dédié fonctionnel
  "Orange iphone",                // pas un service distinct
]);

// ── Lire still-no-logo.txt ────────────────────────────────────────────────────

const lines = readFileSync(join(__dirname, "still-no-logo.txt"), "utf8")
  .split("\n").map(l => l.trim()).filter(Boolean);

const noLogoSet = new Map(); // nom → domain
for (const line of lines) {
  const sep = line.lastIndexOf(" — ");
  if (sep === -1) continue;
  noLogoSet.set(line.slice(0, sep), line.slice(sep + 3));
}

// ── Appliquer les corrections ─────────────────────────────────────────────────

let content = readFileSync(join(__dirname, "../src/data/entreprises.ts"), "utf8");

let fixed = 0, deleted = 0, kept = 0;

for (const [nom, oldDomain] of noLogoSet) {
  const newDomain = DOMAIN_FIXES[nom];
  const logo = `https://www.google.com/s2/favicons?domain=${newDomain || oldDomain}&sz=128`;

  if (DELETE_EXPLICIT.has(nom)) {
    // Supprimer la ligne
    content = content.replace(
      new RegExp(`\\s*\\{ nom: "${escRe(nom)}", domain: "[^"]+", logo: "[^"]+" \\},?\\n`, "g"),
      "\n"
    );
    deleted++;

  } else if (newDomain && newDomain !== oldDomain) {
    // Corriger le domaine + logo
    content = content.replace(
      `nom: "${nom}", domain: "${oldDomain}"`,
      `nom: "${nom}", domain: "${newDomain}"`
    );
    content = content.replace(
      new RegExp(`(nom: "${escRe(nom)}", domain: "${escRe(newDomain)}", logo: ")[^"]+(")`),
      `$1${logo}$2`
    );
    fixed++;

  } else if (KEEP_AS_IS.has(nom)) {
    kept++;

  } else {
    // Petite entreprise sans logo → supprimer
    content = content.replace(
      new RegExp(`\\s*\\{ nom: "${escRe(nom)}", domain: "${escRe(oldDomain)}", logo: "[^"]+" \\},?\\n`, "g"),
      "\n"
    );
    deleted++;
  }
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Nettoyer les lignes vides doubles ─────────────────────────────────────────
content = content.replace(/\n{3,}/g, "\n\n");

writeFileSync(join(__dirname, "../src/data/entreprises.ts"), content);

// ── Compter les entrées restantes ─────────────────────────────────────────────
const remaining = (content.match(/nom: "/g) || []).length;

console.log(`✅  Terminé`);
console.log(`   ✔  ${fixed} domaines corrigés`);
console.log(`   🗑  ${deleted} petites entreprises supprimées`);
console.log(`   📌  ${kept} grandes marques conservées telles quelles`);
console.log(`   📦  ${remaining} entreprises restantes dans le fichier`);
