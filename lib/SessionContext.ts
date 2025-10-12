// lib/SessionContext.ts
import { createContext } from 'react'
import { Session } from '@supabase/supabase-js'

export const SessionContext = createContext<Session | null>(null)
