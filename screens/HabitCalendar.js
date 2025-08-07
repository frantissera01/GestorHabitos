import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function HabitCalendar({ onRangeChange }) {
  const [range, setRange] = useState({ startDate: null, endDate: null });

  const handleDayPress = day => {
    let newRange;
    if (!range.startDate || (range.startDate && range.endDate)) {
      newRange = { startDate: day.dateString, endDate: null };
    } else {
      // Ensure endDate is after startDate and within 30 days
      const start = new Date(range.startDate);
      const end = new Date(day.dateString);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (end < start || diffDays > 30) {
        // reset to new start
        newRange = { startDate: day.dateString, endDate: null };
      } else {
        newRange = { ...range, endDate: day.dateString };
      }
    }
    setRange(newRange);
    onRangeChange(newRange);
  };

  const marked = {};
  if (range.startDate) marked[range.startDate] = { startingDay: true, color: '#70d7c7' };
  if (range.endDate) marked[range.endDate] = { endingDay: true, color: '#70d7c7' };
  if (range.startDate && range.endDate) {
    // Mark intermediate days
    let current = new Date(range.startDate);
    const end = new Date(range.endDate);
    while (current < end) {
      const iso = current.toISOString().split('T')[0];
      if (iso !== range.startDate && iso !== range.endDate) {
        marked[iso] = { color: '#d0f0e1' };
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Seleccioná un rango (hasta 30 días):</Text>
      <Calendar
        markingType="period"
        markedDates={marked}
        onDayPress={handleDayPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  label: { fontSize: 14, marginBottom: 6, fontWeight: 'bold' },
});
