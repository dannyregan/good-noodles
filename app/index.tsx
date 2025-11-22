
import { StyleSheet, View, Text, Dimensions} from 'react-native'

const Feed = () => {
  const screenHeight = Dimensions.get('window').height;
  return (
    <View style={[styles.container, {height: screenHeight}]}>
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

export default Feed;