import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HabitItem({ habit }) {
  const { nombre, descripcion, fechas, dias, repeticiones } = habit;
  return (
    <View style={itemStyles.container}>
      <Text style={itemStyles.title}>{nombre}</Text>
      {descripcion ? <Text>{descripcion}</Text> : null}
      {fechas.length === 2 && (
        <Text>
          {fechas[0]} → {fechas[1]}
        </Text>
      )}
      {dias.length > 0 && <Text>Días: {dias.join(', ')}</Text>}
      <Text>Repeticiones/día: {repeticiones}</Text>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  container: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: 'bold' },
});