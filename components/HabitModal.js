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
import { Alert } from 'react-native';
import { guardarHabitos } from '../storage/habitStorage';

const diasSemana = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];

const HabitModal = ({ visible, onClose, onGuardar, habitToEdit }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState({});
  const [diasSemanaSeleccionados, setDiasSemanaSeleccionados] = useState([]);
  const [repeticion, setRepeticion] = useState(1);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [habitos, setHabitos] = useState([]); // ✅ debe ser array


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
    setDiasSemanaSeleccionados(prev => {
      if (prev.includes(dia)) {
        return prev.filter(d => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
  };

  const generarRangoFechas = (inicio, fin) => {
    let fechas = {};
    let fechaActual = new Date(inicio);
    const fechaFinal = new Date(fin);

    while (fechaActual <= fechaFinal) {
      const fechaStr = fechaActual.toISOString().split('T')[0];
      fechas[fechaStr] = {
        color: '#70d7c7',
        textColor: 'white'
      };
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return fechas;
  };


  const seleccionarFechaRango = (fechaSeleccionada) => {
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      // Si no hay inicio o ya hay inicio+fin → reiniciar
      setFechaInicio(fechaSeleccionada);
      setFechaFin(null);
      setFechasSeleccionadas({
        [fechaSeleccionada]: {
          startingDay: true,
          endingDay: true,
          color: '#70d7c7',
          textColor: 'white',
        },
      });
    } else {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaSeleccionada);
      const diffDias = (fin - inicio) / (1000 * 60 * 60 * 24);

      if (diffDias < 0 || diffDias > 30) {
        alert('Seleccioná una fecha válida (máx 30 días desde la inicial)');
        return;
      }

      setFechaFin(fechaSeleccionada);
      
      const rango = generarRangoFechas(fechaInicio, fechaSeleccionada);

      // Marcar explícitamente el inicio y fin
      rango[fechaInicio] = {
        startingDay: true,
        color: '#70d7c7',
        textColor: 'white',
      };
      rango[fechaSeleccionada] = {
        endingDay: true,
        color: '#70d7c7',
        textColor: 'white',
      };

      setFechasSeleccionadas(rango);
    }
  };


  const handleGuardar = () => {
    if (!nombre.trim()) {
      Alert.alert("Falta el nombre", "Por favor ingresá el nombre del hábito.");
      return;
    }

    const descripcionFinal = descripcion.trim() || 'Sin descripción';
    const hayRango = false;
    const hayDias = diasSemanaSeleccionados && diasSemanaSeleccionados.length > 0;
    const hayRepeticion = repeticion && repeticion !== '1'; // Asumimos '1' como default

    if (!hayRango && !hayDias && !hayRepeticion) {
      Alert.alert(
        "Info del hábito",
        "No seleccionaste días, rango ni repeticiones.\n\nSe tomará como hábito diario, una vez por día.",
        [
          {
            text: "Aceptar",
            onPress: () => {
              guardarHabitos({
                nombre,
                descripcion: descripcionFinal,
                fechas: [],
                dias: [],
                repeticion: '1',
              });
            },
          },
          {
            text: "Cancelar",
            style: "cancel",
          },
        ]
      );
      return;
    }

    // Armar resumen para confirmación
    const resumen = `Nombre: ${nombre}
  Descripción: ${descripcionFinal}
  Días: ${hayDias ? diasSeleccionados.join(', ') : 'No definido'}
  Repetición: ${repeticion || '1'} veces por día`;

    Alert.alert(
      "Confirmar hábito",
      resumen,
      [
        {
          text: "Guardar",
          onPress: () => {
            const fechasArray = Object.keys(fechasSeleccionadas);

            if (fechasArray.length > 30) {
              alert('No podés seleccionar más de 30 días.');
              return;
            }

            const nuevoHabito = {
              nombre,
              descripcion: descripcionFinal,
              fechas: fechasArray,
              diasSemana: diasSemanaSeleccionados,
              repeticion,
            };

            if (habitToEdit) {
              actualizarHabito(habitToEdit.id, nuevoHabito);
            } else {
              guardarHabitos(nuevoHabito);
            }

            onClose();
            limpiarCampos();
          },
        },
        {
          text: "Cancelar",
          style: "cancel",
        }
      ]
    ); // <-- cierre del segundo Alert.alert

  }; // <-- cierre de handleGuardar


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
              placeholderTextColor="#888" 
              maxLength={12}
              style={styles.input}
            />
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
              {nombre.length}/12
            </Text>

            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Descripción"
              placeholderTextColor="#888"
              maxLength={30} 
              multiline
              style={[styles.input, { height: 50 }]}
            />
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'right' }}>
              {descripcion.length}/30
            </Text>



            {/* 📅 Calendario */}
            <Text style={styles.label}>Seleccioná un rango de fechas (hasta 30 días desde hoy):</Text>

            <TouchableOpacity
              onPress={() => setMostrarCalendario(!mostrarCalendario)}
              style={styles.botonCalendario}
            >
              <Text style={{ color: '#007bff' }}>
                {mostrarCalendario ? 'Ocultar calendario' : 'Mostrar calendario'}
              </Text>
            </TouchableOpacity>

            {mostrarCalendario && (
              <Calendar
                markingType={'period'}
                markedDates={fechasSeleccionadas}
                onDayPress={(day) => seleccionarFechaRango(day.dateString)}
                minDate={hoy.toISOString().split('T')[0]}
                maxDate={fecha30.toISOString().split('T')[0]}
              />
            )}


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
                  <Text style={[
                    styles.diaTexto,
                    diasSemanaSeleccionados.includes(dia) && styles.diaTextoSeleccionado
                  ]}>
                    {dia}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>


            {/* 🔁 Picker de repetición */}
            <Text style={styles.label}>¿Cuántas veces por día?</Text>

            <View style={styles.contadorContainer}>
              <TouchableOpacity
                onPress={() => setRepeticion(prev => Math.max(1, prev - 1))}
                style={styles.botonContador}
              >
                <Text style={styles.botonTexto}>−</Text>
              </TouchableOpacity>

              <Text style={styles.repeticionTexto}>{repeticion}</Text>

              <TouchableOpacity
                onPress={() => setRepeticion(prev => Math.min(10, prev + 1))}
                style={styles.botonContador}
              >
                <Text style={styles.botonTexto}>+</Text>
              </TouchableOpacity>
            </View>


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
    borderBottomColor: '#aaa',
    marginBottom: 15,
    fontSize: 16,
    color: '#000', // 👈 Asegura que el texto sea negro (o el que quieras)
    paddingVertical: 4,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginVertical: 10,
  },
  botonCalendario: {
    marginVertical: 10,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 8,
  },
  diaItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  diaSeleccionado: {
    backgroundColor: '#4CAF50',
    borderColor: '#388E3C',
  },
  diaTexto: {
    color: '#333',
    fontWeight: '500',
  },
  diaTextoSeleccionado: {
    color: 'white',
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  botonContador: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  botonTexto: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  repeticionTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  }

});

export default HabitModal;
