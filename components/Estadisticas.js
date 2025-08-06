import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { cargarHabitos } from '../storage/habitStorage';

export default function Estadistica() {
  const [habitos, setHabitos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const datos = await cargarHabitos();
      setHabitos(datos);
    };
    cargar();
  }, []);

  const totalCompletados = habitos.reduce((acc, hab) => {
    return acc + (Array.isArray(hab.fechasCompletadas) ? hab.fechasCompletadas.length : 0);
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Estadísticas</Text>
      <Text style={styles.texto}>Total de hábitos: {habitos.length}</Text>
      <Text style={styles.texto}>Total de completados: {totalCompletados}</Text>

      <FlatList
        data={habitos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.count}>
              Completados: {item.fechasCompletadas?.length || 0}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  texto: {
    fontSize: 16,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  nombre: {
    fontSize: 16,
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
});
