import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function HabitItem({ habit, themeColors, onUpdate, onOpenDetails, onEdit, onDelete }) {
  const colors = useMemo(() => getItemColors(themeColors), [themeColors]);
  const styles = useMemo(() => getItemStyles(colors), [colors]);

  const completedDates = Array.isArray(habit?.completedDates) ? habit.completedDates : [];
  const completedToday = hasCompletedToday(completedDates);
  const streak = currentStreak(completedDates);

  const title = habit?.title || habit?.nombre || habit?.name || habit?.descripcion || 'Hábito';
  const note = habit?.nota || habit?.detalle || '';

  const toggleToday = () => {
    const today = todayKey();
    const set = new Set(completedDates);
    if (set.has(today)) set.delete(today); else set.add(today);
    const updated = { ...habit, completedDates: Array.from(set).sort() };
    if (typeof onUpdate === 'function') onUpdate(updated);
  };

  return (
    <View style={styles.card}>
      {/* Encabezado - al tocar abre detalles */}
      <TouchableOpacity onPress={() => onOpenDetails && onOpenDetails(habit)} activeOpacity={0.85}>
        <View style={styles.hHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.hTitle}>{title}</Text>
            {!!note && <Text style={styles.hNote}>{note}</Text>}
          </View>

          {/* Streak + acciones */}
          <View style={styles.rightCol}>
            <View style={[styles.streakPill, completedToday && styles.streakPillDone]}>
              <Text style={styles.streakText}>🔥 {streak}</Text>
            </View>

            <View style={styles.smallActions}>
              <TouchableOpacity
                onPress={() => onEdit && onEdit(habit)}
                style={styles.editBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onDelete && onDelete(habit)}
                style={styles.deleteBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Acción principal completar / desmarcar hoy */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={completedToday ? styles.uncheckBtn : styles.checkBtn}
          onPress={toggleToday}
          activeOpacity={0.9}
        >
          <Text style={completedToday ? styles.uncheckText : styles.checkText}>
            {completedToday ? 'Desmarcar' : 'Completar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- helpers fechas / racha ---------- */
function pad(n) { return String(n).padStart(2, '0'); }
function toKey(date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function todayKey() { return toKey(new Date()); }
function fromKey(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function prevKey(key) { const d = fromKey(key); d.setDate(d.getDate() - 1); return toKey(d); }
function hasCompletedToday(dates) { return new Set(dates || []).has(todayKey()); }
function currentStreak(dates) {
  const set = new Set(dates || []);
  let key = set.has(todayKey()) ? todayKey() : prevKey(todayKey());
  let streak = 0;
  while (set.has(key)) { streak++; key = prevKey(key); }
  return streak;
}

/* ---------- estilos ---------- */
function getItemColors(theme) {
  return {
    bg: theme?.bg ?? '#f6f7fb',
    card: theme?.card ?? '#ffffff',
    text: theme?.text ?? '#10131a',
    muted: theme?.muted ?? '#5f6b85',
    primary: theme?.primary ?? '#22c55e',
    danger: theme?.danger ?? '#ef4444',
    border: theme?.border ?? '#e6e9f2',
    shadow: theme?.shadow ?? 'rgba(16,19,26,0.08)',
  };
}
function getShadow(shadowColor) {
  return Platform.select({
    ios: { shadowColor, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 6 },
    default: {},
  });
}
function getItemStyles(colors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      ...getShadow(colors.shadow),
    },
    hHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    hTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    hNote: { marginTop: 2, fontSize: 13, color: colors.muted },

    rightCol: { alignItems: 'flex-end' },
    streakPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: '#ffd7a3',
      borderWidth: 1,
      borderColor: '#fbbf24',
      marginBottom: 6,
      alignSelf: 'flex-end',
    },
    streakPillDone: { backgroundColor: '#bbf7d0', borderColor: '#22c55e' },
    streakText: { fontSize: 12, fontWeight: '700', color: '#92400e' },

    smallActions: { flexDirection: 'row', gap: 8 },
    editBtn: {
      borderWidth: 1, borderColor: colors.border, borderRadius: 10,
      paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f8fafc',
    },
    editText: { color: colors.text, fontWeight: '700', fontSize: 12 },
    deleteBtn: {
      borderWidth: 1, borderColor: colors.danger, borderRadius: 10,
      paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fee2e2',
    },
    deleteText: { color: colors.danger, fontWeight: '800', fontSize: 12 },

    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    checkBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    checkText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
    uncheckBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger },
    uncheckText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  });
}
