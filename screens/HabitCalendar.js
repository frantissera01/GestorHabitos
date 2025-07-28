import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { cargarHabitos } from '../storage/habitStorage';
import { toggleFechaHabito } from '../services/habitService';
import { calcularRacha } from '../utils/habitUtils';

export default function HabitCalendar() {
  const [completedDates, setCompletedDates] = useState({});
  const [racha, setRacha] = useState(0);

  useEffect(() => {
    if (!habito || !Array.isArray(habito.fechas)) return;

    const fechas = {};
    habito.fechas.forEach(fecha => {
      fechas[fecha] = {
        marked: true,
        dotColor: '#00adf5',
        selectedColor: '#e0f7fa',
      };
    });

    setCompletedDates(fechas);
    setRacha(calcularRacha(Object.keys(fechas)));
  }, [habito.fechas]);

  const manejarPresionDia = async (day) => {
    const fecha = day.dateString;

    try {
      const habitos = await cargarHabitos();
      const primerHabito = habitos[0];
      if (!primerHabito) return;

      const habitosActualizados = await toggleFechaHabito(primerHabito.id, fecha);

      const nuevasFechas = {};
      habitosActualizados.forEach(hab => {
        if (Array.isArray(hab.fechas)) {
          hab.fechas.forEach(f => {
            nuevasFechas[f] = {
              marked: true,
              dotColor: '#00adf5',
              selectedColor: '#e0f7fa',
            };
          });
        }
      });

      setCompletedDates(nuevasFechas); // ✅ actualiza el estado
      setRacha(calcularRacha(Object.keys(nuevasFechas || {}))); // ✅ usa nuevasFechas
    } catch (error) {
      console.error('Error al alternar fecha del hábito:', error);
    }
  };


  // ✅ JSX que renderiza el calendario y la racha
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calendario de hábitos</Text>
      <Text style={styles.racha}>🔥 Racha actual: {racha}</Text>

      <Calendar
        markedDates={completedDates}
        onDayPress={manejarPresionDia}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8
  },
  racha: {
    fontSize: 18,
    marginBottom: 16,
    color: '#f57c00'
  }
});
