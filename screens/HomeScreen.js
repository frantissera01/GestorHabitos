import React, { useState, useEffect } from 'react';
import { View, FlatList, Button, Modal, StyleSheet } from 'react-native';
import HabitModal from '../components/HabitModal';
import HabitItem from '../components/HabitItem';
import * as HabitService from '../services/HabitService';

export default function HomeScreen() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const load = async () => {
    const data = await HabitService.getHabits();
    setHabits(data);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async habit => {
    const updated = await HabitService.addHabit({ id: Date.now().toString(), ...habit });
    setHabits(updated);
    setModalVisible(false);
  };

  return (
    <View style={homeStyles.container}>
      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <HabitItem habit={item} />}
      />
      <Button title="Agregar Hábito" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} animationType="slide">
        <HabitModal visible={modalVisible} onSave={handleSave} onCancel={() => setModalVisible(false)} />
      </Modal>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});