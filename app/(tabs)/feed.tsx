// app/(tabs)/account.tsx
import { useState, useEffect, useContext } from 'react'
import { Image, StyleSheet, View, Alert, Text } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import { SessionContext } from '../../lib/SessionContext'
import { Feed } from '../../components/Feed'
import AvatarPicker from '../../components/AvatarPicker'

export default function Account() {
  const session = useContext(SessionContext)
  const [loading,   setLoading]   = useState(true)

  if (!session?.user) return

  return (
    <>
      <View style={styles.container}>
        <View style={{ padding: 16 }}>
          <Feed userId={session.user.id}/>
        </View>
      </View>
    </>
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
  mt20: {
    marginTop: 20,
  },
  avatar: {
  width: 100,
  height: 100,
  borderRadius: 70,
  borderWidth: 1,
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
  },
  notBold: {
    fontWeight: 'normal'
  },
  feedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 3,
  },
  primary: {
    color: '#e11383'
  }

})