import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const HabitModal = ({ visible, onClose, onGuardar, habitToEdit }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState({});
  const [diasSemanaSeleccionados, setDiasSemanaSeleccionados] = useState([]);
  const [repeticion, setRepeticion] = useState('1');

  useEffect(() => {
    if (habitToEdit) {
      setNombre(habitToEdit.nombre || '');
      setDescripcion(habitToEdit.descripcion || '');
      setFechasSeleccionadas(habitToEdit.fechasSeleccionadas || {});
      setDiasSemanaSeleccionados(habitToEdit.diasSemanaSeleccionados || []);
      setRepeticion(String(habitToEdit.repeticion || 1));
    } else {
      setNombre('');
      setDescripcion('');
      setFechasSeleccionadas({});
      setDiasSemanaSeleccionados([]);
      setRepeticion('1');
    }
  }, [habitToEdit]);

  const hoy = new Date();
  const fecha30 = new Date();
  fecha30.setDate(hoy.getDate() + 30);

  const toggleDiaSemana = (dia) => {
    if (diasSemanaSeleccionados.includes(dia)) {
      setDiasSemanaSeleccionados(diasSemanaSeleccionados.filter(d => d !== dia));
    } else {
      setDiasSemanaSeleccionados([...diasSemanaSeleccionados, dia]);
    }
  };

  const toggleFechaCalendario = (fecha) => {
    setFechasSeleccionadas(prev => {
      const nuevas = { ...prev };
      if (nuevas[fecha]) {
        delete nuevas[fecha];
      } else {
        nuevas[fecha] = {
          marked: true,
          dotColor: '#00adf5',
          selectedColor: '#e0f7fa',
        };
      }
      return nuevas;
    });
  };

  const handleGuardar = () => {
    if (!nombre.trim()) return;

    onGuardar({
      nombre,
      descripcion,
      fechasSeleccionadas,
      diasSemanaSeleccionados,
      repeticion: parseInt(repeticion)
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContenido}>
          <ScrollView>
            <Text style={styles.titulo}>
              {habitToEdit ? 'Editar hábito' : 'Nuevo hábito'}
            </Text>

            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre del hábito"
              maxLength={30}
              style={styles.input}
            />

            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción"
              multiline
              style={[styles.input, { height: 60 }]}
            />

            {/* 📅 Calendario */}
            <Text style={styles.label}>Seleccioná fechas específicas (hasta 30 días desde hoy):</Text>
            <Calendar
              markingType={'multi-dot'}
              markedDates={fechasSeleccionadas}
              onDayPress={(day) => toggleFechaCalendario(day.dateString)}
              minDate={hoy.toISOString().split('T')[0]}
              maxDate={fecha30.toISOString().split('T')[0]}
            />

            {/* ✅ Checkboxes días de semana */}
            <Text style={styles.label}>Seleccioná días de la semana:</Text>
            <View style={styles.diasContainer}>
              {diasSemana.map((dia, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.diaItem,
                    diasSemanaSeleccionados.includes(dia) && styles.diaSeleccionado
                  ]}
                  onPress={() => toggleDiaSemana(dia)}
                >
                  <Text>{dia}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 🔁 Picker de repetición */}
            <Text style={styles.label}>¿Cuántas veces por día?</Text>
            <Picker
              selectedValue={repeticion}
              onValueChange={(itemValue) => setRepeticion(itemValue)}
              style={styles.picker}
            >
              {[...Array(10).keys()].map((num) => (
                <Picker.Item key={num + 1} label={`${num + 1}`} value={String(num + 1)} />
              ))}
            </Picker>

            {/* 🧭 Botones */}
            <View style={styles.botones}>
              <Button title="Cancelar" onPress={onClose} />
              <Button title="Guardar" onPress={handleGuardar} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
    label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default HabitModal;
