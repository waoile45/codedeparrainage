/**
 * Échappe le contenu utilisateur destiné à être injecté dans du HTML
 * (emails, etc.) pour empêcher l'injection HTML/phishing.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Sérialise un objet en JSON sûr pour une balise <script type="application/ld+json">.
 * JSON.stringify n'échappe PAS `<`, `>` ni `&`, ce qui permet à du contenu
 * utilisateur (ex : un code d'annonce contenant `</script>`) de casser la balise
 * et d'injecter du JavaScript (XSS stocké). On échappe ces caractères en \uXXXX.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
