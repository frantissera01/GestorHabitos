import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, View, Text, FlatList, Modal, StyleSheet, StatusBar, TouchableOpacity, RefreshControl, Platform, Alert, Switch, ScrollView } from 'react-native';
import HabitModal from '../components/HabitModal';
import HabitItem from '../components/HabitItem';
import HabitCalendar from './HabitCalendar';
import HabitDetailsModal from '../components/HabitDetailsModal';
import * as HabitService from '../services/HabitService';

export default function HomeScreen({ currentProfileId, profiles, onChangeProfile }) {
  const [isDark, setIsDark] = useState(false);
  const colors = useMemo(() => getColors(isDark), [isDark]);
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [isCalOpen, setIsCalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [completedVisible, setCompletedVisible] = useState(false);

  // Filtros/Orden
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { loadHabits(); }, []);

  const normalize = (list) => (Array.isArray(list) ? list : []).map((h) => ({ completedDates: Array.isArray(h?.completedDates) ? h.completedDates : [], ...h }));

  const loadHabits = async () => {
    try { const data = await HabitService.getHabits(); setHabits(normalize(data)); }
    catch (e) { console.error('Error cargando hábitos', e); Alert.alert('Error', 'No se pudieron cargar los hábitos.'); setHabits([]); }
  };

  const handleSave = async (habitData) => {
    try {
      if (editingHabit) {
        const updated = { ...editingHabit, ...habitData, id: editingHabit.id, completedDates: Array.isArray(editingHabit.completedDates) ? editingHabit.completedDates : [], };
        const saved = await HabitService.updateHabit(updated.id, updated);
        const next = habits.map((h) => (String(h.id) === String(updated.id) ? (saved || updated) : h));
        setHabits(normalize(next)); setEditingHabit(null); setModalVisible(false);
      } else {
        const item = { id: Date.now().toString(), completedDates: [], profileId: habitData.profileId || currentProfileId, ...habitData };
        const updated = await HabitService.addHabit(item);
        const list = Array.isArray(updated) ? updated : [...habits, item];
        setHabits(normalize(list)); setModalVisible(false);
      }
    } catch (e) { console.error('Error guardando hábito', e); Alert.alert('Error', 'No se pudo guardar el hábito.'); }
  };

  const persistHabits = async (nextList, updatedHabit = null) => {
    try { if (typeof HabitService.updateHabit === 'function' && updatedHabit) await HabitService.updateHabit(updatedHabit.id, updatedHabit); else if (typeof HabitService.saveHabits === 'function') await HabitService.saveHabits(nextList); }
    catch (e) { console.error('Error persistiendo hábitos', e); }
  };

  const handleUpdateHabit = async (updatedHabit) => { const next = habits.map((h) => (String(h.id) === String(updatedHabit.id) ? updatedHabit : h)); setHabits(normalize(next)); await persistHabits(next, updatedHabit); };
  const onRefresh = async () => { setRefreshing(true); await loadHabits(); setRefreshing(false); };

  const onSelectDate = (key) => { let nextKey = key; if (key instanceof Date) nextKey = toKey(key); if (typeof key === 'object' && key?.dateString) nextKey = key.dateString; if (typeof nextKey === 'string') { setSelectedDate(nextKey); setCompletedVisible(true); } };

  const openDetails = (habit) => { setSelectedHabit(habit); setDetailsVisible(true); };
  const displayTitle = (h) => h?.title || h?.nombre || h?.name || h?.descripcion || 'Hábito';
  const getStreak = (h) => currentStreak(h?.completedDates || []);
  const parseDate = (h) => { const fromKey = (key) => { const [y,m,d] = String(key).split('-').map(Number); return new Date(y, (m||1)-1, d||1); }; if (h?.createdAt) { const d = fromKey(h.createdAt); if (!isNaN(d)) return d; } if (Array.isArray(h?.fechas) && h.fechas[0]) { const d = new Date(h.fechas[0]); if (!isNaN(d)) return d; } const n = Number(h?.id); if (!isNaN(n)) return new Date(n); return new Date(0); };

  // Filtrar por perfil actual → luego estado → ordenar
  const viewHabits = useMemo(() => {
    const byProfile = habits.filter((h) => String(h.profileId || '') === String(currentProfileId));
    const byStatus = byProfile.filter((h) => { if (statusFilter === 'all') return true; const doneToday = new Set(h?.completedDates || []).has(todayKey()); return statusFilter === 'done' ? doneToday : !doneToday; });
    const arr = [...byStatus];
    arr.sort((a, b) => { let cmp = 0; if (sortKey === 'alpha') cmp = displayTitle(a).localeCompare(displayTitle(b)); else if (sortKey === 'streak') cmp = getStreak(a) - getStreak(b); else cmp = parseDate(a) - parseDate(b); return sortDir === 'asc' ? cmp : -cmp; });
    return arr;
  }, [habits, currentProfileId, sortKey, sortDir, statusFilter]);

  const startEdit = (habit) => { setEditingHabit(habit); setModalVisible(true); };
  const confirmDelete = (habit) => { const name = displayTitle(habit); Alert.alert('Eliminar hábito', `¿Seguro que querés eliminar "${name}"?`, [ { text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: async () => { try { const next = await HabitService.removeHabit(habit.id); setHabits(Array.isArray(next) ? normalize(next) : normalize(habits.filter((h) => String(h.id) !== String(habit.id)))); } catch (e) { console.error('Error eliminando hábito', e); Alert.alert('Error', 'No se pudo eliminar el hábito.'); } } }, ] ); };

  const currentProfile = profiles?.find((p) => String(p.id) === String(currentProfileId));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.bg} barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Gestor de Hábitos</Text>
            <Text style={styles.subtitle}>Perfil: <Text style={{ fontWeight: '800' }}>{currentProfile?.name || '—'}</Text></Text>
          </View>
          <View style={styles.themeToggle}>
            <TouchableOpacity onPress={onChangeProfile} style={[styles.profileBtn, { borderColor: currentProfile?.color || '#e6e9f2' }]}>
              <View style={[styles.profileDot, { backgroundColor: currentProfile?.color || '#64748b' }]} />
              <Text style={styles.profileBtnText}>Cambiar</Text>
            </TouchableOpacity>
            <Switch value={isDark} onValueChange={setIsDark} trackColor={{ false: '#c7d2fe', true: '#93c5fd' }} thumbColor={'#ffffff'} />
          </View>
        </View>

        {/* Acciones superiores */}
        <View style={styles.topActionRow}>
          <TouchableOpacity style={[styles.collapseBtn, { flex: 1 }]} onPress={() => setIsCalOpen((s) => !s)} activeOpacity={0.85}>
            <Text style={styles.collapseBtnText}>📅 {fmtDate(selectedDate)} {isCalOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFiltersOpen((s) => !s)} activeOpacity={0.85}>
            <Text style={styles.filterBtnText}>⚙️ Filtros</Text>
          </TouchableOpacity>
        </View>

        {isCalOpen && (
          <View style={styles.calendarCard}>
            <HabitCalendar themeColors={colors} selectedDate={selectedDate} onSelectDate={onSelectDate} />
          </View>
        )}

        {filtersOpen && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterTitle}>Ordenar por</Text>
            <View style={styles.sortRow}>
              <TouchableOpacity onPress={() => setSortKey('streak')} style={[styles.chip, sortKey==='streak' && styles.chipOn]}><Text style={[styles.chipText, sortKey==='streak' && styles.chipTextOn]}>Racha</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSortKey('alpha')} style={[styles.chip, sortKey==='alpha' && styles.chipOn]}><Text style={[styles.chipText, sortKey==='alpha' && styles.chipTextOn]}>A→Z</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSortKey('date')} style={[styles.chip, sortKey==='date' && styles.chipOn]}><Text style={[styles.chipText, sortKey==='date' && styles.chipTextOn]}>Fecha</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setSortDir(d => d==='asc' ? 'desc' : 'asc')} style={styles.dirBtn}><Text style={styles.dirText}>{sortDir==='asc' ? '↑' : '↓'}</Text></TouchableOpacity>
            </View>
            <Text style={[styles.filterTitle, { marginTop: 8 }]}>Estado</Text>
            <View style={styles.sortRow}>
              <TouchableOpacity onPress={() => setStatusFilter('all')} style={[styles.chip, statusFilter==='all' && styles.chipOn]}><Text style={[styles.chipText, statusFilter==='all' && styles.chipTextOn]}>Todos</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setStatusFilter('done')} style={[styles.chip, statusFilter==='done' && styles.chipOn]}><Text style={[styles.chipText, statusFilter==='done' && styles.chipTextOn]}>Hechos hoy</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setStatusFilter('todo')} style={[styles.chip, statusFilter==='todo' && styles.chipOn]}><Text style={[styles.chipText, statusFilter==='todo' && styles.chipTextOn]}>Pendientes hoy</Text></TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={viewHabits}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <HabitItem habit={item} themeColors={colors} onUpdate={handleUpdateHabit} onOpenDetails={openDetails} onEdit={(h)=>{setEditingHabit(h); setModalVisible(true);}} onDelete={confirmDelete} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<View style={styles.emptyWrap}><View style={styles.emptyBadge}><Text style={styles.emptyEmoji}>🗓️</Text></View><Text style={styles.emptyTitle}>Sin hábitos aún</Text><Text style={styles.emptyText}>Toca “Agregar hábito” para crear el primero.</Text></View>}
          contentContainerStyle={[styles.listContent, viewHabits.length === 0 && styles.listEmptySpace]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => { setEditingHabit(null); setModalVisible(true); }} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>＋ Agregar hábito</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={() => { setModalVisible(false); setEditingHabit(null); }}>
          <HabitModal visible={modalVisible} onSave={handleSave} onCancel={() => { setModalVisible(false); setEditingHabit(null); }} themeColors={colors} initialHabit={editingHabit} availableProfiles={profiles} currentProfileId={currentProfileId} />
        </Modal>

        <HabitDetailsModal visible={detailsVisible} habit={selectedHabit} themeColors={colors} onClose={() => setDetailsVisible(false)} />

        <CompletedListModalInline visible={completedVisible} dateKey={selectedDate} habits={habits} themeColors={colors} onClose={() => setCompletedVisible(false)} />
      </View>
    </SafeAreaView>
  );
}

