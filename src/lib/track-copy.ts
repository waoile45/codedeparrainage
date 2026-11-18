/**
 * Signale au serveur qu'un code de parrainage vient d'être copié.
 *
 * Partagé par les trois boutons « Copier » de l'application (annuaire,
 * page marque, profil public) pour que la règle de comptage vive à un seul
 * endroit.
 *
 * Deux garde-fous contre le gonflage du compteur :
 *  - ici, une garde par session : recopier dix fois le même code dans le même
 *    onglet ne compte qu'une fois ;
 *  - côté serveur, le rate limit par IP du middleware.
 *
 * Rien n'est stocké sur le visiteur : `sessionStorage` reste dans son
 * navigateur, est vidé à la fermeture de l'onglet, et ne contient que des
 * identifiants d'annonces publiques.
 *
 * La fonction n'échoue jamais : la copie du code est l'action utile, la
 * statistique est accessoire.
 */
export function trackCodeCopy(announcementId?: string): void {
  if (!announcementId) return

  try {
    const key = `cdp_copied_${announcementId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    // Navigation privée ou stockage bloqué : on compte quand même, le rate
    // limit serveur reste le garde-fou.
  }

  const payload = JSON.stringify({ announcement_id: announcementId })

  try {
    // sendBeacon survit à une navigation immédiate après le clic.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/code-copy', new Blob([payload], { type: 'application/json' }))
      return
    }
  } catch {
    // On retombe sur fetch ci-dessous.
  }

  try {
    void fetch('/api/code-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
    // Silence volontaire.
  }
}
