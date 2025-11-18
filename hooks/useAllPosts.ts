// hooks/useAllPosts.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAllPosts(userId: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch posts with tasks and likes
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          tasks (task, base_points, like_points),
          likes (
            user_id,
            profiles (username, avatar_url, small_avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const formattedPosts = await Promise.all(
        (postsData || []).map(async (post: any) => {
          // Format liked_by array with public avatar URLs
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

          // Fetch post author's avatar separately
          let user_avatar: string | undefined = undefined;
          let poster_username: string | undefined = undefined;
          if (post.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('avatar_url, username')
              .eq('user_id', post.user_id)
              .single();

            if (userData) {
              poster_username = userData.username;
            }

            if (userData?.avatar_url) {
              const { data: publicData } = supabase.storage
                .from('avatars')
                .getPublicUrl(`public/${userData.avatar_url}`);
              user_avatar = publicData.publicUrl;
            }
          }

          return {
            ...post,
            liked_by,
            user_avatar,
            poster_username
          };
        })
      );

      setPosts(formattedPosts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, refresh: fetchPosts };
}
