import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// HabitItem.js
import moment from 'moment';

// Calcula cuántos días seguidos se ha completado un hábito
const calcularRacha = (fechasCompletadas) => {
  const hoy = moment().startOf('day');
  let racha = 0;

  // Ordenar por fecha descendente
  const fechasOrdenadas = fechasCompletadas
    .map(f => moment(f))
    .sort((a, b) => b.diff(a));

  for (let i = 0; i < fechasOrdenadas.length; i++) {
    const diferencia = hoy.diff(fechasOrdenadas[i], 'days');

    if (diferencia === i) {
      racha++;
    } else {
      break;
    }
  }

  return racha;
};


const HabitItem = ({ habito, onEditar, onEliminar, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onToggle(habito.id)}
        style={styles.nombreContainer}
        testID={`toggle-${habito.id}`}
      >
        <Text style={[styles.nombre, habito.completado && styles.completado]}>
          {habito.texto}
        </Text>
         <Text style={styles.racha}>
          🔥 Racha: {calcularRacha(habito.fechas || [])} días
        </Text>
      </TouchableOpacity>

      <View style={styles.acciones}>
        <TouchableOpacity onPress={() => onEditar(habito)}>
          <Ionicons name="create-outline" size={20} color="#4caf50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEliminar(habito.id)} style={styles.botonEliminar}>
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  racha: {
    fontSize: 14,
    color: 'orange',
    marginTop: 4
  },
  nombreContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    color: '#333',
  },
  completado: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  acciones: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  botonEliminar: {
    marginLeft: 10,
  },
});

export default HabitItem;
