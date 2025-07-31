import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import HabitCalendar from './screens/HabitCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    const limpiarDatos = async () => {
      await AsyncStorage.clear();
      console.log('🧹 Datos limpiados de AsyncStorage');
    };

    limpiarDatos();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Calendario" component={HabitCalendar} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
