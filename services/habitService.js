// services/HabitService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureDefaultProfile } from './ProfileService';

const KEY = '@habits_store_v1';
const normalize = (list) => (Array.isArray(list) ? list : [])
  .map(h => ({ completedDates: Array.isArray(h?.completedDates) ? h.completedDates : [], ...h }));

export async function getHabits() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    let list = normalize(data);
    const defaultId = await ensureDefaultProfile();
    let mutated = false;
    list = list.map(h => (h.profileId ? h : (mutated = true, { ...h, profileId: defaultId })));
    if (mutated) await AsyncStorage.setItem(KEY, JSON.stringify(list));
    return list;
  } catch { return []; }
}
export async function saveHabits(list) {
  try { const data = normalize(list); await AsyncStorage.setItem(KEY, JSON.stringify(data)); return data; }
  catch { return null; }
}
export async function addHabit(item) {
  const list = await getHabits();
  const defaultId = await ensureDefaultProfile();
  const newItem = { completedDates: [], profileId: item.profileId || defaultId, ...item };
  const next = [...list, newItem];
  await saveHabits(next);
  return next;
}
export async function updateHabit(id, patch) {
  const list = await getHabits();
  const idx = list.findIndex(h => String(h.id) === String(id));
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch };
  const next = [...list]; next[idx] = updated;
  await saveHabits(next);
  return updated;
}
export async function removeHabit(id) {
  const list = await getHabits();
  const next = list.filter(h => String(h.id) !== String(id));
  await saveHabits(next);
  return next;
}
export async function clearAll() { try { await AsyncStorage.removeItem(KEY); return true; } catch { return false; } }
