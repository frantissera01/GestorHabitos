import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@habitos';

export const guardarHabitos = async (habitos) => {
  try {
    const json = JSON.stringify(habitos);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Error al guardar hábitos:', error);
    throw error;
  }
};

export const cargarHabitos = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Error al cargar hábitos:', error);
    return [];
  }
};
