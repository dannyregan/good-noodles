// hooks/useUserLikes.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserLikes(userId: string) {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) return

        async function fetchLikes() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('likes')
                    .select('post_id')
                    .eq('user_id', userId)
                if (error) throw error
                const postIds = data.map((row) => row.post_id)
                setLikedPosts(new Set(postIds))
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchLikes()
    }, [userId])

    return { likedPosts, loading, error }
}