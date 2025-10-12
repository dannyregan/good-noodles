// app/_layout.tsx (root layout)
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Slot, useRouter } from 'expo-router'
import { Session } from '@supabase/supabase-js'

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("Checking session...")
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        console.log('Session confirmed')
        router.replace('/(tabs)/account') // go to tabs if logged in
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        router.replace('/(tabs)/account')
      } else { 
        router.replace('/auth')
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  // Slot will render the matched route (auth, tabs, etc.)
  return <Slot />
}
