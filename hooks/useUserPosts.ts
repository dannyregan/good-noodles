// hooks/useUserPosts.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserPosts(userId: string) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPosts() {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        tasks (task, base_points, like_points)
                        `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                if (error) throw error
                setPosts(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [userId])

    return { posts, loading, error }
}
