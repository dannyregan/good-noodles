import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Text, Image, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { SessionContext } from '../lib/SessionContext';
import { UserFeed } from './UserFeed';

export const Account = () => {
  const session = useContext(SessionContext);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [pointsReceived, setPointsReceived] = useState(0);
  const [pointsGiven, setPointsGiven] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [goodNoodleStars, setGoodNoodleStars] = useState(0);

  if (!session?.user) return null;

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'username, avatar_url, name, tasks_completed, total_points, points_given, points_received, stars'
          )
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        if (data) {
          setUsername(data.username);
          setAvatarUrl(data.avatar_url);
          setName(data.name);
          setTasksCompleted(data.tasks_completed);
          setPointsReceived(data.points_received);
          setPointsGiven(data.points_given);
          setTotalPoints(data.total_points);
          setGoodNoodleStars(data.stars);
        }
      } catch (error) {
        if (error instanceof Error) Alert.alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session]);

  const updateProfile = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      const updates = {
        user_id: session.user.id,
        username,
        name,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };
      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'user_id' });
      if (error) throw error;
      Alert.alert('Profile updated!');
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.saveRow}>
        <Button
          title={loading ? 'Loading...' : 'Save'}
          onPress={updateProfile}
          disabled={loading}
        />
      </View>

      <View style={styles.profileRow}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
        <View style={styles.nameInputs}>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.usernameInput}
            leftIcon={{ type: 'ionicon', name: 'pencil' }}
          />
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.nameInput}
            leftIcon={{ type: 'ionicon', name: 'pencil' }}
          />
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsHeader}>Stats</Text>
        <Text style={styles.stat}>Tasks Completed: {tasksCompleted}</Text>
        <Text style={styles.stat}>Thanks Received: {pointsReceived}</Text>
        <Text style={styles.stat}>Thanks Given: {pointsGiven}</Text>
        <Text style={styles.stat}>Total Thanks: {totalPoints}</Text>
        <Text style={styles.stat}>Good Noodle Stars: {goodNoodleStars}</Text>
      </View>

      <Text style={styles.feedHeader}>Your Feed</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* FlatList parent — no ScrollView nesting */}
      <FlatList
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              title="Sign Out"
              icon={{
                name: 'exit-outline',
                type: 'ionicon',
                color: 'white',
                size: 20,
              }}
              iconRight
              onPress={() => supabase.auth.signOut()}
            />
          </View>
        }
        data={[]} // no actual list items; feed renders below header
        renderItem={null}
        ListEmptyComponent={
          <View style={{ flex: 1 }}>
            <UserFeed userId={session.user.id} />
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  saveRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
  },
  nameInputs: {
    flex: 1,
    marginLeft: 16,
  },
  inputContainer: {
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  usernameInput: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameInput: {
    fontSize: 16,
    color: '#555',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  statsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stat: {
    fontSize: 16,
    marginVertical: 2,
  },
  feedHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
});
