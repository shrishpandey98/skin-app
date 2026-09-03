import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Sun, Sunset, Moon } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

// Generate next 10 dates
const generateDates = () => {
  const dates = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
    const dayNumber = d.getDate();
    const month = monthNames[d.getMonth()];

    dates.push({
      dateStr,
      dayName,
      dayNumber,
      month,
      fullLabel: `${dayName}, ${dayNumber} ${month}`,
    });
  }
  return dates;
};

const TIME_SLOTS = {
  morning: ['10:00 AM', '10:45 AM', '11:30 AM', '12:15 PM'],
  afternoon: ['01:30 PM', '02:15 PM', '03:00 PM', '03:45 PM', '04:30 PM'],
  evening: ['05:15 PM', '06:00 PM', '06:45 PM', '07:15 PM'],
};

export const SelectDateTimeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clinicSlug, doctorSlug, procedureSlug } = route.params || {};

  const availableDates = generateDates();
  const [selectedDate, setSelectedDate] = useState(availableDates[0].dateStr);
  const [selectedTime, setSelectedTime] = useState<string | null>('11:30 AM');

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    navigation.navigate('ConfirmDetails', {
      clinicSlug,
      doctorSlug,
      procedureSlug,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepBox}>
          <Text style={styles.stepBadge}>STEP 3 OF 5</Text>
          <Text style={styles.title}>When suits you best?</Text>
          <Text style={styles.subtitle}>
            Choose an appointment date and preferred in-clinic consultation slot.
          </Text>
        </View>

        {/* Date Selector Horizontal Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <CalendarIcon size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  activeOpacity={0.8}
                  onPress={() => setSelectedDate(item.dateStr)}
                  style={[
                    styles.dateCard,
                    isSelected ? styles.dateCardSelected : styles.dateCardUnselected,
                    shadows.subtle,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected ? styles.textSelected : styles.textUnselected,
                    ]}
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected ? styles.textSelected : styles.textDark,
                    ]}
                  >
                    {item.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.month,
                      isSelected ? styles.textSelected : styles.textUnselected,
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Clock size={16} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Available In-Clinic Slots</Text>
          </View>

          {/* Morning Slots */}
          <View style={styles.timeGroup}>
            <View style={styles.timeGroupHeader}>
              <Sun size={14} color="#D97706" />
              <Text style={styles.timeGroupTitle}>Morning</Text>
            </View>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.morning.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTime(slot)}
                    style={[
                      styles.slotPill,
                      isSelected ? styles.slotSelected : styles.slotUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected ? styles.slotTextSelected : styles.slotTextUnselected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Afternoon Slots */}
          <View style={styles.timeGroup}>
            <View style={styles.timeGroupHeader}>
              <Sunset size={14} color="#EA580C" />
              <Text style={styles.timeGroupTitle}>Afternoon</Text>
            </View>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.afternoon.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTime(slot)}
                    style={[
                      styles.slotPill,
                      isSelected ? styles.slotSelected : styles.slotUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected ? styles.slotTextSelected : styles.slotTextUnselected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Evening Slots */}
          <View style={styles.timeGroup}>
            <View style={styles.timeGroupHeader}>
              <Moon size={14} color="#4F46E5" />
              <Text style={styles.timeGroupTitle}>Evening</Text>
            </View>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.evening.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTime(slot)}
                    style={[
                      styles.slotPill,
                      isSelected ? styles.slotSelected : styles.slotUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected ? styles.slotTextSelected : styles.slotTextUnselected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, shadows.card]}>
        <PrimaryButton
          title="Continue to Patient Details"
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
          style={styles.footerBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 90,
  },
  stepBox: {
    marginBottom: 20,
  },
  stepBadge: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  dateScroll: {
    gap: 10,
    paddingRight: 18,
  },
  dateCard: {
    width: 72,
    height: 90,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dateCardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    marginVertical: 2,
  },
  month: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.medium,
  },
  textSelected: {
    color: colors.textInverse,
  },
  textUnselected: {
    color: colors.textSecondary,
  },
  textDark: {
    color: colors.text,
  },
  timeGroup: {
    marginBottom: 16,
  },
  timeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  timeGroupTitle: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  slotUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
  },
  slotTextUnselected: {
    color: colors.text,
  },
  slotTextSelected: {
    color: colors.textInverse,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    width: '100%',
  },
});
