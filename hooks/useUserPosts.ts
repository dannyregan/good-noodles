// hooks/useUserPosts.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUserPosts(userId: string, refreshTrigger: number | undefined) {
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
                        tasks (task, base_points, like_points),
                        likes (
                            user_id,
                            profiles (username, avatar_url, small_avatar_url)
                        )
                        `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                if (error) throw error

                const formattedPosts = await Promise.all(
                    (data || []).map(async (post: any) => {
                        const liked_by = await Promise.all(
                            (post.likes || []).map(async (like: { user_id: string, profiles: { username: string, avatar_url: string | null, small_avatar_url: string | null } }) => {
                                let avatar_url = like.profiles.avatar_url;
                                let small_avatar_url = like.profiles.small_avatar_url;

                                if (avatar_url) {
                                    const { data: publicData } = supabase.storage
                                        .from('avatars')
                                        .getPublicUrl(`public/${avatar_url}`);
                                    avatar_url = publicData.publicUrl;
                                }
                                if (small_avatar_url) {
                                    const { data: publicData } = supabase.storage
                                        .from('avatars')
                                        .getPublicUrl(`public/${small_avatar_url}`);
                                    small_avatar_url = publicData.publicUrl;
                                }
                                return {
                                    user_id: like.user_id,
                                    username: like.profiles.username,
                                    avatar_url,
                                    small_avatar_url
                                };
                            })
                        );

                        return {
                            ...post,
                            liked_by
                        };
                    })
                );

                setPosts(formattedPosts || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [userId, refreshTrigger])

    return { posts, loading, error }
}
