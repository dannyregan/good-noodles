// components/UserFeed.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { Button } from '@rneui/themed';
import { useUserPosts } from '../hooks/useUserPosts';
import { useUserLikes } from '../hooks/useUserLikes';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient'

type UserFeedProps = {
  userId: string;
  refreshTrigger?: number | undefined;
  avatarUrl: string | undefined;
  smallAvatarUrl: string | undefined;
  username: string | undefined;
};

export const UserFeed: React.FC<UserFeedProps> = ({ userId, refreshTrigger, avatarUrl, smallAvatarUrl, username }) => {
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
      'No',
      'You can\'t like your own posts.',
      [{
        text: 'Sorry'
      }]
    )
  };

  const renderItem = ({ item }: { item: any }) => {
    const isLiked = likedPosts.has(item.post_id);
    const likeCount = postsState.find(p => p.post_id === item.post_id)?.liked_by?.length ?? 0;

    const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <LinearGradient
        colors={['rgb(22,22,22)', 'rgb(25,25,25)', 'rgb(28,28,28)']}
        locations={[.5, .7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.postContainer, {padding: 0}]} 

      >
        <View style={styles.postContainer} >
          <View style={{flexDirection: 'row', }}>
            <Image
              source={{ uri: smallAvatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={{ width: 150, marginLeft: 15, justifyContent: 'center',}}>
              <Text style={{ fontWeight: 'bold', color: 'white', paddingBottom: 4}}>{username}</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          <View style={{paddingTop: 8, }}>
            <Text style={styles.postTitle}>{item.tasks?.task || 'No Task'}</Text>
            <Text style={styles.postContent}>{item.comment}</Text>
          </View>



          <View style={styles.likesRow}>
            <Button
              type="clear"
              icon={{
                name: 'heart-outline',
                type: 'ionicon',
                color: 'white',
                size: 25,
              }}
              onPress={() => greedy()}
            />
            

            <View style={{ flexDirection: 'row', marginLeft: 8 }}>
              {item.liked_by?.map((like: any) => {
                return (
                  <Image
                  key={like.user_id}
                  source={{ uri: like.small_avatar_url }}
                  style={styles.likedAvatar}
                />
                )
              })}
            </View>
          </View>
        </View>
      </LinearGradient>
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
    minWidth: '100%',
    borderRadius: 10,
    marginBottom: 10,
    
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    paddingTop: 6,
    paddingBottom: 6,
    color: 'white'
  },
  postContent: {
    fontSize: 16,
    color: 'white',
    paddingBottom: 15,
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
  likedAvatar: {
    width: 35,
    height: 35,
    borderRadius: 5,
    marginRight: 10
  }
});
