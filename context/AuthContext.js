'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Instância única do client por render do Provider
  const supabase = useMemo(() => createClient(), [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single()
    if (!error) setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      if (user) {
        fetchProfile(user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          await fetchProfile(u.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // supabase é estável via useMemo

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
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
