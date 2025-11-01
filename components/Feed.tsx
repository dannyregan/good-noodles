// components/UserFeed.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useUserPosts } from '../hooks/useUserPosts';
import { useUserLikes } from '../hooks/useUserLikes';
import { supabase } from '../lib/supabase';

type UserFeedProps = {
  userId: string;
};

export const Feed: React.FC<UserFeedProps> = ({ userId }) => {
  const { posts, loading, error } = useUserPosts(userId);
  const { likedPosts: userLikes, refresh } = useUserLikes(userId);

  // Local state for reactive UI
  const [postsState, setPostsState] = useState(posts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Initialize local state when posts or userLikes load
  useEffect(() => {
    setPostsState(posts);
  }, [posts]);

  useEffect(() => {
    setLikedPosts(new Set(userLikes));
  }, [userLikes]);

  const toggleLike = async (postId: number) => {
    const isLiked = likedPosts.has(postId);

    // Optimistic UI update: heart
    const newLikedPosts = new Set(likedPosts);
    if (isLiked) newLikedPosts.delete(postId);
    else newLikedPosts.add(postId);
    setLikedPosts(newLikedPosts);

    // Optimistic UI update: likes count
    setPostsState(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
          : post
      )
    );

    try {
      const { error } = await supabase.rpc('togglelike', {
        is_liked: isLiked,
        p_user_id: userId,
        p_post_id: postId,
      });
      if (error) throw error;

      // Optional: refresh likes to reconcile with backend
      await refresh();
    } catch (err) {
      console.error('Error toggling like:', err);

      // Rollback UI
      setLikedPosts(likedPosts);
      setPostsState(prev =>
        prev.map(post =>
          post.post_id === postId
            ? { ...post, likes: post.likes + (isLiked ? 1 : -1) }
            : post
        )
      );
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isLiked = likedPosts.has(item.post_id);
    const likeCount = postsState.find(p => p.post_id === item.post_id)?.likes ?? 0;

    const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <View style={styles.postContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.postTitle}>{item.tasks?.task || 'No Task'}</Text>
        <Text style={styles.postContent}>{item.comment}</Text>

        <View style={styles.likesRow}>
          <Button
            type="clear"
            icon={{
              name: isLiked ? 'heart' : 'heart-outline',
              type: 'ionicon',
              color: isLiked ? 'red' : 'black',
              size: 20,
            }}
            onPress={() => toggleLike(item.post_id)}
          />
          <Text style={styles.likesCount}>{likeCount}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (!postsState || postsState.length === 0) return <Text>No posts yet.</Text>;

  return (
    <FlatList
      data={postsState}
      keyExtractor={(item) => item.post_id.toString()}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 12,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  likesCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
});
