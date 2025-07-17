import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
