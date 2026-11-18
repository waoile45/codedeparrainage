/**
 * IndexNow : signale à Bing, Yandex, Seznam et Naver qu'une page a changé.
 * (Google n'utilise pas IndexNow ; pour lui, c'est le sitemap et la Search Console.)
 * Bing alimente aussi les recherches de ChatGPT et de Copilot.
 *
 * La clé n'est pas un secret : le protocole exige qu'elle soit publiée à la
 * racine du site (public/<clé>.txt) pour prouver qu'on en est le propriétaire.
 */
export const INDEXNOW_KEY = '3f6081397bdd48416446f4f8c2b71a80' // gitleaks:allow (clé publique par protocole)
const HOST = 'www.codedeparrainage.com'

/** N'échoue jamais : un signalement manqué n'empêche rien, Bing repassera. */
export async function pingIndexNow(urls: string[]): Promise<boolean> {
  const urlList = urls.filter((u) => u.startsWith(`https://${HOST}/`)).slice(0, 10000)
  if (urlList.length === 0) return false
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
    })
    return res.ok
  } catch {
    return false
  }
}
