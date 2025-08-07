import AsyncStorageModule from '@react-native-async-storage/async-storage';
const AsyncStorage = AsyncStorageModule.default ?? AsyncStorageModule;
const STORAGE_KEY = '@habitos';

export const guardarHabitos = async (habitos) => {
  try {
    if (!Array.isArray(habitos)) {
      console.error('guardarHabitos: parámetro no es un array:', habitos);
      return; // Salir sin intentar guardar
    }

    const datosConFechas = habitos.map((h) => ({
      ...h,
      fechasCompletadas: h.fechasCompletadas || [],
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
       fechasCompletadas: h.fechasCompletadas || [],
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error al cargar hábitos:', error);
    return [];
  }
};

