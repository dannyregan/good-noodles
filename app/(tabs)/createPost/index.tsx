import React, { useState, useEffect, useContext, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { StyleSheet, View, TextInput, Text, Button, Alert, ScrollView, Modal, Keyboard, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import { Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { ModalDropdown } from '../../../components/Dropdown'
import { SessionContext } from '../../../lib/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native';

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
  const categoryColorsDark: Record<string, string> = {
  Animals: 'rgb(220, 24, 83)',
  Chores: 'rgb(255, 132, 0)',
  Food: 'rgb(255, 204, 0)',
  Friends: 'rgb(0, 129, 210)',
  Games: 'rgb(82, 57, 225)',
  Health: 'rgb(255, 0, 0)',
  Money: 'rgb(14, 139, 0)',
  Outdoors: 'rgb(0, 147, 170)',
  Plants: 'rgb(98, 147, 0)',
  Productivity: 'rgb(12, 0, 141)',
  Professional: 'rgb(118, 193, 255)',
  Vibes: 'rgb(185, 0, 132)',
  'Video Games': 'rgb(104, 0, 201)',
  };
  const categoryColorsLight: Record<string, string> = {
  Animals: 'rgb(230, 123, 155)',
  Chores: 'rgb(253, 202, 107)',
  Food: 'rgb(255, 220, 79)',
  Friends: 'rgb(159, 208, 255)',
  Games: 'rgb(160, 149, 221)',
  Health: 'rgb(255, 137, 137)',
  Money: 'rgb(130, 244, 117)',
  Outdoors: 'rgb(125, 238, 255)',
  Plants: 'rgb(210, 255, 121)',
  Productivity: 'rgb(134, 123, 255)',
  Professional: 'rgb(70, 130, 180)',
  Vibes: 'rgb(255, 118, 216)',
  'Video Games': 'rgb(185, 109, 255)',
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

  useFocusEffect(
  useCallback(() => {
    setSelectedTask(null); // reset selected task whenever screen is focused
  }, [])
);

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
    const iconName = categoryIcons[item.category];
    const iconColorDark = categoryColorsDark[item.category]
    const iconColorLight = categoryColorsLight[item.category]
    return (
      <View
        style={{
          shadowColor: iconColorDark,
          shadowOpacity: 0.6,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6, // Android shadow
          borderRadius: 10, // match TouchableOpacity
          marginBottom: 12,
        }}
      >
      <TouchableOpacity
        style={{
          borderColor: iconColorLight,
          borderWidth: 2,
          height: screenHeight / 5.5,
          width: screenWidth / 2.3,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: '#0a0a0a',
        }}
        onPress={() => {
          handleSelectedCategory({
            id: item.categoryId,
            name: item.category})
        }}
      >
          <View style={{marginTop: 20}}>
            <LinearGradient
              colors={[iconColorLight, iconColorDark]} // bright electric pink gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name={iconName} size={40} color='white' />
            </LinearGradient>
          </View>
          <Text style={{fontSize: 18, fontWeight: 700, color: iconColorLight, paddingBottom: 10}}>{item.category}</Text>
      </TouchableOpacity>
      </View>
    )
  }




  return (
    <>
      <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
        <View style={styles.verticallySpaced}>
          {!selectedTask && (
            <FlatList
              data={categoryArray}
              keyExtractor={(item) => item.categoryId.toString()}
              renderItem={({ item }) => categoryBox(item)}
              scrollEnabled={false}
              numColumns={2} // this makes it a two-column grid
              columnWrapperStyle={{ justifyContent: 'space-around', marginBottom: 12 }}
            />
          )}
          <ModalDropdown
            items={tasks} 
            visible={modalVisibility}
            setVisible={setModalVisibility}
            handleSelectedTask={handleSelectedTask}
            selectedItem={selectedCategory?.name}
            colors={categoryColorsLight}
          />
          {selectedTask && (
            <>
            <View style={{alignItems: 'flex-start'}}>
              <Button
                title='Back'
                onPress={() => setSelectedTask(null)}
              />
            </View>
            <View style={{ height: screenHeight/2, justifyContent: 'center' }}>
              <Text style={styles.taskTitle}>{selectedTask.name}</Text>
              <TextInput
                style={styles.textInput}
                value={comment ? comment : ''}
                onChangeText={setComment} 
                placeholder='Comment'
                placeholderTextColor='grey'
                onBlur={Keyboard.dismiss}
                multiline={true}
              />
              <View style={styles.postButton}>
                <Button
                  title='Post'
                  onPress={submitPost}
                />
              </View>
            </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#0a0a0a', //'#353567',
    flexDirection: 'column',
    paddingTop: 75,
  },
  categoryBox: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  iconCircle: {
    borderRadius: 100,
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  postButton: {
    padding: 10
  },
  taskTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'white',
    padding: 10,
    borderRadius: 4,
    color: 'white'
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    alignItems: 'center',
  },
})