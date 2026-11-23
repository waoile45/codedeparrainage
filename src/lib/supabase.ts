import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Oublie la session de connexion enregistrée dans le navigateur : cookies
 * `sb-…-auth-token` (découpés en .0, .1… par @supabase/ssr) et état de
 * connexion mis en cache par la barre de navigation.
 */
function oublierSession() {
  if (typeof document === 'undefined') return
  for (const morceau of document.cookie.split(';')) {
    const nom = morceau.split('=')[0].trim()
    if (/^sb-.+-auth-token(\.\d+)?$/.test(nom)) {
      document.cookie = `${nom}=; Max-Age=0; path=/`
    }
  }
  try {
    localStorage.removeItem('cdp_nav_user')
  } catch {
    // stockage indisponible (navigation privée) : rien à effacer
  }
}

/**
 * Session invalide (jeton expiré sans renouvellement possible, révoqué, ou
 * signé par une ancienne clé) : la base répond 401 à TOUTES les requêtes, et
 * les pages concluaient qu'il n'y avait aucun code. Une lecture refusée pour
 * cette raison est rejouée en visiteur, et la session fautive est oubliée.
 * Seules les lectures (GET, HEAD) sont rejouées : une écriture refusée reste
 * refusée, le membre devra se reconnecter.
 */
async function fetchTolerant(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const reponse = await fetch(input, init)
  if (reponse.status !== 401) return reponse

  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (!url.includes('/rest/v1/')) return reponse

  const entetes = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
  const visiteur = `Bearer ${SUPABASE_ANON_KEY}`
  const autorisation = entetes.get('Authorization')
  if (!autorisation || autorisation === visiteur) return reponse

  oublierSession()
  const methode = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  if (methode !== 'GET' && methode !== 'HEAD') return reponse

  entetes.set('Authorization', visiteur)
  return fetch(input, { ...init, headers: entetes })
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: fetchTolerant },
  })
}
