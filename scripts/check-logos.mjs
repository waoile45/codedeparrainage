/**
 * check-logos.mjs
 * Détecte les entreprises sans vrai logo (icône générique Google).
 *
 * Usage : node scripts/check-logos.mjs
 *
 * Principe : Google favicon renvoie toujours une image, mais pour les domaines
 * sans favicon il renvoie une icône générique identique (même taille en octets).
 * On fetch d'abord un domaine inventé pour obtenir la taille de référence,
 * puis on compare chaque logo à cette taille.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 20;   // requêtes en parallèle
const TIMEOUT_MS  = 8000;

// ── Lire les entreprises ──────────────────────────────────────────────────────

const raw = readFileSync(join(__dirname, "../src/data/entreprises.ts"), "utf8");
const regex = /\{ nom: "([^"]+)", domain: "([^"]+)", logo: "([^"]+)" \}/g;
const entreprises = [];
let match;
while ((match = regex.exec(raw)) !== null) {
  entreprises.push({ nom: match[1], domain: match[2], logo: match[3] });
}
console.log(`📦  ${entreprises.length} entreprises à vérifier\n`);

// ── Taille de référence (icône générique) ─────────────────────────────────────

async function fetchSize(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    const buf = await res.arrayBuffer();
    return buf.byteLength;
  } catch {
    return -1;
  } finally {
    clearTimeout(timer);
  }
}

console.log("🔎  Calcul de la taille de l'icône générique...");
const genericSize = await fetchSize(
  "https://www.google.com/s2/favicons?domain=domaine-inexistant-xyz123abc.fr&sz=128"
);
console.log(`   Taille référence (pas de logo) : ${genericSize} octets\n`);

// ── Vérifier chaque entreprise ────────────────────────────────────────────────

const noLogo   = [];
const withLogo = [];
let done = 0;

async function checkOne(e) {
  const size = await fetchSize(e.logo);
  done++;
  process.stdout.write(`\r   Vérifié : ${done} / ${entreprises.length}`);

  // Tolérance ±30 octets autour de la taille générique
  if (size === -1 || Math.abs(size - genericSize) <= 30) {
    noLogo.push({ nom: e.nom, domain: e.domain, size });
  } else {
    withLogo.push(e);
  }
}

// Traitement par chunks de CONCURRENCY
for (let i = 0; i < entreprises.length; i += CONCURRENCY) {
  await Promise.all(entreprises.slice(i, i + CONCURRENCY).map(checkOne));
}

// ── Résultats ─────────────────────────────────────────────────────────────────

console.log(`\n\n📊  Résultats :`);
console.log(`   ✅  ${withLogo.length} entreprises avec logo`);
console.log(`   ❌  ${noLogo.length} entreprises SANS logo\n`);

if (noLogo.length > 0) {
  console.log("❌  Liste des entreprises sans logo :");
  noLogo.forEach(e => console.log(`   - ${e.nom.padEnd(35)} (${e.domain})`));

  // Sauvegarde dans un fichier
  const out = noLogo.map(e => `${e.nom} — ${e.domain}`).join("\n");
  writeFileSync(join(__dirname, "no-logo.txt"), out);
  console.log(`\n💾  Liste sauvegardée dans scripts/no-logo.txt`);
}
