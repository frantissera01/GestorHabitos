import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as ProfileService from '../services/ProfileService';

const TYPES = ['Deportivo', 'Escolar', 'Salud', 'Trabajo', 'Personal', 'Otro'];
const COLORS = ['#f97316', '#ef4444', '#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#64748b'];

export default function Onboarding({ onCreated }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [color, setColor] = useState(COLORS[0]);

  const styles = useMemo(() => StyleSheet.create({
    wrap: { flex: 1, padding: 20, backgroundColor: '#0b1220' },
    title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 12 },
    label: { color: '#9aa3b2', marginTop: 8, marginBottom: 6, fontWeight: '700' },
    input: { height: 48, borderRadius: 12, backgroundColor: '#111827', color: '#fff', paddingHorizontal: 12, borderWidth: 1, borderColor: '#1f2937' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
    chipOn: { backgroundColor: '#1f2937', borderColor: '#60a5fa' },
    chipText: { color: '#E5E7EB', fontWeight: '700' },
    colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    colorBox: { width: 34, height: 34, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
    colorBoxOn: { borderColor: '#60a5fa' },
    saveBtn: { marginTop: 16, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#22c55e' },
    saveText: { color: '#fff', fontWeight: '800' },
  }), []);

  const save = async () => {
    const profile = await ProfileService.addProfile({ name: name.trim() || 'Mi Perfil', type, color });
    if (onCreated) onCreated(profile);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>¡Bienvenido! Creá tu perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Ej. Juan" placeholderTextColor="#6b7280" style={styles.input} />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.chipsRow}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.chip, type===t && styles.chipOn]}><Text style={styles.chipText}>{t}</Text></TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorsRow}>
        {COLORS.map((c) => (
          <TouchableOpacity key={c} onPress={() => setColor(c)}>
            <View style={[styles.colorBox, { backgroundColor: c }, color===c && styles.colorBoxOn]} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Crear perfil</Text></TouchableOpacity>
    </ScrollView>
  );
}

