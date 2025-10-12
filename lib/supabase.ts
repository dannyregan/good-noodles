import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://uktkoaqigrufpjhiyvas.supabase.co"
const supabasePublishableKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdGtvYXFpZ3J1ZnBqaGl5dmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDczMjcsImV4cCI6MjA3NTE4MzMyN30.tp8TbxKzBpIBY0LKgQM2p335ICySl8lAzR7TdC3JsSg"

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})