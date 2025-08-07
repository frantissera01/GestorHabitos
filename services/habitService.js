import * as storage from './HabitStorage';

export const getHabits = async () => {
  return await storage.loadHabits();
};

export const addHabit = async habit => {
  const list = await storage.loadHabits();
  const updated = [...list, habit];
  await storage.saveHabits(updated);
  return updated;
};

export const updateHabit = async habit => {
  const list = await storage.loadHabits();
  const updated = list.map(h => (h.id === habit.id ? habit : h));
  await storage.saveHabits(updated);
  return updated;
};

export const deleteHabit = async id => {
  const list = await storage.loadHabits();
  const updated = list.filter(h => h.id !== id);
  await storage.saveHabits(updated);
  return updated;
};