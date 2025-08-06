import { v4 as uuidv4 } from 'uuid';
import { cargarHabitos, guardarHabitos } from '../storage/habitStorage';

// Crear hábito nuevo
export const agregarHabito = async(nombre, descripcion = '', fechaLimite = null, diasSemanaSeleccionados = [], repeticion = 1) => {
  const habitos = await cargarHabitos();
  const nuevo = {
    id: uuidv4(),
    nombre,
    descripcion,
    completado: false,
    fechasCompletadas: [],
    fechaLimite,
    diasSemanaSeleccionados, // Ej: ['Lunes', 'Miércoles']
    repeticion,      
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
export const editarHabito = async(id, nuevoNombre, nuevaDescripcion, nuevaFechaLimite, nuevosDias, nuevaRepeticion) => {
  const habitos = await cargarHabitos();
  const actualizados = habitos.map(h =>
    h.id === id
      ? { ...h,
          nombre: nuevoNombre,
          descripcion: nuevaDescripcion,
          fechaLimite: nuevaFechaLimite,
          diasSemanaSeleccionados: nuevosDias,
          repeticion: nuevaRepeticion
        }
      : h
  );
  await guardarHabitos(actualizados);
  return actualizados;
};

// Marcar hábito como completado
export const marcarCompletado = async (id) => {
  const habitos = await cargarHabitos();
  const actualizados = habitos.map(h =>
    h.id === id ? { ...h, completado: !h.completado } : h
  );
  await guardarHabitos(actualizados);
  return actualizados;
};

// Toggle fecha específica
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
