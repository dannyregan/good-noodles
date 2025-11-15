import { useState, useEffect, useContext } from 'react'
import { Image, StyleSheet, View, Alert, Text, ScrollView, RefreshControl, Button, TextInput, } from 'react-native'
import {  Input, Icon } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import { SessionContext } from '../../lib/SessionContext'
import { UserFeed } from '../../components/UserFeed'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'

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
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [photoPath, setPhotoPath] = useState<string | undefined>(undefined)
  

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

      const { data: photoData } = supabase.storage.from('avatars').getPublicUrl(`public/${username}.png`);
      setPhotoPath(photoData.publicUrl);
      
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
      console.log('photo path', photoPath)
      Alert.alert('Profile updated!')
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
      console.log('photo path', photoPath)
    }
  }





  const uploadImage = async (uri: string) => {
    if (!uri) return

    const base64File = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

    const { data, error } = await supabase
      .storage
      .from('avatars')
      .upload(`public/${username}.png`, decode(base64File), {
        contentType: 'image/png',
        upsert: true
      })
    if (error) {
      console.error('Error uploading image to supabase:', error)
      return;
    }

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`public/${username}.png`);

    setPhotoPath(`${publicData.publicUrl}?t=${Date.now()}`);


  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4,3],
      quality: 1
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUrl(uri);       // optional, for local preview
      uploadImage(uri);        // pass URI directly
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
            <View style={{ alignItems: 'center',  }}>
              {photoPath ? (
                <Image
                  source={{ uri: photoPath }}
                  style={styles.avatar}
                  resizeMode="cover"
                />) : (<View style={styles.avatar}/>)}
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
                    style={[styles.name, {color: '#545454'}]}
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






        <View style={styles.statsContainer}>

          <View style={styles.statsBox}>
            <Text style={[styles.bold, styles.statsText,]}>{totalPoints}</Text>
            <Text>Points</Text>
          </View>

          <View style={styles.statsBox}>
            <Text style={[styles.bold, styles.statsText,]}>{pointsGiven}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name='heart-outline' type='ionicon' size={15}></Icon>
              <Text> Given</Text>
            </View>
          </View>

          <View style={styles.statsBox}>
            <Text style={[styles.bold, styles.statsText,]}>{pointsReceived}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name='heart-outline' type='ionicon' size={15}></Icon>
              <Text> Earned</Text>
            </View>
          </View>

          <View style={styles.statsBox}>
            <Text style={[styles.bold, styles.statsText,]}>{tasksCompleted}</Text>
            <Text>Tasks</Text>
          </View>

        </View>
        {/* <View>
          <View>
            <Text style={styles.statsText}>Good Noodle Stars: {goodNoodleStars}</Text>
          </View> 
        </View> */}

        <View style={{ flex: 1, padding: 16 }}>
          <UserFeed userId={session.user.id} refreshTrigger={refreshKey} avatarUrl={avatarUrl} username={username} />
        </View>

        <View style={[ styles.verticallySpaced, { marginTop: 20, alignSelf: 'center' }]}>
          <Button 
            title="Sign Out" 
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
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7ce104'
  },
  name: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  statsBox: {
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(124, 225, 4, .5)',
    borderRadius: 10,

  },
  statsText: {
    fontSize: 18,
    padding: 2
  },
  bold: {
    fontWeight: 'bold'
  }
})
