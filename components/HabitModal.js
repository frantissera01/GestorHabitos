import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Checkbox from 'expo-checkbox';
import Slider from '@react-native-community/slider';

const daysOfWeek = [
  { label: 'Lun', value: 'mon' },
  { label: 'Mar', value: 'tue' },
  { label: 'Mié', value: 'wed' },
  { label: 'Jue', value: 'thu' },
  { label: 'Vie', value: 'fri' },
  { label: 'Sáb', value: 'sat' },
  { label: 'Dom', value: 'sun' },
];

export default function HabitModal({ visible, onSave, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [range, setRange] = useState({ startDate: null, endDate: null });
  const [selectedDays, setSelectedDays] = useState([]);
  const [repeticiones, setRepeticiones] = useState(1);

  const handleDayPress = day => {
    if (!range.startDate || (range.startDate && range.endDate)) {
      setRange({ startDate: day.dateString, endDate: null });
    } else {
      setRange({ ...range, endDate: day.dateString });
    }
  };

  const toggleDay = val => {
    setSelectedDays(prev =>
      prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val]
    );
  };

  const handleSave = () => {
    if (!nombre.trim()) return;
    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fechas: range.startDate && range.endDate ? [range.startDate, range.endDate] : [],
      dias: selectedDays,
      repeticiones,
    });
    // reset
    setNombre('');
    setDescripcion('');
    setRange({ startDate: null, endDate: null });
    setSelectedDays([]);
    setRepeticiones(1);
  };

  if (!visible) return null;

  const marked = {};
  if (range.startDate) marked[range.startDate] = { startingDay: true, color: '#70d7c7' };
  if (range.endDate) marked[range.endDate] = { endingDay: true, color: '#70d7c7' };
  if (range.startDate && range.endDate) {
    let cur = new Date(range.startDate);
    const end = new Date(range.endDate);
    while (cur < end) {
      const iso = cur.toISOString().split('T')[0];
      if (iso !== range.startDate && iso !== range.endDate) marked[iso] = { color: '#d0f0e1' };
      cur.setDate(cur.getDate() + 1);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre del hábito"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción (opcional)"
        multiline
      />

      <Text style={styles.label}>Rango de fechas</Text>
      <Calendar
        markingType="period"
        markedDates={marked}
        onDayPress={handleDayPress}
      />

      <Text style={styles.label}>Días de la semana</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map(day => (
          <View key={day.value} style={styles.checkboxRow}>
            <Checkbox
              value={selectedDays.includes(day.value)}
              onValueChange={() => toggleDay(day.value)}
            />
            <Text style={styles.checkboxLabel}>{day.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.label}>Repeticiones por día: {repeticiones}</Text>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={repeticiones}
        onValueChange={setRepeticiones}
      />

      <View style={styles.buttonRow}>
        <Button title="Cancelar" onPress={onCancel} />
        <Button title="Guardar" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  label: { marginTop: 12, fontWeight: 'bold', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4, marginTop: 4 },
  daysContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', width: '33%', marginVertical: 4 },
  checkboxLabel: { marginLeft: 8, fontSize: 14 },
  slider: { width: '100%', height: 40, marginVertical: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
});
