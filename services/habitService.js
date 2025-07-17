import { v4 as uuidv4 } from 'uuid';
import { cargarHabitos, guardarHabitos } from '../storage/habitStorage';

// Crear hábito nuevo
export const agregarHabito = async (texto) => {
  const habitos = await cargarHabitos();
  const nuevo = {
    id: uuidv4(),
    nombre: texto,
    completado: false,
    fechasCompletadas: [],
  };
  const actualizados = [...habitos, nuevo];
  await guardarHabitos(actualizados);
  return actualizados;
};

// Eliminar hábito
export const eliminarHabito = async (id) => {
  const habitos = await cargarHabitos();
  const actualizados = habitos.filter(h => h.id !== id);
  await guardarHabitos(actualizados);
  return actualizados;
};

// Editar hábito
export const editarHabito = async (id, nuevoTexto) => {
  const habitos = await cargarHabitos();
  const actualizados = habitos.map(h =>
    h.id === id ? { ...h, nombre: nuevoTexto } : h
  );
  await guardarHabitos(actualizados);
  return actualizados;
};

// Marcar hábito como completado (simple toggle booleano)
export const marcarCompletado = async (id) => {
  const habitos = await cargarHabitos();
  const actualizados = habitos.map(h =>
    h.id === id ? { ...h, completado: !h.completado } : h
  );
  await guardarHabitos(actualizados);
  return actualizados;
};

// (Opcional) Toggle una fecha específica para un hábito
export const toggleFechaHabito = async (id, fecha) => {
  const habitos = await cargarHabitos();
  const actualizados = habitos.map(h => {
    if (h.id === id) {
      const fechas = h.fechasCompletadas || [];
      const index = fechas.indexOf(fecha);
      if (index >= 0) {
        fechas.splice(index, 1);
      } else {
        fechas.push(fecha);
      }
      return { ...h, fechasCompletadas: fechas };
    }
    return h;
  });
  await guardarHabitos(actualizados);
  return actualizados;
};
