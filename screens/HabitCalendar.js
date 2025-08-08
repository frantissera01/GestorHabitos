// screens/HabitCalendar.js — modo "single" (tocar un día) + tema
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function HabitCalendar({ selectedDate, onSelectDate, themeColors }) {
  const colors = useMemo(() => getColors(themeColors), [themeColors]);
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Si el padre no pasa selectedDate, llevamos una interna
  const [internalDate, setInternalDate] = useState(selectedDate || todayKey());
  useEffect(() => {
    if (selectedDate && selectedDate !== internalDate) setInternalDate(selectedDate);
  }, [selectedDate]);

  const handleDayPress = (day) => {
    const key = day?.dateString;
    if (!key) return;
    setInternalDate(key);
    if (typeof onSelectDate === 'function') onSelectDate(key);
  };

  const marked = internalDate
    ? { [internalDate]: { selected: true, selectedColor: colors.primary, selectedTextColor: '#ffffff' } }
    : {};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Seleccioná un día:</Text>
      <Calendar
        style={styles.calendar}
        onDayPress={handleDayPress}
        markedDates={marked}
        // No usamos rango: sin markingType="period"
        enableSwipeMonths
        theme={{
          backgroundColor: colors.card,
          calendarBackground: colors.card,
          textSectionTitleColor: colors.muted,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#0ea5e9',
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          textDisabledColor: '#9aa3b2',
          arrowColor: colors.text,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '700',
        }}
      />
    </View>
  );
}

// helpers
function pad(n) { return String(n).padStart(2, '0'); }
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

function getColors(theme) {
  return {
    card: theme?.card ?? '#ffffff',
    text: theme?.text ?? '#10131a',
    muted: theme?.muted ?? '#5f6b85',
    primary: theme?.primary ?? '#22c55e',
    border: theme?.border ?? '#e6e9f2',
  };
}

function getStyles(colors) {
  return StyleSheet.create({
    container: { marginVertical: 8 },
    label: { fontSize: 14, marginBottom: 6, fontWeight: '700', color: colors.text },
    calendar: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });
}
