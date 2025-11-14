import React, { useState, useEffect, useContext } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, TextInput, Text, Button, Alert, ScrollView, Modal, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import { Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { ModalDropdown } from '../../components/Dropdown'
import { SessionContext } from '../../lib/SessionContext';

export default function Feed() {
  const session = useContext(SessionContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, number>>({});
  const [selectedTask, setSelectedTask] = useState<{ id: number; name: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [comment, setComment] = useState<string | null>(null)

  const [categoryDict, setCategoryDict] = useState<Record<string, number>>({});
  const tempDict: Record<string, number> = {}

  if (!session?.user) return null;

  interface Task {
    id: number,
    name: string
  }

  // useEffect(() => {
  //   return
  // }, [tasks])

  const handleSelectedCategory = (task: Task) => {
    setSelectedTask(null);
    setSelectedCategory(task)
    const filteredTasks = taskInfo
      .filter((item) => item.category_id === task.id)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.task] = item.task_id;
        return acc;
      }, {})

    setTasks(filteredTasks);
  }

  const handleSelectedTask = (task: Task) => {
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





  return (
    <>
        <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
          <View style={styles.verticallySpaced}>
            <Text>Choose your category.</Text>
            <ModalDropdown
              taskData={taskInfo} 
              categories={categoryDict} 
              handleSelectedCategory={handleSelectedCategory} 
              handleSelectedTask={handleSelectedCategory}
              placeholder='Category'
              selectedItem={selectedCategory?.name} />
            <Text>Choose your task.</Text>
            <ModalDropdown
              taskData={taskInfo} 
              categories={tasks} 
              handleSelectedCategory={handleSelectedCategory} 
              handleSelectedTask={handleSelectedTask}
              placeholder={selectedTask ? selectedTask.name : 'Task'}
              selectedItem={selectedTask?.name} />
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