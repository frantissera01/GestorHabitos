import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const programarNotificacionDiaria = async (habitoNombre, hora = '20:00') => {
  if (__DEV__) return; // Evita programar notificaciones en modo desarrollo

  const [hour, minute] = hora.split(':').map(Number);

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de hábito',
        body: `¿Completaste "${habitoNombre}" hoy?`,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (error) {
    console.log('No se pudo programar la notificación:', error);
  }
};
