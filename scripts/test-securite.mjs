// Rejoue les attaques de l'audit du 23 nov. 2026 contre la vraie base, avec
// la clé publique (anon) et un COMPTE DE TEST, exactement comme un attaquant
// depuis son navigateur. Chaque test doit afficher « OK (bloqué) ».
//
// Usage (PowerShell) :
//   $env:TEST_EMAIL="..."; $env:TEST_PASSWORD="..."; node scripts/test-securite.mjs
//
// Le compte de test se crée dans Supabase → Authentication → Add user.
// Aucun secret dans ce fichier : l'URL et la clé anon sont lues dans .env.local.
//
// Données créées : une annonce temporaire (supprimée à la fin) pour le test des
// remontées en parallèle. Rien d'autre n'est écrit si les protections tiennent.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const { TEST_EMAIL, TEST_PASSWORD } = process.env
if (!URL_ || !ANON || !TEST_EMAIL || !TEST_PASSWORD) {
  console.error('Il manque NEXT_PUBLIC_SUPABASE_URL / ANON_KEY (.env.local) ou TEST_EMAIL / TEST_PASSWORD.')
  process.exit(2)
}

const NUL = '00000000-0000-0000-0000-000000000000'
let echecs = 0
function verdict(nom, bloque, detail = '') {
  if (!bloque) echecs++
  console.log(`${bloque ? 'OK (bloqué)  ' : 'FAILLE       '} ${nom}${detail ? ' — ' + detail : ''}`)
}
// Une écriture est bloquée si la base renvoie une erreur, ou si elle ne touche aucune ligne.
const bloqueSi = (res) => !!res.error || (Array.isArray(res.data) && res.data.length === 0)

// ── Sans compte ─────────────────────────────────────────────────────────────
const anon = createClient(URL_, ANON, { auth: { persistSession: false } })
verdict('anon : créer un profil avec 99 999 XP',
  bloqueSi(await anon.from('users').insert({ id: NUL, pseudo: 'zz-test', xp: 99999 }).select()))
verdict('anon : publier un avis au nom d\'un membre',
  bloqueSi(await anon.from('platform_reviews').insert({ user_id: NUL, rating: 5, comment: 'test-securite' }).select()))

// ── Avec le compte de test ──────────────────────────────────────────────────
const sb = createClient(URL_, ANON, { auth: { persistSession: false } })
const { data: login, error: loginErr } = await sb.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD })
if (loginErr) { console.error('Connexion du compte de test impossible :', loginErr.message); process.exit(2) }
const me = login.user.id
await sb.rpc('assurer_profil')

const { data: avant } = await sb.from('users').select('xp, level, badge_parrain_mois, bio').eq('id', me).single()

// Règle 8 : XP, niveau, badge, série
verdict('s\'attribuer 99 999 XP', bloqueSi(await sb.from('users').update({ xp: 99999 }).eq('id', me).select()))
verdict('s\'attribuer un niveau', bloqueSi(await sb.from('users').update({ level: 'Parrain Légendaire' }).eq('id', me).select()))
verdict('s\'attribuer le badge du mois', bloqueSi(await sb.from('users').update({ badge_parrain_mois: true }).eq('id', me).select()))
verdict('modifier sa série', bloqueSi(await sb.from('users').update({ streak_days: 365 }).eq('id', me).select()))
verdict('appeler ajouter_xp directement', !!(await sb.rpc('ajouter_xp', { p_user: me, p_xp: 1000 })).error)
const okBio = await sb.from('users').update({ bio: avant?.bio ?? null }).eq('id', me).select()
verdict('(contrôle) modifier sa bio reste permis', !okBio.error, okBio.error?.message)

// Annonce de test (supprimée à la fin) : les tests d'écriture visent une vraie ligne
const { data: company } = await sb.from('companies').select('id').eq('url_slug', 'nous-portal').maybeSingle()
const { data: ann, error: annErr } = company
  ? await sb.from('announcements').insert({ user_id: me, company_id: company.id, code: 'TEST-SECURITE', description: 'Annonce de test, supprimée aussitôt' }).select('id').single()
  : { data: null, error: { message: 'marque de test introuvable' } }
