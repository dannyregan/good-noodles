// components/UserFeed.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';
import { useUserPosts } from '../hooks/useUserPosts';
import { useUserLikes } from '../hooks/useUserLikes';
import { supabase } from '../lib/supabase';

type UserFeedProps = {
  userId: string;
};

export const UserFeed: React.FC<UserFeedProps> = ({ userId }) => {
  const { posts, loading, error } = useUserPosts(userId);

  // Map to track liked state per post
  const [likedPosts, setLikedPosts] = useState<{ [postId: number]: boolean }>({});
  const userLikes = useUserLikes(userId)
  console.log('userLikes:', userLikes)

    const toggleLike = async (postId: number, currentLikes: number) => {
        const isLiked = likedPosts[postId] || false;
        const newLike = !isLiked;

        // Optimistically update UI
        setLikedPosts((prev) => ({ ...prev, [postId]: newLike }));

        try {
            console.log(isLiked, newLike)
            const { error } = await supabase
            .from('posts')
            .update({ likes: newLike ? currentLikes + 1 : currentLikes })
            .eq('post_id', postId);

            const { data } = await supabase
            .from('posts')
            .select('likes')
            .eq('post_id', postId)

            if (error) throw error
        } catch (err) {
            console.log('Error updating likes:', err);
            // Rollback UI if backend fails
            setLikedPosts((prev) => ({ ...prev, [postId]: isLiked }));
        }
    };

  const renderItem = ({ item }: { item: any }) => {
    const liked = likedPosts[item.post_id] || false;

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
              name: userLikes.likedPosts.has(item.post_id) ? 'heart' : 'heart-outline',
              type: 'ionicon',
              color: userLikes.likedPosts.has(item.post_id) ? 'red' : 'black',
              size: 20,
            }}
            onPress={() => toggleLike(item.post_id, item.likes)}
          />
          <Text style={styles.likesCount}>{item.likes + (liked ? 1 : 0)}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (posts.length === 0) return <Text>No posts yet.</Text>;

  return <FlatList data={posts} keyExtractor={(item) => item.post_id.toString()} renderItem={renderItem} />;
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