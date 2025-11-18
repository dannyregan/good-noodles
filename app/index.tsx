
import { StyleSheet, View, Text } from 'react-native'

export default function Feed() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.text}>Welcome to Good Noodles</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0A0A',
    marginTop: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 24,
    color: 'white'
  }
})