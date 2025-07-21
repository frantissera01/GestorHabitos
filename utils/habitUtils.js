export const calcularRacha = (fechasCompletadas) => {
  if (!fechasCompletadas || fechasCompletadas.length === 0) return 0;

  const fechas = fechasCompletadas
    .map(f => new Date(f))
    .sort((a, b) => b - a);

  let racha = 0;
  let fechaActual = new Date();

  for (let i = 0; i < fechas.length; i++) {
    const diff = Math.floor((fechaActual - fechas[i]) / (1000 * 60 * 60 * 24));
    if (diff === 0 || diff === racha) {
      racha++;
      fechaActual.setDate(fechaActual.getDate() - 1);
    } else {
      break;
    }
  }

  return racha;
};
