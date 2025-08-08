// components/CompletedByDateModal.js
import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function CompletedByDateModal({ visible, dateKey, habits = [], themeColors = {}, onClose }) {
  const colors = useMemo(() => ({
    card: themeColors?.card ?? '#ffffff',
    text: themeColors?.text ?? '#10131a',
    muted: themeColors?.muted ?? '#5f6b85',
    border: themeColors?.border ?? '#e6e9f2',
    danger: themeColors?.danger ?? '#ef4444',
  }), [themeColors]);

  const styles = useMemo(() => StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { maxHeight: '75%', backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderColor: colors.border },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    closeBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: colors.danger },
    closeText: { color: '#fff', fontWeight: '700' },
    list: { paddingTop: 6 },
    item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    itemText: { color: colors.text, fontSize: 16, fontWeight: '600' },
    empty: { paddingVertical: 18 },
    emptyText: { color: colors.muted },
  }), [colors]);

  const completed = useMemo(() => {
    const key = String(dateKey || '');
    return (habits || []).filter(h => new Set(h?.completedDates || []).has(key));
  }, [habits, dateKey]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Completados el {fmtDate(dateKey)} ({completed.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {completed.length === 0 ? (
              <View style={styles.empty}><Text style={styles.emptyText}>No hay hábitos completados en esa fecha</Text></View>
            ) : (
              completed.map((h) => {
                const title = h?.title || h?.nombre || h?.name || h?.descripcion || 'Hábito';
                return (
                  <View key={String(h.id)} style={styles.item}>
                    <Text style={styles.itemText}>✅ {title}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// helpers
function pad(n){ return String(n).padStart(2,'0'); }
function fmtDate(key){
  try { const [y,m,d] = String(key).split('-').map(Number); return `${pad(d)}/${pad(m)}/${y}`; }
  catch { const dt = new Date(key); return `${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()}`; }
}
