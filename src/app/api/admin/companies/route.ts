import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Création / modification d'entreprise réservée à l'admin.
// La table companies est protégée en écriture par RLS (audit du 5 juillet) :
// un insert/update depuis le navigateur échoue en 42501, même connecté.
// On passe donc par le service_role, après contrôle admin (même schéma que give-boost).

const CATEGORIES = ['banque', 'paris', 'cashback', 'energie', 'telephonie', 'crypto', 'assurance', 'shopping']

const companySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(200),
  category: z.enum(CATEGORIES as [string, ...string[]]).or(z.literal('')).optional(),
  referral_bonus_description: z.string().trim().max(300).optional(),
})

const updateSchema = companySchema.extend({ id: z.string().uuid() })

// « Hello bank! » → « hello-bank » : même forme que les url_slug existants
function slugifyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents décomposés par NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL
  return !!user && !!adminEmail && user.email === adminEmail
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const result = companySchema.safeParse(await request.json().catch(() => null))
  if (!result.success) {
    return NextResponse.json({ error: 'Données invalides (nom et slug/domaine requis)' }, { status: 400 })
  }
  const { name, slug, category, referral_bonus_description } = result.data

  const { data: company, error } = await adminClient()
    .from('companies')
    .insert({
      name,
      slug,
      url_slug: slugifyName(name), // sinon la page /code-parrainage/[slug] ne résout jamais
      category: category || null,
      referral_bonus_description: referral_bonus_description || null,
      logo_url: `https://www.google.com/s2/favicons?domain=${slug}&sz=64`,
    })
    .select()
    .single()

  if (error) {
    console.error('Admin create company error:', error)
    return NextResponse.json({ error: 'Insertion refusée par la base' }, { status: 500 })
  }
  return NextResponse.json({ company })
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const result = updateSchema.safeParse(await request.json().catch(() => null))
  if (!result.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
  const { id, name, slug, category, referral_bonus_description } = result.data

  // url_slug volontairement non modifié : des pages SEO peuvent déjà pointer dessus
  const { data: company, error } = await adminClient()
    .from('companies')
    .update({
      name,
      slug,
      category: category || null,
      referral_bonus_description: referral_bonus_description || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Admin update company error:', error)
    return NextResponse.json({ error: 'Mise à jour refusée par la base' }, { status: 500 })
  }
  return NextResponse.json({ company })
}
