/**
 * fix-logos.mjs
 * Lit scripts/no-logo.txt et essaie de trouver un vrai favicon pour chaque domaine.
 * Sources testées dans l'ordre :
 *   1. favicon direct  : https://{domain}/favicon.ico
 *   2. DuckDuckGo      : https://icons.duckduckgo.com/ip3/{domain}.ico
 *
 * Usage : node scripts/fix-logos.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 10;
const TIMEOUT_MS  = 5000;
const MIN_BYTES   = 150; // en dessous = icône invalide/générique

// ── Lire no-logo.txt ──────────────────────────────────────────────────────────

const noLogoPath = join(__dirname, "no-logo.txt");
if (!existsSync(noLogoPath)) {
  console.error("❌  scripts/no-logo.txt introuvable — lance d'abord check-logos.mjs");
  process.exit(1);
}

const lines = readFileSync(noLogoPath, "utf8")
  .split("\n")
  .map(l => l.trim())
  .filter(Boolean);

// Format : "Nom de l'entreprise — domain.com"
const toFix = lines.map(line => {
  const sep = line.lastIndexOf(" — ");
  return { nom: line.slice(0, sep), domain: line.slice(sep + 3) };
});

console.log(`📦  ${toFix.length} entreprises à corriger\n`);

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function tryFetch(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      redirect: "follow",
    });
    if (!res.ok) return -1;
    const buf = await res.arrayBuffer();
    return buf.byteLength;
  } catch {
    return -1;
  } finally {
    clearTimeout(timer);
  }
}

async function bestLogo(domain) {
  const candidates = [
    { url: `https://${domain}/favicon.ico`,                           label: "direct"  },
    { url: `https://icons.duckduckgo.com/ip3/${domain}.ico`,          label: "ddg"     },
    { url: `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=64`, label: "gstatic" },
  ];
  for (const c of candidates) {
    const size = await tryFetch(c.url);
    if (size >= MIN_BYTES) return c.url;
  }
  return null;
}

// ── Traitement ────────────────────────────────────────────────────────────────

let content = readFileSync(join(__dirname, "../src/data/entreprises.ts"), "utf8");
let fixed = 0, notFound = 0, done = 0;
const stillNoLogo = [];

async function processOne({ nom, domain }) {
  const newUrl = await bestLogo(domain);
  done++;
  process.stdout.write(
    `\r   ${done}/${toFix.length}  ✔ ${fixed}  ✖ ${notFound}   `
  );

  if (newUrl) {
    // Remplacer l'URL logo pour ce domaine dans le fichier
    content = content.replace(
      new RegExp(`(nom: "${nom.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}", domain: "${domain.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}", logo: ")[^"]+(")`),
      `$1${newUrl}$2`
    );
    fixed++;
  } else {
    notFound++;
    stillNoLogo.push(`${nom} — ${domain}`);
  }
}

for (let i = 0; i < toFix.length; i += CONCURRENCY) {
  await Promise.all(toFix.slice(i, i + CONCURRENCY).map(processOne));
}

// ── Sauvegarde ────────────────────────────────────────────────────────────────

writeFileSync(join(__dirname, "../src/data/entreprises.ts"), content);

if (stillNoLogo.length) {
  writeFileSync(join(__dirname, "still-no-logo.txt"), stillNoLogo.join("\n"));
  console.log(`\n\n✅  Terminé`);
  console.log(`   ✔  ${fixed} logos trouvés et mis à jour dans entreprises.ts`);
  console.log(`   ✖  ${notFound} introuvables → scripts/still-no-logo.txt`);
} else {
  console.log(`\n\n✅  Terminé — tous les logos ont été trouvés !`);
  console.log(`   ✔  ${fixed} logos mis à jour`);
}
