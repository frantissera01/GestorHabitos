import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function ProfilePickerModal({ visible, profiles, onSelect, onCreateNew, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={ppStyles.backdrop}>
        <View style={ppStyles.sheet}>
          <Text style={ppStyles.title}>Elegí tu perfil</Text>
          <ScrollView contentContainerStyle={ppStyles.grid}>
            {(profiles || []).map((p) => (
              <TouchableOpacity key={String(p.id)} style={[ppStyles.card, { borderColor: p.color }]} onPress={() => onSelect && onSelect(p.id)}>
                <View style={[ppStyles.dot, { backgroundColor: p.color }]} />
                <Text style={ppStyles.name}>{p.name}</Text>
                <Text style={ppStyles.type}>{p.type}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[ppStyles.card, ppStyles.addCard]} onPress={onCreateNew}>
              <Text style={ppStyles.addText}>＋ Nuevo perfil</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={ppStyles.closeBtn}><Text style={ppStyles.closeText}>Cerrar</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ppStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '90%', borderRadius: 16, backgroundColor: '#111827', padding: 16 },
  title: { color: '#F9FAFB', fontWeight: '800', fontSize: 18, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: { width: 140, borderWidth: 2, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#1f2937' },
  dot: { width: 24, height: 24, borderRadius: 12, marginBottom: 8 },
  name: { color: '#F9FAFB', fontWeight: '800' },
  type: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },
  addCard: { borderStyle: 'dashed', borderColor: '#6B7280' },
  addText: { color: '#E5E7EB', fontWeight: '700' },
  closeBtn: { alignSelf: 'center', marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#374151' },
  closeText: { color: '#F9FAFB', fontWeight: '800' },
});

