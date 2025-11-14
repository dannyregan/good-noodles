
import { StyleSheet, View, Text } from 'react-native'

export default function Feed() {
  return (
    <View style={styles.container}>
      <View style={styles.verticallySpaced}>
        <Text>Welcome to Good Noodles</Text>
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