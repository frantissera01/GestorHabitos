import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calcularRacha } from '../utils/habitUtils';
import { ScrollView } from 'react-native';

const HabitItem = ({ habito, onEditar, onEliminar, onToggle }) => {
  const esDeHoy = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return habito.fechasCompletadas?.includes(hoy);
  };

  return (
    <View style={{ flex: 1}}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Text style={styles.nombreTexto}>{habito.nombre}</Text>
      </ScrollView>
      
      <Text style={styles.racha}>
        🔥 Racha: {calcularRacha(habito.fechasCompletadas || [])} días
      </Text>

      <View style={styles.acciones}>
       <TouchableOpacity
          onPress={() => onToggle(habito.id)}
          style={[
            styles.botonCompletar,
            esDeHoy() && styles.botonDesmarcar
          ]}
        >
          <Text style={{color: esDeHoy() ? '#f44336' : '#4CAF50'}}>
            {esDeHoy() ? 'Desmarcar' : 'Completado'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditar(habito)} style={styles.botonEditar}>
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
    flex: 1,
    flexWrap: 'nowrap',
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
    maxWidth: '70%',  // o el % que quieras
    overflow: 'hidden',
  },
  nombreTexto: {
    fontSize: 16,
    paddingRight: 10,
    color: 'black',
  },
  completado: {
    color: '#4CAF50',
  },
  acciones: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  botonCompletar: {
    marginRight: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#d0f0d0',
    borderRadius: 6,
  },
  botonEliminar: {
    marginLeft: 10,
  },
  botonDesmarcar: {
  borderColor: '#f44336',
  borderWidth: 1,
},

});

export default HabitItem;