const cible = ann?.id ?? NUL
if (annErr) console.log('ATTENTION     annonce de test non créée —', annErr.message)

// Règle 7 : dates et compteurs d'annonce
verdict('écrire last_bumped_at (rester en tête)',
  bloqueSi(await sb.from('announcements').update({ last_bumped_at: '2099-01-01T00:00:00Z' }).eq('id', cible).select()))
verdict('écrire bumps_today', bloqueSi(await sb.from('announcements').update({ bumps_today: 0 }).eq('id', cible).select()))
verdict('publier avec une date choisie',
  bloqueSi(await sb.from('announcements').insert({ user_id: me, company_id: NUL, code: 'X', created_at: '2099-01-01' }).select()))
verdict('publier au nom d\'un autre',
  bloqueSi(await sb.from('announcements').insert({ user_id: NUL, company_id: NUL, code: 'X' }).select()))

// Règle 14 : avis plateforme et messages
verdict('avis plateforme au nom d\'un autre',
  bloqueSi(await sb.from('platform_reviews').insert({ user_id: NUL, rating: 1, comment: 'test-securite' }).select()))
verdict('message avec un faux expéditeur',
  bloqueSi(await sb.from('messages').insert({ sender_id: NUL, receiver_id: me, content: 'test-securite' }).select()))
verdict('réécrire le contenu d\'un message',
  bloqueSi(await sb.from('messages').update({ content: 'modifié' }).or(`sender_id.eq.${me},receiver_id.eq.${me}`).select()))
verdict('se créditer', bloqueSi(await sb.from('credits').update({ balance: 9999 }).eq('user_id', me).select()))

// Règle 12 : fichier qui n'est pas une image
const html = new Blob(['<script>alert(1)</script>'], { type: 'text/html' })
const up = await sb.storage.from('avatars').upload(`${me}/test-securite.html`, html, { upsert: true, contentType: 'text/html' })
verdict('déposer un HTML dans les avatars', !!up.error, up.error?.message)
if (!up.error) await sb.storage.from('avatars').remove([`${me}/test-securite.html`])
const gros = new Blob([new Uint8Array(600 * 1024)], { type: 'image/png' })
const up2 = await sb.storage.from('avatars').upload(`${me}/test-securite.png`, gros, { upsert: true, contentType: 'image/png' })
verdict('déposer une image de 600 Ko', !!up2.error, up2.error?.message)
if (!up2.error) await sb.storage.from('avatars').remove([`${me}/test-securite.png`])

// Règle 7 : 8 remontées envoyées en même temps → 5 au plus doivent passer
if (!ann) {
  console.log("IGNORÉ        remontées en parallèle (pas d'annonce de test)")
} else {
  const res = await Promise.all(Array.from({ length: 8 }, () => sb.rpc('remonter_annonce', { p_announcement_id: ann.id })))
  const passees = res.filter((r) => !r.error).length
  verdict('dépasser 5 remontées par requêtes parallèles', passees <= 5, `${passees} acceptées sur 8`)
  await sb.from('announcements').delete().eq('id', ann.id)
}

// L'XP n'a bougé que par les voies normales (connexion du jour, remontées annulées par la suppression)
const { data: apres } = await sb.from('users').select('xp, badge_parrain_mois').eq('id', me).single()
verdict('(contrôle) badge inchangé', apres?.badge_parrain_mois === avant?.badge_parrain_mois)
console.log(`\nXP du compte de test : ${avant?.xp} → ${apres?.xp} (remontées +5 chacune, publication +10 puis −10)`)

await sb.auth.signOut()
console.log(echecs === 0 ? '\nToutes les attaques sont bloquées.' : `\n${echecs} attaque(s) passent encore.`)
process.exit(echecs === 0 ? 0 : 1)
