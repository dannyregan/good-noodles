// hooks/useAllPosts.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAllPosts(userId: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatPosts = async (postsData: any[]) => {
    return Promise.all(
      (postsData || []).map(async (post: any) => {
        const liked_by = await Promise.all(
          (post.likes || []).map(async (like: any) => {
            let small_avatar_url = like.profiles?.small_avatar_url || undefined;

            if (small_avatar_url) {
              const { data: publicData } = supabase.storage
                .from('avatars')
                .getPublicUrl(`public/${small_avatar_url}`);
              small_avatar_url = publicData.publicUrl;
            }

            return {
              user_id: like.user_id,
              username: like.profiles?.username,
              small_avatar_url,
            };
          })
        );

        let user_avatar: string | undefined = undefined;
        let poster_username: string | undefined = undefined;

        if (post.user_id) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('small_avatar_url, username')
            .eq('user_id', post.user_id)
            .single();

          if (userData) {
            poster_username = userData.username;
          }

          if (userData?.small_avatar_url) {
            const { data: publicData } = supabase.storage
              .from('avatars')
              .getPublicUrl(`public/${userData.small_avatar_url}`);
            user_avatar = publicData.publicUrl;
          }
        }

        return {
          ...post,
          liked_by,
          user_avatar,
          poster_username,
        };
      })
    );
  };

  const fetchRemainingPosts = async () => {
    try {
      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          tasks (task, base_points, like_points, category_id),
          likes (
            user_id,
            profiles (username, avatar_url, small_avatar_url)
          )
        `)
        .gte('created_at', thirtyOneDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .range(5, 1000); // skip first 5

      if (postsError) throw postsError;

      const formatted = await formatPosts(postsData || []);

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.post_id));
        const newPosts = formatted.filter(p => !existingIds.has(p.post_id));
        return [...prev, ...newPosts];
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchInitialPosts = useCallback(async () => {
    try {
      setLoading(true);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          tasks (task, base_points, like_points, category_id),
          likes (
            user_id,
            profiles (username, avatar_url, small_avatar_url)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (postsError) throw postsError;

      const formatted = await formatPosts(postsData || []);

      setPosts(formatted);

      // start loading remaining posts in background
      fetchRemainingPosts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  return { posts, loading, error, refresh: fetchInitialPosts };
}
