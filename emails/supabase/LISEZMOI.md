# Modèles d'e-mails Supabase

À coller dans Supabase → Authentication → Emails → Templates (le code HTML
dans « Message body », le sujet dans « Subject »). Les variables
`{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` sont remplies par Supabase.

| Fichier | Modèle Supabase | Sujet |
|---|---|---|
| confirmation-inscription.html | Confirm signup | Confirme ton inscription sur codedeparrainage.com |
| mot-de-passe-oublie.html | Reset Password | Choisis un nouveau mot de passe |
| changement-adresse.html | Change Email Address | Confirme ta nouvelle adresse e-mail |

Couleurs en dur (pas de variables CSS : les messageries les ignorent). Logo :
https://www.codedeparrainage.com/logo-96.png
