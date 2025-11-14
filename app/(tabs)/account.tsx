import { useState, useEffect, useContext } from 'react'
import { Image, StyleSheet, View, Alert, Text, ScrollView, RefreshControl } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import { SessionContext } from '../../lib/SessionContext'
import { UserFeed } from '../../components/UserFeed'

export default function Account() {
  const session = useContext(SessionContext)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) 
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [pointsReceived, setPointsReceived] = useState(0)
  const [pointsGiven, setPointsGiven] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [goodNoodleStars, setGoodNoodleStars] = useState(0)
  

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

        <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-around', width: "95%", height: 100 }}>
          <View style={{ width: 100}}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                resizeMode="cover"
              />) : null}
          </View>

          <View style={{ alignItems: "flex-start" , width: '70%', height: 100, marginLeft: 10,}}>
            <View style={{ height: 50, width: 275, }}>
              <Input
                style={styles.name}
                value={username || ""}
                onChangeText={setUsername}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                leftIcon={{ type: 'ionicon', name: 'pencil' }}
              />
            </View>
            <View style={{ height: 50, width: 275, }}>
              <Input
                value={name || ""}
                onChangeText={setName}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                leftIcon={{ type: 'ionicon', name: 'pencil' }}
              />
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
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
            icon={{ name: 'exit-outline', type: 'ionicon', color: 'white', size: 20 }}
            iconRight
            onPress={() => supabase.auth.signOut()} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    alignItems: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 70,
    borderWidth: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20
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
