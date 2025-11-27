import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { router } from 'expo-router'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


interface CategoryItem {
  name: string;
  id: number;
}

interface ModalDropdownProps {
  items: Record<string, number>,
  visible: boolean;
  setVisible: (v: boolean) => void;
  handleSelectedTask: (selected: CategoryItem) => void;
  selectedItem: string | undefined;
}

type FeedStackParamList = {
  index: undefined;                 // feed main screen
  '/createPost/comment': { };  // user account screen
};

export const ModalDropdown: React.FC<ModalDropdownProps> = ({ 
  items,
  visible,
  setVisible,
  handleSelectedTask, 
  selectedItem
}) => {

  const [isModalVisible, setModalVisible] = useState(false);
  const [categoryNames, setCategoryNames] = useState<CategoryItem[]>([]);
  const [selection, setSelection] = useState<CategoryItem | null>(null);  

  const navigation = useNavigation<StackNavigationProp<FeedStackParamList>>();
  

  useEffect(() => {
    const categoryArray: CategoryItem[] = Object.entries(items)
      .map(([name, id]) => ({ name, id }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCategoryNames(categoryArray);
    setSelection(null);
  }, [items]);

  useEffect(() => {
    if (!selectedItem) {
      setSelection(null);
    }
  }, [selectedItem]);

  const handleSelect = (item: CategoryItem) => {
    setSelection(item);
    setVisible(false);
    router.push('/createPost/comment', { })
  };

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>
          {selection ? selection.name : (placeholder)}
        </Text>
      </TouchableOpacity> */}

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <FlatList
              data={categoryNames}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    handleSelectedTask(item)
                    handleSelect(item)
                  }
                  }
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  button: {
    padding: 15,
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
  },
  closeText: {
    color: "white",
    textAlign: "center",
  },
});