/**
 * sync-entreprises.mjs
 * Importe toutes les entreprises de src/data/entreprises.ts dans la table Supabase `companies`.
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY=<ta_clé> node scripts/sync-entreprises.mjs
 *
 * Options :
 *   --dry-run   Affiche ce qui serait inséré sans toucher à la base
 *   --reset     Vide la table avant d'insérer (ATTENTION : supprime tout)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL      = "https://feuxtdljgvixvhttwiqy.supabase.co";
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN           = process.argv.includes("--dry-run");
const RESET             = process.argv.includes("--reset");
const BATCH_SIZE        = 100; // insertions par lot

if (!SERVICE_ROLE_KEY) {
  console.error("❌  Manque la variable SUPABASE_SERVICE_ROLE_KEY");
  console.error("   Exemple : SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/sync-entreprises.mjs");
  process.exit(1);
}

// ── Lire les entreprises ──────────────────────────────────────────────────────

const raw = readFileSync(join(__dirname, "../src/data/entreprises.ts"), "utf8");

// Extraire tous les objets { nom, domain, logo }
const regex = /\{ nom: "([^"]+)", domain: "([^"]+)", logo: "([^"]+)" \}/g;
const entreprises = [];
let match;
while ((match = regex.exec(raw)) !== null) {
  entreprises.push({ nom: match[1], domain: match[2], logo: match[3] });
}

console.log(`📦  ${entreprises.length} entreprises trouvées dans entreprises.ts`);

if (DRY_RUN) {
  console.log("🔍  Mode dry-run — aperçu des 5 premières :");
  entreprises.slice(0, 5).forEach(e => console.log("   ", e));
  process.exit(0);
}

// ── Supabase client (service role = bypass RLS) ───────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Reset optionnel ───────────────────────────────────────────────────────────

if (RESET) {
  console.log("⚠️   --reset : suppression des entreprises sans codes associés...");
  const { error } = await supabase
    .from("companies")
    .delete()
    .not("id", "in", `(select distinct company_id from announcements)`);
  if (error) { console.error("Erreur reset :", error.message); process.exit(1); }
  console.log("✅  Table nettoyée (entreprises sans codes supprimées)");
}

// ── Récupérer les slugs déjà présents ─────────────────────────────────────────

console.log("🔎  Récupération des slugs existants...");
const { data: existing, error: fetchErr } = await supabase
  .from("companies")
  .select("slug");

if (fetchErr) { console.error("Erreur fetch :", fetchErr.message); process.exit(1); }

const existingSlugs = new Set((existing || []).map(r => r.slug));
console.log(`   ${existingSlugs.size} entreprises déjà en base`);

// ── Filtrer les nouvelles ─────────────────────────────────────────────────────

const toInsert = entreprises
  .filter(e => !existingSlugs.has(e.domain))
  .map(e => ({
    name:     e.nom,
    slug:     e.domain,
    logo_url: e.logo,
    category: "banque",  // valeur par défaut — à corriger manuellement si besoin
  }));

console.log(`➕  ${toInsert.length} nouvelles entreprises à insérer`);

if (toInsert.length === 0) {
  console.log("✅  Rien à faire, tout est déjà synchronisé !");
  process.exit(0);
}

// ── Insertion par lots ────────────────────────────────────────────────────────

let inserted = 0;
let errors   = 0;

for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
  const batch = toInsert.slice(i, i + BATCH_SIZE);
  const { error } = await supabase.from("companies").insert(batch);

  if (error) {
    console.error(`❌  Lot ${i / BATCH_SIZE + 1} échoué : ${error.message}`);
    errors += batch.length;
  } else {
    inserted += batch.length;
    process.stdout.write(`\r   Inséré : ${inserted} / ${toInsert.length}`);
  }
}

console.log(`\n\n✅  Synchronisation terminée`);
console.log(`   ✔  ${inserted} insérées`);
if (errors) console.log(`   ✖  ${errors} erreurs`);
