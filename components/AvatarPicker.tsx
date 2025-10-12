// components/AvatarPicker.tsx
import { useState } from 'react'
import { View, Image, StyleSheet, Alert } from 'react-native'
import { Button } from '@rneui/themed'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'
import 'react-native-url-polyfill/auto' // ensures Blob works

export default function AvatarPicker({ userId, avatarUrl, onUpload }: { 
  userId: string
  avatarUrl?: string
  onUpload: (url: string) => void
}) {
  const [localAvatar, setLocalAvatar] = useState(avatarUrl)
  const [loading, setLoading] = useState(false)

  const pickAndUpload = async () => {
    try {
      setLoading(true)
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!granted) {
        Alert.alert('Permission required', 'Please allow access to your camera roll.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (result.canceled) return

      const localUri = result.assets[0].uri
      setLocalAvatar(localUri)

      // Convert to blob using fetch + Blob polyfill
      const blob = await fetch(localUri).then(r => r.blob())

      const fileExt = localUri.split('.').pop()
      const fileName = `${userId}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error } = await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true })
      if (error) throw error

      const { data } = await supabase.storage.from('avatars').createSignedUrl(filePath, 60)
      if (data?.signedUrl) onUpload(data.signedUrl)
    } catch (err) {
      console.log(err)
      Alert.alert('Failed to upload avatar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {localAvatar && <Image source={{ uri: localAvatar }} style={styles.avatar} />}
      <Button title={loading ? 'Uploading...' : 'Change Avatar'} onPress={pickAndUpload} disabled={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
})
