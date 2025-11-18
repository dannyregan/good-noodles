// app/_layout.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Slot, useRouter } from 'expo-router'
import { Session } from '@supabase/supabase-js'
import { SessionContext } from '../lib/SessionContext'
import 'react-native-url-polyfill/auto'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        router.replace('/(tabs)/feed')
      } else {
        router.replace('/auth')
      }
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        router.replace('/(tabs)/feed')
      } else {
        router.replace('/auth')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider value={session}>
      <Slot />
    </SessionContext.Provider>
  )
}
