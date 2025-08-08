// services/ProfileService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PROFILES = '@profiles_v1';
const KEY_SELECTED = '@selected_profile_v1';
const palette = ['#f97316', '#ef4444', '#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#64748b'];

export async function getProfiles() {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROFILES);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveProfiles(list) {
  try { await AsyncStorage.setItem(KEY_PROFILES, JSON.stringify(list || [])); } catch {}
}

export async function addProfile({ name, type, color }) {
  const list = await getProfiles();
  const profile = {
    id: Date.now().toString(),
    name: name?.trim() || 'Mi Perfil',
    type: type || 'General',
    color: color || palette[Math.floor(Math.random() * palette.length)],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  await saveProfiles([...list, profile]);
  return profile;
}

export async function updateProfile(id, patch) {
  const list = await getProfiles();
  const idx = list.findIndex(p => String(p.id) === String(id));
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch };
  const next = [...list]; next[idx] = updated;
  await saveProfiles(next);
  return updated;
}

export async function removeProfile(id) {
  const list = await getProfiles();
  const next = list.filter(p => String(p.id) !== String(id));
  await saveProfiles(next);
  const sel = await getSelectedProfileId();
  if (String(sel) === String(id)) await setSelectedProfileId(next[0]?.id || null);
  return next;
}

export async function getSelectedProfileId() {
  try { return await AsyncStorage.getItem(KEY_SELECTED); } catch { return null; }
}
export async function setSelectedProfileId(id) {
  try {
    if (!id) return await AsyncStorage.removeItem(KEY_SELECTED);
    return await AsyncStorage.setItem(KEY_SELECTED, String(id));
  } catch {}
}

export async function ensureDefaultProfile() {
  const list = await getProfiles();
  if (list.length > 0) return list[0].id;
  const created = await addProfile({ name: 'Default', type: 'General', color: '#64748b' });
  await setSelectedProfileId(created.id);
  return created.id;
}
