import React, { useState, useEffect, useContext } from 'react'
import { supabase } from '../../../lib/supabase'
import { StyleSheet, View, TextInput, Text, Button, Alert, ScrollView, Modal, Keyboard, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import { Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { ModalDropdown } from '../../../components/Dropdown'
import { SessionContext } from '../../../lib/SessionContext';
import { Ionicons } from '@expo/vector-icons';

export default function Feed() {
  interface Item {
    id: number,
    name: string
  }

  const session = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, number>>({});
  const [selectedTask, setSelectedTask] = useState<{ id: number; name: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Item | null>(null);
  const [comment, setComment] = useState<string | null>(null)
  const [modalVisibility, setModalVisibility] = useState(false)

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const [categoryDict, setCategoryDict] = useState<Record<string, number>>({});
  const categoryArray = Object.entries(categoryDict).map(([category, categoryId]) => ({
    category,
    categoryId
  })).sort((a, b) => a.category.localeCompare(b.category));;
  const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Animals: 'paw',
  Chores: 'list',
  Food: 'pizza',
  Friends: 'people',
  Games: 'dice',
  Health: 'fitness',
  Money: 'cash',
  Outdoors: 'earth',
  Plants: 'leaf',
  Productivity: 'trending-up',
  Professional: 'briefcase',
  Vibes: 'walk',
  'Video Games': 'game-controller',
};

  const tempDict: Record<string, number> = {}

  if (!session?.user) return null;

  const handleSelectedCategory = async (category: Item) => {
    setSelectedTask(null);
    setSelectedCategory(category)

    const filteredTasks = taskInfo
      .filter((item) => item.category_id === category.id)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.task] = item.task_id;
        return acc;
      }, {})

    await setTasks(filteredTasks);

    setModalVisibility(true);
  }

  const handleSelectedTask = (task: Item) => {
    setSelectedTask(task);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const {data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          categories (category)
          `)
        .order('task_name', { ascending: true })
        if (error) throw error
      setTaskInfo(data || [])

      data.forEach(task => {
        if (!(task.categories.category in tempDict)) {
          tempDict[task.categories.category] = task.category_id
        }
      })
      setCategoryDict(tempDict)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const submitPost = async () => {
    try {
      setLoading(true);

      if (!selectedTask?.id) throw new Error("No task selected");
      const taskId = selectedTask.id;

      // 1️⃣ Insert the new post
      const { data: insertedPost, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: session?.user.id,
          task_id: taskId,
          comment: comment || "Enough said.",
        })
        .select()
        .single();

      if (postError) throw postError;
      const postId = insertedPost.post_id;

      // 2️⃣ Fetch base points for the task
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("base_points")
        .eq("task_id", taskId)
        .single();

      if (taskError) throw taskError;
      const pointsToAdd = taskData?.base_points ?? 0;

      // 3️⃣ Fetch current profile totals
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("total_points, tasks_completed")
        .eq("user_id", session?.user.id)
        .single();

      if (profileError) throw profileError;

      // 4️⃣ Update profile totals
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          total_points: (profile.total_points ?? 0) + pointsToAdd,
          tasks_completed: (profile.tasks_completed ?? 0) + 1,
        })
        .eq("user_id", session?.user.id);

      if (updateProfileError) throw updateProfileError;

      // 5️⃣ Update the inserted post's total_points
      const { error: updatePostError } = await supabase
        .from("posts")
        .update({ total_points: pointsToAdd })
        .eq("post_id", postId);

      if (updatePostError) throw updatePostError;

      Alert.alert("Success", "You're a better Noodle!");
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Error submitting post", err.message);
    } finally {
      setSelectedTask(null);
      setSelectedCategory(null);
      setComment('');
      setLoading(false);
    }
  };


  const categoryBox = (item: { category: string, categoryId: number }) => {
    const iconName = categoryIcons[item.category]
    return (
      <TouchableOpacity
        style={[styles.categoryBox, {height: screenHeight/8, width: screenWidth/2.5}]}
        onPress={() => {
          console.log('CATEGORY ID', item.categoryId)
          handleSelectedCategory({
            id: item.categoryId,
            name: item.category})
        }}
      >
        <Text style={{fontSize: 18, padding: 15}}>{item.category}</Text>
        <View style={{marginBottom: 15}}>
          <Ionicons name={iconName} size={40} color="black" />
        </View>
      </TouchableOpacity>
    )
  }




  return (
    <>
        <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
          <View style={styles.verticallySpaced}>
            <FlatList
              data={categoryArray}
              keyExtractor={(item) => item.categoryId.toString()}
              renderItem={({ item }) => categoryBox(item)}
              scrollEnabled={false}
              numColumns={2} // this makes it a two-column grid
              columnWrapperStyle={{ justifyContent: 'space-around', marginBottom: 12 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
            <ModalDropdown
              items={tasks} 
              visible={modalVisibility}
              setVisible={setModalVisibility}
              handleSelectedTask={handleSelectedTask}
              selectedItem={selectedCategory?.name} />
            {/* <Text>Choose your task.</Text>
            <ModalDropdown
              items={tasks} 
              handleSelectedTask={handleSelectedTask}
              selectedItem={selectedTask?.name} /> */}
            <Text>Add your comment.</Text>
            <TextInput
              style={styles.textInput}
              value={comment ? comment : ''}
              onChangeText={setComment} 
              placeholder='Comment'
              onBlur={Keyboard.dismiss}
              multiline={true}
            />
            <Text>-Post Button-</Text>
            <Button
              title='Post'
              onPress={submitPost}
            />
          </View>
        </ScrollView>
      
      <Modal
        transparent
        visible={loading}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ marginTop: 12 }}>Loading...</Text>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'white', //'#0a0a0a',
    flexDirection: 'column',
    paddingTop: 75,
  },
  categoryBox: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 10,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  textInput: {
    borderWidth: 2,
    borderColor: 'black',
    padding: 10,
    borderRadius: 4
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
})