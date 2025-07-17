import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { cargarHabitos } from '../storage/habitStorage';

export default function HabitCalendar() {
  const [completedDates, setCompletedDates] = useState({});

  useEffect(() => {
    const cargarFechas = async () => {
      try {
        const habitos = await cargarHabitos();
        const fechas = {};

        habitos.forEach(habito => {
          if (Array.isArray(habito.fechasCompletadas)) {
            habito.fechasCompletadas.forEach(fecha => {
              fechas[fecha] = {
                marked: true,
                dotColor: '#00adf5',
                selectedColor: '#e0f7fa',
              };
            });
          }
        });

        setCompletedDates(fechas);
      } catch (error) {
        console.error('Error al cargar fechas de hábitos:', error);
      }
    };

    cargarFechas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calendario de Hábitos</Text>
      <Calendar
        onDayPress={(day) => {
          console.log('Día seleccionado', day.dateString);
        }}
        markedDates={completedDates}
        theme={{
          selectedDayBackgroundColor: '#e0f7fa',
          dotColor: '#00adf5',
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
    marginBottom: 16
  }
});
