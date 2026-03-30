'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      if (user.email !== adminEmail) {
        router.push('/')
        return
      }
      setAuthorized(true)
      setLoading(false)
    }
    checkAdmin()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Vérification des droits...</div>
    </div>
  )

  if (!authorized) return null

  return <>{children}</>
}