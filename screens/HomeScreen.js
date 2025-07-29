import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal
} from 'react-native';

import { calcularRacha } from '../utils/habitUtils';
import HabitItem from '../components/HabitItem';
import HabitModal from '../components/HabitModal';
import HabitCalendar from './HabitCalendar';
import { eliminarHabito } from '../services/habitService';
import { guardarHabitos, cargarHabitos } from '../storage/habitStorage';

export default function HomeScreen() {
  const [habitos, setHabitos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [modalAgruparVisible, setModalAgruparVisible] = useState(false);
  const [modoAgrupacion, setModoAgrupacion] = useState('hoy');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);



  // Cargar hábitos
  const cargarYSetearHabitos = async () => {
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
    cargarYSetearHabitos();
  }, []);
  
  // Eliminar hábito
  const handleEliminarHabito = async (id) => {
    try {
      const actualizados = await eliminarHabito(id);
      setHabitos(actualizados);
    } catch (e) {
      console.error('Error al eliminar hábito:', e);
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
        id: Date.now(),
        completado: false,
        fechasCompletadas: [],
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
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const nuevosHabitos = habitos.map(habito => {
      if (habito.id === id) {
        const fechasActualizadas = habito.fechas?.includes(hoy)
          ? habito.fechas.filter(fecha => fecha !== hoy) // desmarcar
          : [...(habito.fechas || []), hoy];              // marcar

        return {
          ...habito,
          fechas: fechasActualizadas,
        };
      }
      return habito;
    });

    setHabitos(nuevosHabitos);
    guardarHabitos(nuevosHabitos);
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

  const hoy = new Date().toISOString().split('T')[0];
  let habitosRender = [...habitos];

  if (modoAgrupacion === 'racha') {
    habitosRender.sort((a, b) => calcularRacha(b.fechas || []) - calcularRacha(a.fechas || []));
  } else if (modoAgrupacion === 'nombre') {
    habitosRender.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Mis hábitos</Text>

      <TouchableOpacity
        onPress={() => setModalAgruparVisible(true)}
        style={{ backgroundColor: '#4CAF50', padding: 10, margin: 10, borderRadius: 8 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>📋 Agrupar hábitos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalNuevo}>
        <Text style={styles.textoBoton}>+ Agregar hábito</Text>
      </TouchableOpacity>

      {loading && <Text>Cargando hábitos...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {!loading && !error && habitos.length === 0 && (
        <Text>No hay hábitos registrados.</Text>
      )}

      {modoAgrupacion === 'hoy' ? (
        <>
          <Text style={styles.tituloSeccion}>📗 Completados hoy</Text>
          {habitos.filter(h => h.fechas?.includes(hoy)).map(item => (
            <HabitItem
              key={item.id}
              habito={item}
              onToggle={handleToggleCompletado}
              onEditar={abrirModalEditar}
              onEliminar={handleEliminarHabito}
            />
          ))}

          <Text style={styles.tituloSeccion}>📕 Pendientes hoy</Text>
          {habitos.filter(h => !h.fechas?.includes(hoy)).map(item => (
            <HabitItem
              key={item.id}
              habito={item}
              onToggle={handleToggleCompletado}
              onEditar={abrirModalEditar}
              onEliminar={handleEliminarHabito}
            />
          ))}
        </>
      ) : (
        habitosRender.map(item => (
          <HabitItem
            key={item.id}
            habito={item}
            onToggle={handleToggleCompletado}
            onEditar={abrirModalEditar}
            onEliminar={handleEliminarHabito}
          />
        ))
      )}

      <HabitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGuardar={handleAgregarHabito}
        habitToEdit={habitToEdit}
      />

      <Modal
        visible={modalAgruparVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            gap: 10
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
              Elegí cómo agrupar:
            </Text>

            <TouchableOpacity onPress={() => { setModoAgrupacion('hoy'); setModalAgruparVisible(false); }}>
              <Text>✅ Completados y pendientes de hoy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModoAgrupacion('racha'); setModalAgruparVisible(false); }}>
              <Text>🔥 Por racha (desc)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setModoAgrupacion('nombre'); setModalAgruparVisible(false); }}>
              <Text>🔤 Por nombre (A-Z)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalAgruparVisible(false)}>
              <Text style={{ color: 'red', marginTop: 10 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        onPress={() => setMostrarCalendario(!mostrarCalendario)}
        style={{
          backgroundColor: '#2196F3',
          padding: 10,
          marginHorizontal: 20,
          borderRadius: 8
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {mostrarCalendario ? '⬆️ Ocultar calendario' : '📅 Mostrar calendario'}
        </Text>
      </TouchableOpacity>

      {mostrarCalendario && (
        <View style={{ minHeight: 300, marginTop: 20 }}>
          <HabitCalendar habitos={habitos} />
        </View>
      )}

    </ScrollView>
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
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 15,
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
