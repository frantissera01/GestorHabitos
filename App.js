import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, FlatList, Button, Modal, StyleSheet, Text } from 'react-native';
import HabitModal from './components/HabitModal';
import HabitItem from './components/HabitItem';
import HabitCalendar from './screens/HabitCalendar';
import * as HabitService from './services/HabitService';

export default function App() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRange, setCurrentRange] = useState({ startDate: null, endDate: null });

  useEffect(() => { loadHabits(); }, []);

  const loadHabits = async () => {
    const data = await HabitService.getHabits();
    setHabits(data);
  };

  const handleSave = async habit => {
    const item = { id: Date.now().toString(), ...habit };
    const updated = await HabitService.addHabit(item);
    setHabits(updated);
    setModalVisible(false);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text>No hay hábitos. Agregá uno para comenzar.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={<HabitCalendar onRangeChange={setCurrentRange} />}
        data={habits.filter(h => {
          if (!currentRange.startDate || !currentRange.endDate) return true;
          return (
            new Date(h.fechas[0]) >= new Date(currentRange.startDate) &&
            new Date(h.fechas[1]) <= new Date(currentRange.endDate)
          );
        })}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <HabitItem habit={item} />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={habits.length === 0 && styles.flatEmpty}
      />
      <View style={styles.buttonContainer}>
        <Button title="Agregar Hábito" onPress={() => setModalVisible(true)} />
      </View>
      <Modal visible={modalVisible} animationType="slide">
        <HabitModal visible={modalVisible} onSave={handleSave} onCancel={() => setModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  buttonContainer: { padding: 16, backgroundColor: '#fff' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  flatEmpty: { flexGrow: 1 },
});