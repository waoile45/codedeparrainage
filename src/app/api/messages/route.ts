import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { receiverId, announcementId, content } = await request.json()

  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous écrire à vous-même' }, { status: 400 })
  }

  await supabase.from('messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    announcement_id: announcementId,
    content: content.trim(),
  })

  return NextResponse.json({ success: true })
}

export async function GET() {
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
  if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id (pseudo), receiver:users!receiver_id (pseudo), announcements (companies (name))')
    .or('sender_id.eq.' + user.id + ',receiver_id.eq.' + user.id)
    .order('created_at', { ascending: false })

  await supabase
    .from('messages')
    .update({ read: true })
    .eq('receiver_id', user.id)
    .eq('read', false)

  return NextResponse.json({ messages })
}