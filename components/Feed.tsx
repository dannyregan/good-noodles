import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl, Image, } from 'react-native';
import { Button } from '@rneui/themed';
import { useAllPosts } from '../hooks/useAllPosts';
import { useUserLikes } from '../hooks/useUserLikes';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient'

type FeedProps = {
  userId: string;
  refreshTrigger: number;
  onRefresh: () => void;
  avatarUrl: string | undefined;
  username: string | undefined;
};

export const Feed: React.FC<FeedProps> = ({ userId, refreshTrigger, onRefresh, avatarUrl, username }) => {
  const { posts, loading, error, refresh: refreshPosts } = useAllPosts(userId);
  const { likedPosts: userLikes, refresh: refreshLikes } = useUserLikes(userId);

  type Post = {
    post_id: number;
    user_id: string;
    content: string | null;
    created_at: string;
    likes: number;
    liked_by: { user_id: string; avatar_url?: string; username?: string }[] | null;
    avatar_url: string;

    // ADD THESE
    tasks?: { task: string } | null;
    comment?: string | null;
  };

  const [postsState, setPostsState] = useState(posts);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const fallbackAvatar = username
    ? `https://uktkoaqigrufpjhiyvas.supabase.co/storage/v1/object/public/avatars/public/${username}.jpg`
    : 'https://example.com/default-avatar.png'; // optional default


  // Sync local state with hooks
  useEffect(() => {
    if (posts.length && postsState.length === 0) {
      setPostsState(posts);
    }
  }, [posts]);
  useEffect(() => setLikedPosts(new Set(userLikes)), [userLikes]);

  // Refresh feed when refreshTrigger changes
  // useEffect(() => {
  //   const doRefresh = async () => {
  //     setRefreshing(true);
  //     setTimeout(async () => {
  //       await refreshPosts();
  //       await refreshLikes();
  //     }, 1000)
  //     setRefreshing(false);
  //   };
  //   doRefresh();
  // }, [refreshTrigger]);

   useEffect(() => {
    const doRefresh = async () => {
      setRefreshing(true);
     // await refreshPosts();
      //await refreshLikes();
      setRefreshing(false);
    };
    doRefresh();
  }, [refreshTrigger]);

const toggleLike = async (postId: number) => {
  const isLiked = likedPosts.has(postId);

  // Store current state for rollback
  const prevLikedPosts = new Set(likedPosts);
  const prevPostsState = [...postsState];

  const myLike = { 
    user_id: userId,
    avatar_url: avatarUrl ?? fallbackAvatar, 
    username };

  // Optimistic UI update
  setLikedPosts(prev => {
    const copy = new Set(prev);
    if (isLiked) copy.delete(postId);
    else copy.add(postId);
    return copy;
  });

  setPostsState(prev =>
    prev.map(post => {
      if (post.post_id === postId) {
        const updatedLikedBy = isLiked
          ? (post.liked_by || []).filter((like: { user_id: string, avatar_url: string }) => like.user_id !== userId)
          : [...(post.liked_by || []), myLike];
        return { ...post, liked_by: updatedLikedBy }; // new object
      }
      return post;
    })
  );

  // Fire-and-forget backend call
  try {
    const { error } = await supabase.rpc('togglelike', {
      is_liked: isLiked,
      p_user_id: userId,
      p_post_id: postId,
    });

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error toggling like. Reverting...');

    // Roll back UI
    setLikedPosts(prevLikedPosts);
    setPostsState(prevPostsState);
  }
};


  const renderItem = ({ item }: { item: Post }) => {
    const currentPost = postsState.find(p => p.post_id === item.post_id) || item;
    console.log(currentPost)

    const isLiked = likedPosts.has(currentPost.post_id);

    //const likeCount = postsState.find(p => p.post_id === item.post_id)?.likes ?? 0;

    const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const greedy = () => Alert.alert("No", "You can't like your own posts.", [{ text: 'Sorry' }]);

    return (
      <LinearGradient
        colors={['rgb(22,22,22)', 'rgb(25,25,25)', 'rgb(28,28,28)']}
        locations={[.5, .7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.postContainer, {padding: 0,}]} 

      >

        <View style={styles.postContainer} >
          <View style={{flexDirection: 'row', }}>
            <Image
              source={{ uri: currentPost.user_avatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={{ width: 150, marginLeft: 15, justifyContent: 'center',}}>
              <Text style={{ fontWeight: 'bold', color: 'white', paddingBottom: 4}}>{currentPost.poster_username}</Text>
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
                name: isLiked ? 'heart' : 'heart-outline',
                type: 'ionicon',
                color: isLiked ? 'rgb(242, 12, 144, 1)' : 'white',
                size: 25,
              }}
              onPress={() => item.user_id === userId ? greedy() : toggleLike(item.post_id)}
            />
            

            <View style={{ flexDirection: 'row', marginLeft: 8 }}>
              {currentPost.liked_by?.map((like: any) => {
                return (
                  <Image
                  key={like.user_id}
                  source={{ uri: like.avatar_url || fallbackAvatar }}
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

  if (error) return <Text>Feed Error: {error}</Text>;
  if (!postsState.length) return <Text>No posts yet.</Text>;

  return (
    <FlatList
      data={postsState}
      keyExtractor={item => item.post_id.toString()}
      renderItem={renderItem}
      extraData={postsState}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      scrollEnabled={false}
      contentContainerStyle={{ alignItems: 'center', width: '95%'}}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 12,
    paddingBottom: 0,
    borderRadius: 10,
    marginBottom: 10,
    minWidth: '100%',
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
