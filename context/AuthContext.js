'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    if (data) setProfile(data)
    return data
  }

  useEffect(() => {
    // Inicializa sessão uma única vez
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        await fetchProfile(u.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          await fetchProfile(u.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = '/auth/login'
  }

  const isRole = (...roles) => roles.includes(profile?.role)

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, isRole, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
