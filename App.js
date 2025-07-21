import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import HomeScreen from './screens/HomeScreen';
import HabitCalendar from './screens/HabitCalendar';
import { useEffect } from 'react';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const pedirPermisos = async () => {
      if (__DEV__) return; 
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Necesitamos permisos para enviar notificaciones.');
      }
    };
    pedirPermisos();
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
