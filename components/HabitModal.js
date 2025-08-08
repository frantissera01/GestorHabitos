import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

export default function HabitModal({ visible, onSave, onCancel, themeColors, initialHabit, availableProfiles = [], currentProfileId }) {
  const colors = useMemo(() => getColors(themeColors), [themeColors]);
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState([]);
  const [timesPerDay, setTimesPerDay] = useState('1');
  const [reminder, setReminder] = useState('');
  const [tags, setTags] = useState('');
  const [profileId, setProfileId] = useState(currentProfileId || (availableProfiles[0]?.id ?? 'default'));

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title || initialHabit.nombre || initialHabit.name || initialHabit.descripcion || '');
      setNote(initialHabit.nota || initialHabit.detalle || '');
      const fechas = Array.isArray(initialHabit.fechas) ? initialHabit.fechas : [];
      setStartDate(fechas[0] ? toKey(new Date(fechas[0])) : '');
      setEndDate(fechas[1] ? toKey(new Date(fechas[1])) : '');
      setDays(Array.isArray(initialHabit.diasSemana) ? initialHabit.diasSemana : []);
      setTimesPerDay(String(initialHabit.vecesPorDia ?? initialHabit.repeticionesPorDia ?? initialHabit.veces ?? '1'));
      setReminder(initialHabit.recordatorio || initialHabit.hora || '');
      setTags(Array.isArray(initialHabit.tags) ? initialHabit.tags.join(', ') : '');
      setProfileId(initialHabit.profileId || currentProfileId || (availableProfiles[0]?.id ?? 'default'));
    } else {
      const today = toKey(new Date()); setStartDate(today); setEndDate(today); setProfileId(currentProfileId || (availableProfiles[0]?.id ?? 'default'));
    }
  }, [initialHabit, currentProfileId]);

  const toggleDay = (n) => setDays((prev) => prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n].sort((a,b)=>a-b));

  const handleSave = () => {
    const name = title.trim(); if (!name) { alert('Poné un nombre para el hábito'); return; }
    const s = sanitizeDate(startDate); const e = sanitizeDate(endDate);
    const range = s && e ? (new Date(s) <= new Date(e) ? [s, e] : [e, s]) : (s ? [s] : undefined);
    const tagsArr = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const out = { title: name, nota: note.trim() || undefined, fechas: range, diasSemana: days, vecesPorDia: Number(timesPerDay) > 0 ? Number(timesPerDay) : 1, recordatorio: reminder.trim() || undefined, tags: tagsArr.length ? tagsArr : undefined, createdAt: toKey(new Date()), profileId };
    if (typeof onSave === 'function') onSave(out);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{initialHabit ? 'Editar hábito' : 'Nuevo hábito'}</Text>

        {/* Selector de perfil */}
        <Text style={styles.label}>Perfil</Text>
        <View style={styles.rowChips}>
          {availableProfiles.map((p) => (
            <TouchableOpacity key={String(p.id)} onPress={() => setProfileId(p.id)} style={[styles.chip, profileId===p.id && styles.chipOn, { borderColor: p.color }]}>
              <View style={[styles.dot, { backgroundColor: p.color }]} />
              <Text style={[styles.chipText, profileId===p.id && styles.chipTextOn]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nombre</Text>
        <TextInput placeholder="Ej. Tomar agua" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor={colors.placeholder} />

        <Text style={styles.label}>Nota</Text>
        <TextInput placeholder="Opcional" value={note} onChangeText={setNote} style={[styles.input, { height: 90, textAlignVertical: 'top' }]} placeholderTextColor={colors.placeholder} multiline />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Inicio (YYYY-MM-DD)</Text>
            <TextInput placeholder="2025-08-08" value={startDate} onChangeText={setStartDate} style={styles.input} placeholderTextColor={colors.placeholder} autoCapitalize="none" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Fin (opcional)</Text>
            <TextInput placeholder="2025-09-01" value={endDate} onChangeText={setEndDate} style={styles.input} placeholderTextColor={colors.placeholder} autoCapitalize="none" />
          </View>
        </View>

        <Text style={styles.label}>Días de la semana</Text>
        <View style={styles.rowChips}>
          {[{v:1,l:'Lun'},{v:2,l:'Mar'},{v:3,l:'Mié'},{v:4,l:'Jue'},{v:5,l:'Vie'},{v:6,l:'Sáb'},{v:0,l:'Dom'}].map((d) => (
            <TouchableOpacity key={d.v} onPress={() => toggleDay(d.v)} style={[styles.chip, days.includes(d.v) && styles.chipOn]}>
              <Text style={[styles.chipText, days.includes(d.v) && styles.chipTextOn]}>{d.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Veces por día</Text>
            <TextInput placeholder="1" keyboardType="numeric" value={timesPerDay} onChangeText={setTimesPerDay} style={styles.input} placeholderTextColor={colors.placeholder} />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Recordatorio (HH:mm)</Text>
            <TextInput placeholder="08:00" value={reminder} onChangeText={setReminder} style={styles.input} placeholderTextColor={colors.placeholder} autoCapitalize="none" />
          </View>
        </View>

        <Text style={styles.label}>Etiquetas (separadas por coma)</Text>
        <TextInput placeholder="salud, mañana" value={tags} onChangeText={setTags} style={styles.input} placeholderTextColor={colors.placeholder} autoCapitalize="none" />

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.9}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}><Text style={styles.saveText}>{initialHabit ? 'Guardar' : 'Crear'}</Text></TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function pad(n) { return String(n).padStart(2, '0'); }
function toKey(d) { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function sanitizeDate(s) { if (!s) return ''; const m = String(s).match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/); if (!m) return ''; const y = Number(m[1]); const mm = Number(m[2]); const dd = Number(m[3]); if (!y || !mm || !dd) return ''; return `${y}-${pad(mm)}-${pad(dd)}`; }
function getColors(theme) { return { bg: theme?.bg ?? '#f6f7fb', card: theme?.card ?? '#ffffff', text: theme?.text ?? '#10131a', muted: theme?.muted ?? '#5f6b85', primary: theme?.primary ?? '#22c55e', danger: theme?.danger ?? '#ef4444', border: theme?.border ?? '#e6e9f2', placeholder: '#9aa3b2', }; }
function getStyles(colors) { return StyleSheet.create({ container: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, backgroundColor: colors.card, flexGrow: 1 }, title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }, label: { fontSize: 13, color: colors.muted, marginBottom: 4, marginTop: 10 }, input: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, color: colors.text, backgroundColor: '#fff' }, row2: { flexDirection: 'row' }, rowChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 }, chipOn: { backgroundColor: '#dcfce7', borderColor: colors.primary }, chipText: { color: colors.muted, fontWeight: '700' }, chipTextOn: { color: '#065f46' }, dot: { width: 10, height: 10, borderRadius: 5 }, actionsRow: { flexDirection: 'row', gap: 12, marginTop: 14 }, cancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger }, cancelText: { color: '#fff', fontWeight: '700' }, saveBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, saveText: { color: '#fff', fontWeight: '700' }, }); }
