// hooks/useAllPosts.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAllPosts(userId: string) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch posts function
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          tasks (task, base_points, like_points),
          profiles (username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initial load
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return { posts, loading, error, refresh: fetchPosts }
}