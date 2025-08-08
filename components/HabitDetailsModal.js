import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

export default function HabitDetailsModal({ visible, habit, onClose, themeColors }) {
  if (!habit) return null;
  const colors = getModalColors(themeColors);
  const styles = getModalStyles(colors);

  const title = habit?.title || habit?.nombre || habit?.name || 'Hábito';
  const note = habit?.nota || habit?.detalle || '';
  const fechas = Array.isArray(habit?.fechas) ? habit.fechas : null; // [inicio, fin]
  const diasSemana = Array.isArray(habit?.diasSemana) ? habit.diasSemana : null; // array de strings o nums
  const vecesPorDia = habit?.vecesPorDia ?? habit?.repeticionesPorDia ?? habit?.veces ?? null; // número
  const recordatorio = habit?.recordatorio || habit?.hora || null; // string/hora
  const etiquetas = Array.isArray(habit?.tags) ? habit.tags : null;
  const createdAt = habit?.createdAt || habit?.creadoEl || null;

  const completedDates = Array.isArray(habit?.completedDates) ? habit.completedDates : [];
  const completedToday = new Set(completedDates || []).has(modalTodayKey());
  const streak = modalCurrentStreak(completedDates);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.pill, completedToday ? styles.pillDone : styles.pillMuted]}>
              <Text style={styles.pillText}>{completedToday ? 'Completado hoy' : 'Pendiente hoy'}</Text>
            </View>
            <View style={[styles.pill, styles.pillStreak]}>
              <Text style={styles.pillText}>🔥 Racha: {streak}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {!!note && <ModalRow label="Nota" value={note} />}

            {fechas && (
              <ModalRow label="Rango de fechas" value={`${modalFmtDate(fechas[0])} — ${modalFmtDate(fechas[1] ?? fechas[0])}`} />
            )}

            {diasSemana && diasSemana.length > 0 && (
              <View style={styles.rowWrap}>
                <Text style={styles.label}>Días de la semana</Text>
                <View style={styles.chipsRow}>
                  {diasSemana.map((d, idx) => (
                    <View key={idx} style={styles.chip}><Text style={styles.chipText}>{modalDayLabel(d)}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {Number.isFinite(vecesPorDia) && <ModalRow label="Veces por día" value={String(vecesPorDia)} />}
            {!!recordatorio && <ModalRow label="Recordatorio" value={String(recordatorio)} />}
            {etiquetas && etiquetas.length > 0 && (
              <ModalRow label="Etiquetas" value={etiquetas.join(', ')} />
            )}
            {!!createdAt && <ModalRow label="Creado" value={modalFmtDate(createdAt)} />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ModalRow({ label, value, multiline }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 13, color: '#5f6b85', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 16, color: '#10131a' }} numberOfLines={multiline ? 0 : 4}>{value}</Text>
    </View>
  );
}

// helpers locales del modal (prefijos "modal" para evitar colisiones)
function modalPad(n) { return String(n).padStart(2, '0'); }
function modalFromKey(key) { if (!key) return null; const [y, m, d] = String(key).split('-').map(Number); return new Date(y, (m ?? 1) - 1, d ?? 1); }
function modalFmtDate(x) {
  if (!x) return '';
  if (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)) {
    const d = modalFromKey(x); return `${modalPad(d.getDate())}/${modalPad(d.getMonth()+1)}/${d.getFullYear()}`;
  }
  const d = new Date(x);
  if (isNaN(d)) return String(x);
  return `${modalPad(d.getDate())}/${modalPad(d.getMonth()+1)}/${d.getFullYear()}`;
}
function modalDayLabel(d) {
  const map = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', Domingo:'Dom', Lunes:'Lun', Martes:'Mar', Miércoles:'Mié', Jueves:'Jue', Viernes:'Vie', Sábado:'Sáb' };
  return map?.[d] ?? String(d);
}
function modalTodayKey() { const d = new Date(); return `${d.getFullYear()}-${modalPad(d.getMonth()+1)}-${modalPad(d.getDate())}`; }
function modalPrevKey(key) { const [y,m,d]=key.split('-').map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()-1); return `${dt.getFullYear()}-${modalPad(dt.getMonth()+1)}-${modalPad(dt.getDate())}`; }
function modalCurrentStreak(dates) { const set = new Set(dates || []); let key = set.has(modalTodayKey()) ? modalTodayKey() : modalPrevKey(modalTodayKey()); let streak = 0; while (set.has(key)) { streak++; key = modalPrevKey(key); } return streak; }

function getModalColors(theme) {
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
function getModalStyles(colors) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 24,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },
    closeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#ef4444' },
    closeText: { color: '#fff', fontWeight: '700' },

    badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eef2ff' },
    pillDone: { backgroundColor: '#bbf7d0' },
    pillMuted: { backgroundColor: '#fde68a' },
    pillStreak: { backgroundColor: '#e0e7ff' },
    pillText: { color: '#10131a', fontWeight: '700' },

    content: { paddingBottom: 20 },

    rowWrap: { marginBottom: 12 },
    label: { fontSize: 13, color: '#5f6b85', marginBottom: 4 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#f6f7fb', borderWidth: 1, borderColor: '#e6e9f2' },
    chipText: { color: '#10131a', fontWeight: '600' },
  });
}
