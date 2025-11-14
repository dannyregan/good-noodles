import { useState, useEffect, useContext } from 'react'
import { Image, StyleSheet, View, Alert, Text, ScrollView, RefreshControl, Button, TextInput } from 'react-native'
import {  Input } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import { SessionContext } from '../../lib/SessionContext'
import { UserFeed } from '../../components/UserFeed'
import * as ImagePicker from 'expo-image-picker'

export default function Account() {
  const session = useContext(SessionContext)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) 
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [pointsReceived, setPointsReceived] = useState(0)
  const [pointsGiven, setPointsGiven] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [goodNoodleStars, setGoodNoodleStars] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  

  const getProfile = async () => {
    console.log('refreshing profile')
    try {
      setLoading(true)
      const { data, error, status } = await supabase
        .from('profiles')
        .select('username, avatar_url, name, tasks_completed, total_points, points_given, points_received, stars')
        .eq('user_id', session?.user.id)
        .single()

      if (error && status !== 406) throw error
      if (data) {
        setUsername(data.username)
        setAvatarUrl(data.avatar_url)
        setName(data.name)
        setTasksCompleted(data.tasks_completed)
        setPointsReceived(data.points_received)
        setPointsGiven(data.points_given)
        setTotalPoints(data.total_points)
        setGoodNoodleStars(data.stars)
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) getProfile()
  }, [session])

  const onRefresh = async () => {
    setRefreshing(true)
    await getProfile()
    setRefreshKey((prev) => prev + 1)
    setRefreshing(false)
  }

  const updateProfile = async () => {
    if (!session?.user) return
    try {
      setLoading(true)
      const updates = {
        user_id: session.user.id,
        username,
        avatar_url: avatarUrl,
        name,
        updated_at: new Date(),
      }
      const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'user_id' })
      if (error) throw error
      Alert.alert('Profile updated!')
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4,3],
      quality: 1
    });

    console.log(result)

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  if (!session?.user) return null

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      <View style={styles.container}>
        <View style={{ alignItems: 'flex-end', width: '95%'}} >
          <Button
            title={loading ? 'Loading...' : 'Save'}
            onPress={updateProfile}
            disabled={loading}
          />
        </View>





          <View style={{ alignItems: 'center', width: 200}}>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatar}
                  resizeMode="cover"
                />) : null}
                <Button
                  title={loading ? 'Loading...' : 'Choose Photo'}
                  onPress={pickImage}
                />
            </View>

            <View style={{
              alignItems: "center",
            }}>

                <View>
                  <TextInput
                    style={[styles.name, styles.bold]}
                    value={username}
                    placeholder='Username'
                    onChangeText={setUsername}
                    autoCapitalize='none'
                    autoComplete='off'
                    autoCorrect={false}
                    enterKeyHint='done'
                    textAlign='center'
                  />
                </View>
                <View>
                  <TextInput
                    style={styles.name}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize='none'
                    autoComplete='off'
                    autoCorrect={false}
                    enterKeyHint='done'
                    textAlign='center'
                  />
                </View>

            </View>
          </View>






        {/* <View style={styles.statsContainer}>
          <Text style={[styles.bold, styles.statsText, { marginBottom: 5}]}>Stats</Text>
          <View>
            <Text style={styles.statsText}>Tasks: {tasksCompleted}</Text>
            <Text style={styles.statsText}>Thanks Received: {pointsReceived}</Text>
            <Text style={styles.statsText}>Thanks Be to God: {pointsGiven}</Text>
            <Text style={styles.statsText}>Total Thanks: {totalPoints}</Text>
            <Text style={styles.statsText}>Good Noodle Stars: {goodNoodleStars}</Text>
          </View>
        </View>

        <View style={{ flex: 1, padding: 16 }}>
          <UserFeed userId={session.user.id} refreshTrigger={refreshKey} />
        </View>

        <View style={[ styles.verticallySpaced, { marginTop: 20, alignSelf: 'center' }]}>
          <Button 
            title="Sign Out" 
            onPress={() => supabase.auth.signOut()} />
        </View> */}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    alignItems: 'center',
  },
  // verticallySpaced: {
  //   paddingTop: 4,
  //   paddingBottom: 4,
  //   alignSelf: 'stretch',
  // },
  avatar: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7ce104'
  },
  name: {
    fontSize: 20,
    padding: 5
  },
  statsContainer: {
    margin: 30,
    width: '95%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
    padding: 10,
  },
  statsText: {
    fontSize: 18
  },
  bold: {
    fontWeight: 'bold'
  }
})
