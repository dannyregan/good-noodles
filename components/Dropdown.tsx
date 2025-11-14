import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

interface Task {
  base_points: number;
  categories: {
    category: string;
  }
  category_id: number;
  like_points: number;
  task: string;
  task_id: number;
  task_name: string;
}

interface CategoryItem {
  name: string;
  id: number;
}

interface ModalDropdownProps {
  taskData: Task[],
  categories: Record<string, number>,
  handleSelectedCategory: (selected: CategoryItem) => void;
  handleSelectedTask: (selected: CategoryItem) => void;
  placeholder: string,
  selectedItem: string | undefined
}

export const ModalDropdown: React.FC<ModalDropdownProps> = ({ taskData, categories, handleSelectedCategory, handleSelectedTask, placeholder, selectedItem }) => {

  const [isModalVisible, setModalVisible] = useState(false);
  const [categoryNames, setCategoryNames] = useState<CategoryItem[]>([]);
  const [selection, setSelection] = useState<CategoryItem | null>(null);  
  

  useEffect(() => {
    const categoryArray: CategoryItem[] = Object.entries(categories)
      .map(([name, id]) => ({ name, id }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCategoryNames(categoryArray);
    setSelection(null);
  }, [categories]);

  useEffect(() => {
    if (!selectedItem) {
      setSelection(null);
    }
  }, [selectedItem]);

   const toggleModal = () => setModalVisible(!isModalVisible);

  const handleSelect = (item: CategoryItem) => {
    setSelection(item);
    toggleModal();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>
          {selection ? selection.name : (placeholder)}
        </Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <FlatList
              data={categoryNames}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    if (placeholder === 'Category') {
                      handleSelectedCategory(item)
                    } else {
                      handleSelectedTask(item)
                    }
                    handleSelect(item)
                  }
                  }
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
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