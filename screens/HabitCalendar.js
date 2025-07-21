import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { cargarHabitos } from '../storage/habitStorage';
import { toggleFechaHabito } from '../services/habitService';

export default function HabitCalendar() {
  const [completedDates, setCompletedDates] = useState({});
  const [racha, setRacha] = useState(0);

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
        calcularRacha(Object.keys(fechas));
      } catch (error) {
        console.error('Error al cargar fechas de hábitos:', error);
      }
    };

    cargarFechas();
  }, []);

  const calcularRacha = (fechasCompletadas) => {
    const fechasOrdenadas = fechasCompletadas.sort().reverse();
    let rachaTemp = 0;
    let hoy = new Date();
    let diaAnterior = new Date(hoy);

    for (let i = 0; i < fechasOrdenadas.length; i++) {
      const fechaActual = new Date(fechasOrdenadas[i]);
      const diff = Math.floor((diaAnterior - fechaActual) / (1000 * 60 * 60 * 24));

      if (diff === 0 || diff === 1) {
        rachaTemp++;
        diaAnterior = new Date(fechaActual);
      } else {
        break;
      }
    }

    setRacha(rachaTemp);
  };

  const manejarPresionDia = async (day) => {
    const fecha = day.dateString;

    const habitos = await cargarHabitos();
    const primerHabito = habitos[0];
    if (!primerHabito) return;

    const habitosActualizados = await toggleFechaHabito(primerHabito.id, fecha);

    const nuevasFechas = {};
    habitosActualizados.forEach(hab => {
      if (Array.isArray(hab.fechasCompletadas)) {
        hab.fechasCompletadas.forEach(f => {
          nuevasFechas[f] = {
            marked: true,
            dotColor: '#00adf5',
            selectedColor: '#e0f7fa',
          };
        });
      }
    });

    setCompletedDates(nuevasFechas);
    calcularRacha(Object.keys(nuevasFechas));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calendario de Hábitos</Text>
      <Text style={styles.racha}>🔥 Racha actual: {racha} días</Text>
      <Calendar
        markedDates={completedDates}
        onDayPress={manejarPresionDia}
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
