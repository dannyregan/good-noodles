
import { StyleSheet, View, Alert } from 'react-native'
import {  Input } from '@rneui/themed'

export default function Feed() {
  return (
    <View style={styles.container}>
      <View style={styles.verticallySpaced}>
        <Input label="Feed" value={'Welcome to the Feed!'} disabled />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})