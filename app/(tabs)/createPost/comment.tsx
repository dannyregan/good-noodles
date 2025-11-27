import { Text, StyleSheet, ScrollView, TextInput } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@rneui/base';

export default function commentAndPost(task: string) {
  const params = useLocalSearchParams();
  const title = params.name

    const submitPost = async () => {
      router.back()
    };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
      <Text>{title}</Text>
      <TextInput
        style={styles.textInput}
      />
      <Button
        title='Post'
        onPress={submitPost}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'white', //'#0a0a0a',
    flexDirection: 'column',
    paddingTop: 75,
  },
  textInput: {
    borderWidth: 2,
    borderColor: 'black',
    padding: 10,
    borderRadius: 4
  },
})