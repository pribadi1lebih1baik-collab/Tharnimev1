'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { UserProfile } from '@/types'

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email!)
      } else {
        clearUser()
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile(userId: string, email: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUser({ ...profile, email } as UserProfile)
      } else {
        setUser({
          id: userId,
          email,
          username: email.split('@')[0],
          created_at: new Date().toISOString(),
        })
      }
    } catch {
      setUser({
        id: userId,
        email,
        username: email.split('@')[0],
        created_at: new Date().toISOString(),
      })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    clearUser()
  }

  return { user, isLoading, signOut, isAuthenticated: !!user }
}
