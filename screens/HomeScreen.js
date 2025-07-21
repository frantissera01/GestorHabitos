import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

import HabitItem from '../components/HabitItem';
import HabitModal from '../components/HabitModal';
import HabitCalendar from './HabitCalendar';

import {
  agregarHabito,
  eliminarHabito,
  editarHabito,
  marcarCompletado,
} from '../services/habitService';
import { cargarHabitos, guardarHabitos } from '../storage/habitStorage';

export default function HomeScreen() {
  const [habitos, setHabitos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar hábitos
  const cargarYSetHabitos = async () => {
    try {
      setLoading(true);
      const cargados = await cargarHabitos();
      setHabitos(cargados);
      setError(null);
    } catch (e) {
      setError('Error al cargar hábitos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarYSetHabitos();
  }, []);

  // Guardar hábito nuevo o editado
  const guardarHabito = async (texto) => {
    try {
      if (habitToEdit) {
        const actualizados = await editarHabito(habitToEdit.id, texto);
        setHabitos(actualizados);
      } else {
        const actualizados = await agregarHabito(texto);
        setHabitos(actualizados);
      }
      setModalVisible(false);
      setHabitToEdit(null);
    } catch (e) {
      setError('Error al guardar hábito');
    }
  };

  // Eliminar hábito
  const handleEliminarHabito = async (id) => {
    try {
      const actualizados = await eliminarHabito(id);
      setHabitos(actualizados);
    } catch (e) {
      setError('Error al eliminar hábito');
    }
  };

  const handleAgregarHabito = async (nuevoHabito) => {
    if (habitToEdit) {
      const nuevosHabitos = habitos.map((h) =>
        h.id==habitToEdit.id ? {...h, ...nuevoHabito } : h
      );
      setHabitos (nuevosHabitos);
      await guardarHabitos(nuevosHabitos);
    } else {
      const nuevo = {
        ...nuevoHabito,
        id:Date.now(),
        completado:false,
      };
      const nuevosHabitos = [...habitos, nuevo];
      setHabitos(nuevosHabitos);
      await guardarHabitos (nuevosHabitos);
    }
    setHabitToEdit(null);
    setModalVisible(false);
  };

  // Toggle completado
  const handleToggleCompletado = (id) => {
    const hoy = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

    const nuevosHabitos = habitos.map((habito) => {
      if (habito.id === id) {
        const yaMarcado = habito.fechas?.includes(hoy);

        return {
          ...habito,
          fechas: yaMarcado
            ? habito.fechas.filter((f) => f !== hoy) // si ya estaba, lo quitamos
            : [...(habito.fechas || []), hoy],       // si no estaba, lo agregamos
        };
      }
      return habito;
    });

    setHabitos(nuevosHabitos);
    guardarHabitos(nuevosHabitos); // persistir
  };


  // Abrir modal nuevo o editar
  const abrirModalNuevo = () => {
    setHabitToEdit(null);
    setModalVisible(true);
  };
  const abrirModalEditar = (habito) => {
    setHabitToEdit(habito);
    setModalVisible(true);
  };

  return (
    <FlatList
      data={habitos}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <HabitItem
          habito={item}
          onToggle={handleToggleCompletado}
          onEditar={abrirModalEditar}
          onEliminar={handleEliminarHabito}
        />
      )}
      ListHeaderComponent={
        <>
          <Text style={styles.titulo}>Mis hábitos</Text>

          <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalNuevo}>
            <Text style={styles.textoBoton}>+ Agregar hábito</Text>
          </TouchableOpacity>

          {loading && <Text>Cargando hábitos...</Text>}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}
          {!loading && !error && habitos.length === 0 && (
            <Text>No hay hábitos registrados.</Text>
          )}
        </>
      }
      ListFooterComponent={
        <>
          <HabitModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onGuardar={handleAgregarHabito}
            habitToEdit={habitToEdit}
          />

          <View style={{ minHeight: 300, marginTop: 20 }}>
            <HabitCalendar habitos={habitos} />
          </View>
        </>
      }

      contentContainerStyle={styles.container}
    />
  );

}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f2f2a2',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  botonAgregar: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lista: {
    maxHeight: 300,
    marginBottom: 20,
  },
});
