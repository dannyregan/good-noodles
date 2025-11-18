import { useState, useEffect, useContext } from 'react'
import { Image, StyleSheet, View, Alert, Text, ScrollView, RefreshControl, Button, TextInput, Dimensions, StatusBar } from 'react-native'
import {  Input, Icon } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import { SessionContext } from '../../lib/SessionContext'
import { UserFeed } from '../../components/UserFeed'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImageCompressor from 'react-native-compressor'
import * as FileSystem from 'expo-file-system/legacy'
import { decode } from 'base64-arraybuffer'
import { LinearGradient } from 'expo-linear-gradient'

export default function Account() {
  const session = useContext(SessionContext)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) 
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [tasksCompleted, setTasksCompleted] = useState(0)
  const [pointsReceived, setPointsReceived] = useState(0)
  const [pointsGiven, setPointsGiven] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)
  const [goodNoodleStars, setGoodNoodleStars] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [photoPath, setPhotoPath] = useState<string | undefined>(undefined)
  const [smallPhotoPath, setSmallPhotoPath] = useState<string | undefined>(undefined)
  const screenWidth = Dimensions.get('window').width;
  const bannerHeight = 600;
  

  const getProfile = async () => {
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

      const { data: photoData } = supabase.storage.from('avatars').getPublicUrl(`public/${session?.user.id}.jpg`);
      setPhotoPath(photoData.publicUrl);
      
    } catch (error) {
      if (error instanceof Error) Alert.alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) getProfile()
  }, [session, photoPath])

  const onRefresh = async () => {
    setRefreshing(true)
    await getProfile()
    setRefreshKey((prev) => prev + 1)
    setRefreshing(false)
    console.log(loading)
  }

  async function compressPics(uri: string) {
    try {
      const profilePic = await ImageManipulator.ImageManipulator.manipulate(uri)
        .resize({ height: 600 })
      const renderedProfilePic = await profilePic.renderAsync()
      const profileResult = await renderedProfilePic.saveAsync({
        format: ImageManipulator.SaveFormat.JPEG
      })
      console.log('Success compressing profile image')

      const smallPic = await ImageManipulator.ImageManipulator.manipulate(uri)
        .resize({ height: 50, width: 50 })
      const renderedSmallPic = await smallPic.renderAsync()
      const smallResult = await renderedSmallPic.saveAsync({
        format: ImageManipulator.SaveFormat.JPEG
      })
      return [profileResult.uri, smallResult.uri]
    } catch (err) {
      console.error('Error compressing photo:', err)
      return [uri]
    }
  }

  const updateProfile = async () => {
    if (!session?.user) return
    try {
      setLoading(true)
      const updates = {
        user_id: session.user.id,
        username,
        avatar_url: `${session?.user.id}.jpg`,
        small_avatar_url: `SMALL${session?.user.id}.jpg`,
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





  const uploadImage = async (uri: string) => {
    if (!uri) return

    const uriCompressed: string[] = await compressPics(uri)

    await Promise.all(
      uriCompressed.map(async (uri, index) => {
        const base64File = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

        const filename = index === 0 ? `public/${session?.user.id}.jpg` : `public/SMALL${session?.user.id}.jpg`

        const { data, error } = await supabase
          .storage
          .from('avatars')
          .upload(filename, decode(base64File), {
            contentType: 'image/jpg',
            upsert: true
          })
        if (error) {
          console.error('Error uploading image to supabase:', index, error)
          return;
        }

        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filename);

        if (index === 0) {
          setPhotoPath(`${publicData.publicUrl}?t=${Date.now()}`);
        } else {
          setSmallPhotoPath(`${publicData.publicUrl}?t=${Date.now()}`);
        }
      })
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1,1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUrl(uri);       // optional, for local preview
      uploadImage(uri);        // pass URI directly
    }
  };

  if (!session?.user) return null



  return (
    <>
    <StatusBar
      barStyle='light-content'
    />
    <ScrollView
      style={{ backgroundColor: '#0A0A0A' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 40,}}
    >
      <View style={styles.container}>

          <View style={{ alignItems: 'center', }}>
            <View style={[styles.avatar, {alignItems: 'center', justifyContent: 'center', height: bannerHeight, position: 'absolute'}]}><Text style={{color: 'white'}}>Loading Profile Photo...</Text></View>
            <View style={[styles.bannerImage, { alignItems: 'center', width: screenWidth, height: bannerHeight }]}>
              {!loading ? (
                <Image
                  source={{ uri: photoPath || avatarUrl}}
                  style={[styles.avatar, {height: bannerHeight}]}
                  resizeMode="cover"
                />) : (<View style={[styles.avatar, {alignItems: 'center', justifyContent: 'center', height: bannerHeight}]}></View>)}
                {/* <Button
                  title={loading ? 'Loading...' : 'Choose Photo'}
                  onPress={pickImage}
                /> */}

                <LinearGradient
                  colors={['rgba(10,10,10,0)', 'rgba(10,10,10,.5)', 'rgba(10,10,10,.9)', 'rgba(10,10,10,1)']}
                  locations={[.7, .8, .9, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: screenWidth,
                    height: bannerHeight
                  }}
                />

                <View style={{ position: 'absolute', top: 547, right: 20, borderRadius: 10, zIndex: 999}} >
                  <Button
                    title={loading ? 'Loading...' : 'Save'}
                    onPress={updateProfile}
                    disabled={loading}
                    color='rgb(0, 122, 255)'
                  />
                </View>

                <View
                  style={{ position: 'absolute', zIndex: 999, top: 550, left: 20}}>
                  <Icon
                    type='ionicon'
                    name='camera-outline'
                    size={30}
                    color='rgb(0, 122, 255)'
                    onPress={pickImage}
                  />
                </View>


              <View style={{
                alignItems: "center",
                position: 'absolute',
                bottom: 16,
                paddingHorizontal: 16

                }}>
                {/* <View> */}
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
                {/* </View>
                <View> */}
                  <TextInput
                    style={[styles.name, {color: 'white', fontWeight: 300,}]}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize='none'
                    autoComplete='off'
                    autoCorrect={false}
                    enterKeyHint='done'
                    textAlign='center'
                  />
                {/* </View> */}
              </View>
            </View>
          
          </View>






        <View style={styles.statsContainer}>

          <View style={styles.statsBox}>
            <LinearGradient
              colors={['#ff49a0', '#ff1ec0']} // bright electric pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsBox}
              >
            <Text style={[styles.bold, styles.statsText,]}>{totalPoints}</Text>
            <Text style={styles.statsDesc}>Points</Text>
            </LinearGradient>
          </View>

          <View style={styles.statsBox}>
            <LinearGradient
              colors={['#ff49a0', '#ff1ec0']} // bright electric pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsBox}
              >
            <Text style={[styles.bold, styles.statsText,]}>{pointsGiven}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name='heart-outline' type='ionicon' size={15} color='white'></Icon>
              <Text style={styles.statsDesc}> Given</Text>
            </View>
          </LinearGradient>
          </View> 

          <View style={styles.statsBox}>
            <LinearGradient
              colors={['#ff49a0', '#ff1ec0']} // bright electric pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsBox}
              >
            <Text style={[styles.bold, styles.statsText,]}>{pointsReceived}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon name='heart-outline' type='ionicon' size={15} color='white'></Icon>
              <Text style={styles.statsDesc}> Earned</Text>
            </View>
          </LinearGradient>
          </View> 

          <View style={styles.statsBox}>
            <LinearGradient
              colors={['#ff49a0', '#ff1ec0']} // bright electric pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsBox}
              >
                <Text style={[styles.bold, styles.statsText,]}>{tasksCompleted}</Text>
                <Text style={styles.statsDesc}>Tasks</Text>
            </LinearGradient>
          </View>  

        </View>
        {/* <View>
          <View>
            <Text style={styles.statsText}>Good Noodle Stars: {goodNoodleStars}</Text>
          </View> 
        </View> */}

        <View style={{ flex: 1, padding: 16 }}>
          <UserFeed userId={session.user.id} refreshTrigger={refreshKey} avatarUrl={photoPath} smallAvatarUrl={smallPhotoPath} username={username} />
        </View>

        <View style={[ styles.verticallySpaced, { marginTop: 20, alignSelf: 'center' }]}>
          <Button 
            title="Sign Out" 
            onPress={() => supabase.auth.signOut()} />
        </View>
      </View>
    </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    marginTop: 0,
    alignItems: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  bannerImage: {

  },
  avatar: {
    width: '100%',
  },
  name: {
    fontSize: 20,
    padding: 3,
    color: 'white'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  statsBox: {
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(242, 12, 144, 1)',
    borderRadius: 10,
    shadowColor: '#ff1ec0', 
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0},
    elevation: 6, // for Android glow
    borderWidth: 1,
    borderColor: 'rgba(255,30,192,0.7)',

  },
  statsDesc: {
    color: 'white'
  },
  statsText: {
    fontSize: 18,
    padding: 2,
    color: 'white'
  },
  bold: {
    fontWeight: 'bold'
  }
})
