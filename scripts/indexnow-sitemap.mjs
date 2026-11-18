// Envoie toutes les adresses du sitemap en ligne à IndexNow (Bing, Yandex,
// Seznam, Naver ; Google n'utilise pas ce protocole).
//
// Usage : node scripts/indexnow-sitemap.mjs        (envoie)
//         node scripts/indexnow-sitemap.mjs --dry  (liste seulement)
//
// La clé est publique par construction (public/<clé>.txt) ; elle doit rester
// identique à INDEXNOW_KEY de src/lib/indexnow.ts.
const KEY = '3f6081397bdd48416446f4f8c2b71a80' // gitleaks:allow (clé publique par protocole)
const HOST = 'www.codedeparrainage.com'
const dry = process.argv.includes('--dry')

const keyFile = await fetch(`https://${HOST}/${KEY}.txt`)
if (!keyFile.ok || (await keyFile.text()).trim() !== KEY) {
  console.error(`La clé n'est pas encore en ligne sur https://${HOST}/${KEY}.txt : déploie d'abord.`)
  process.exit(1)
}

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
console.log(`${urlList.length} adresses dans le sitemap`)
if (dry) {
  console.log(urlList.join('\n'))
  process.exit(0)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
})
// 200 = reçu, 202 = reçu (clé en cours de vérification), 4xx = refus
console.log(`Réponse IndexNow : ${res.status} ${res.statusText}`)
