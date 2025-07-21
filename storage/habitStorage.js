import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@habitos';

// Guardar hábitos
export const guardarHabitos = async (habitos) => {
  try {
    const datosConFechas = habitos.map((h) => ({
      ...h,
      fechas: h.fechas || [], // nos aseguramos que cada hábito tenga un array de fechas
    }));

    const json = JSON.stringify(datosConFechas);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Error al guardar hábitos:', error);
  }
};

// Cargar hábitos
export const cargarHabitos = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json !== null) {
      const habitos = JSON.parse(json);
      return habitos.map((h) => ({
        ...h,
        fechas: h.fechas || [], // si no tiene fechas, se inicializa como array vacío
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al cargar hábitos:', error);
    return [];
  }
};

