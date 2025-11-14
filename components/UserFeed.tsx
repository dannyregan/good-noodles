// components/UserFeed.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Button } from '@rneui/themed';
import { useUserPosts } from '../hooks/useUserPosts';
import { useUserLikes } from '../hooks/useUserLikes';
import { supabase } from '../lib/supabase';

type UserFeedProps = {
  userId: string;
  refreshTrigger?: number | undefined;
};

export const UserFeed: React.FC<UserFeedProps> = ({ userId, refreshTrigger }) => {
  const { posts, loading, error } = useUserPosts(userId, refreshTrigger);
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

  const greedy = () => {
    Alert.alert(
      'Greedy!',
      'You can\'t like your own posts.',
      [{
        text: 'Sorry'
      }]
    )
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
              name: 'heart-outline',
              type: 'ionicon',
              color: 'black',
              size: 20,
            }}
            onPress={() => greedy()}
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
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 12,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    minWidth: '100%'
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
