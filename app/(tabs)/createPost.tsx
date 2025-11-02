import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Text } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { ModalDropdown } from '../../components/Dropdown'

export default function Feed() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [categoryDict, setCategoryDict] = useState<Record<string, number>>({});
  const tempDict: Record<string, number> = {}

  const onSelect = () => {
    return 
  }

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

  return (
    <View style={styles.container}>
      <View style={styles.verticallySpaced}>
        <Text>Choose your category.</Text>
        <ModalDropdown taskData={taskInfo} categories={categoryDict} onSelectCategory={(task) => console.log(task)}/>
        <Text>Choose your task.</Text>
        <Text>Add your comment.</Text>
        <Text>-Post Button-</Text>
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