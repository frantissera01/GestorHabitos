import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { cargarHabitos } from '../storage/habitStorage';
import { toggleFechaHabito } from '../services/habitService';

export default function HabitCalendar({ habito }) {
  const [completedDates, setCompletedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [habitosDelDia, setHabitosDelDia] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  useEffect(() => {
    if (!habito || !Array.isArray(habito.fechasCompletadas)) return;

    const fechas = {};
    habito.fechasCompletadas.forEach(fecha => {
      fechas[fecha] = {
        marked: true,
        dotColor: '#00adf5',
        selectedColor: '#e0f7fa',
      };
    });

    setCompletedDates(fechas);
  }, [habito]);

  const manejarPresionDia = async (day) => {
    const fecha = day.dateString;
    setFechaSeleccionada(fecha);

    try {
      const habitos = await cargarHabitos();
      const cumplidos = habitos.filter(h =>
        Array.isArray(h.fechas) && h.fechas.includes(fecha)
      );

      setHabitosDelDia(cumplidos);
      const fechasTotales = {};
        habitos.forEach(h => {
          (h.fechasCompletadas || []).forEach(f => {
            fechasTotales[f] = {
              marked: true,
              dotColor: '#00adf5',
              selectedColor: '#e0f7fa',
            };
          });
        });

        setCompletedDates(fechasTotales);
        setModalVisible(true);
    } catch (error) {
      console.error('Error al cargar hábitos del día:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calendario de hábitos</Text>

      <Calendar
        markedDates={completedDates}
        onDayPress={manejarPresionDia}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          todayTextColor: '#00adf5',
          arrowColor: '#00adf5',
        }}
      />

      {/* Modal para mostrar hábitos cumplidos */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Hábitos cumplidos el {fechaSeleccionada}
            </Text>
            {habitosDelDia.length > 0 ? (
              habitosDelDia.map((h, index) => (
                <Text key={index} style={styles.habitoTexto}>• {h.nombre}</Text>
              ))
            ) : (
              <Text style={styles.habitoTexto}>No se cumplió ningún hábito.</Text>
            )}
            <Pressable
              style={styles.botonCerrar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#fff' }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  habitoTexto: {
    fontSize: 16,
    marginVertical: 2,
  },
  botonCerrar: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
