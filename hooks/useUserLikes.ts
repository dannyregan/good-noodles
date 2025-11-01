// hooks/useUserLikes.ts
// Provides the user with an array of the postIds that they've liked.
// This is used to determine which posts should have a filled in heart icon (the posts that are already liked).

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useUserLikes(userId: string) {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLikes = useCallback(async () => {
    if (!userId) return
    try {
        setLoading(true)
        const { data, error } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', userId)
        if (error) throw error
        setLikedPosts(new Set(data.map((row) => row.post_id)))
    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLikes()
  }, [fetchLikes])

  return { likedPosts, loading, error, refresh: fetchLikes }
}