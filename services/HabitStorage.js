import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'HABITS';

export const loadHabits = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error loading habits:', e);
    return [];
  }
};

export const saveHabits = async habits => {
  try {
    const json = JSON.stringify(habits);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.error('Error saving habits:', e);
  }
};

