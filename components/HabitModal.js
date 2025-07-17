import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, Button, StyleSheet, Text } from 'react-native';


const HabitModal = ({ visible, onClose, onGuardar, habitToEdit }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, SetDescripcion] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setNombre(habitToEdit.nombre);
      SetDescripcion(habitToEdit.nombre);
    } else {
      setNombre('');
      SetDescripcion("");
    }
  }, [habitToEdit]);

  const handleGuardar = () => {
    if (!nombre) return;
    onGuardar({nombre, descripcion});
    
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContenido}>
          <Text style={styles.titulo}>
            {habitToEdit ? 'Editar hábito' : 'Nuevo hábito'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe el hábito..."
            value={nombre}
            onChangeText={setNombre}
            autoFocus={true}
          />
          <View style={styles.botones}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title="Guardar" onPress={handleGuardar} />
          </View>
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