// helpers + styles (mantenidos)
function pad(n) { return String(n).padStart(2, '0'); } function toKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; } function todayKey() { return toKey(new Date()); } function fmtDate(key) { try { const [y, m, d] = String(key).split('-').map(Number); return `${pad(d)}/${pad(m)}/${y}`; } catch { const dt = new Date(key); return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`; } }
function fromKey(key) { const [y, m, d] = String(key).split('-').map(Number); return new Date(y, m - 1, d); } function prevKey(key) { const d = fromKey(key); d.setDate(d.getDate() - 1); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; } function currentStreak(dates) { const set = new Set(dates || []); let key = set.has(todayKey()) ? todayKey() : prevKey(todayKey()); let streak = 0; while (set.has(key)) { streak++; key = prevKey(key); } return streak; }
function getColors(isDark) { return { bg: isDark ? '#0c0f14' : '#f6f7fb', card: isDark ? '#1a1f29' : '#ffffff', text: isDark ? '#eaeef6' : '#10131a', muted: isDark ? '#9aa3b2' : '#5f6b85', primary: '#22c55e', danger: '#ef4444', border: isDark ? '#2a3240' : '#e6e9f2', shadow: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(16,19,26,0.08)' }; }
function getShadow(shadowColor) { return Platform.select({ ios: { shadowColor, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } }, android: { elevation: 6 }, default: {}, }); }
function getStyles(colors) { return StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.bg }, container: { flex: 1, backgroundColor: colors.bg }, header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, title: { fontSize: 28, fontWeight: '700', color: colors.text }, subtitle: { marginTop: 4, fontSize: 14, color: colors.muted }, themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 }, profileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 10, backgroundColor: colors.card }, profileDot: { width: 12, height: 12, borderRadius: 6 }, profileBtnText: { color: colors.text, fontWeight: '800' }, topActionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 }, collapseBtn: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 14, ...getShadow(colors.shadow) }, collapseBtnText: { color: colors.text, fontWeight: '700' }, filterBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, ...getShadow(colors.shadow) }, filterBtnText: { color: colors.text, fontWeight: '800' }, calendarCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 8, ...getShadow(colors.shadow) }, filtersPanel: { marginHorizontal: 16, marginBottom: 6, padding: 10, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border }, filterTitle: { color: colors.muted, fontWeight: '800', marginBottom: 6 }, sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: colors.border }, chipOn: { backgroundColor: '#dcfce7', borderColor: colors.primary }, chipText: { color: colors.muted, fontWeight: '700' }, chipTextOn: { color: '#065f46' }, dirBtn: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }, dirText: { fontWeight: '900', color: colors.text }, listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 }, listEmptySpace: { flexGrow: 1, justifyContent: 'center' }, separator: { height: 12 }, bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, ...getShadow(colors.shadow) }, primaryBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }, emptyWrap: { alignItems: 'center', gap: 6, paddingVertical: 20 }, emptyBadge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 4, ...getShadow(colors.shadow) }, emptyEmoji: { fontSize: 30 }, emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text }, emptyText: { fontSize: 14, color: colors.muted }, }); }
