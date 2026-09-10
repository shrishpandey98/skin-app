import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Sun, Sunset, Moon, AlertCircle } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { clinicsService } from '../../services/clinics.service';
import { Clinic, OpeningHours } from '../../types/clinic.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(mins: number): string {
  let hours = Math.floor(mins / 60);
  const m = mins % 60;
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const formattedMin = m < 10 ? `0${m}` : `${m}`;
  const formattedHour = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHour}:${formattedMin} ${meridiem}`;
}

export const SelectDateTimeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clinicSlug, doctorSlug, procedureSlug } = route.params || {};

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    loadClinicData();
  }, [clinicSlug]);

  const loadClinicData = async () => {
    setLoading(true);
    const c = await clinicsService.getClinicBySlug(clinicSlug || 'aesthetica-skin-and-laser-clinic');
    if (c) {
      setClinic(c);
      // Auto-select first available open date
      const dates = generateDatesList(c.openingHours);
      const firstOpen = dates.find((d) => !d.isClosed);
      if (firstOpen) {
        setSelectedDate(firstOpen.dateStr);
        const slots = getSlotsForDate(firstOpen.dateStr, c.openingHours);
        const allSlots = [...slots.morning, ...slots.afternoon, ...slots.evening];
        if (allSlots.length > 0) {
          setSelectedTime(allSlots[0]);
        }
      } else if (dates.length > 0) {
        setSelectedDate(dates[0].dateStr);
      }
    }
    setLoading(false);
  };

  const generateDatesList = (openingHours?: OpeningHours) => {
    const dates = [];
    const today = new Date();
    const blockedSlots = openingHours?.blockedSlots || [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const dayKey = DAY_KEYS[dayIndex];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[dayIndex];
      const dayNumber = d.getDate();
      const month = MONTH_NAMES[d.getMonth()];

      const dayConfig = (openingHours as any)?.[dayKey];
      const isFullDayBlocked = blockedSlots.some(
        (b) => b.dateStr === dateStr && b.isFullDay
      );
      const isClosed = !dayConfig || dayConfig.isClosed || !dayConfig.open || dayConfig.open === 'Closed' || isFullDayBlocked;

      let openHours = dayConfig ? `${dayConfig.open} – ${dayConfig.close}` : 'Closed';
      if (isFullDayBlocked) {
        const blk = blockedSlots.find((b) => b.dateStr === dateStr && b.isFullDay);
        openHours = blk?.reason ? `${blk.reason} (Off)` : 'Doctor Unavailable';
      }

      dates.push({
        dateStr,
        dayName,
        dayNumber,
        month,
        fullLabel: `${dayName}, ${dayNumber} ${month}`,
        isClosed,
        openHours,
      });
    }
    return dates;
  };

  const getSlotsForDate = (dateStr: string, openingHours?: OpeningHours) => {
    if (!dateStr || !openingHours) {
      return { morning: [], afternoon: [], evening: [] };
    }

    // Check if full day is blocked for this date
    const blockedSlots = openingHours.blockedSlots || [];
    const isFullDayBlocked = blockedSlots.some(
      (b) => b.dateStr === dateStr && b.isFullDay
    );
    if (isFullDayBlocked) {
      return { morning: [], afternoon: [], evening: [] };
    }

    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayKey = DAY_KEYS[dateObj.getDay()];
    const dayConfig = (openingHours as any)?.[dayKey];

    if (!dayConfig || dayConfig.isClosed || !dayConfig.open || dayConfig.open === 'Closed') {
      return { morning: [], afternoon: [], evening: [] };
    }

    const startMins = parseTimeToMinutes(dayConfig.open) || 600; // 10:00 AM default
    const endMins = parseTimeToMinutes(dayConfig.close) || 1140; // 07:00 PM default
    const slotDuration = openingHours.slotDurationMinutes || 45;

    // Daily recurring break (e.g. Lunch 01:30 PM – 02:30 PM)
    const dailyBreak = openingHours.dailyBreak;
    const hasDailyBreak = !!(dailyBreak?.enabled && dailyBreak?.start && dailyBreak?.end);
    const dailyBreakStartMins = hasDailyBreak ? parseTimeToMinutes(dailyBreak.start) : 0;
    const dailyBreakEndMins = hasDailyBreak ? parseTimeToMinutes(dailyBreak.end) : 0;

    // Day-specific break
    const hasDayBreak = !!(dayConfig.hasBreak && dayConfig.breakStart && dayConfig.breakEnd);
    const dayBreakStartMins = hasDayBreak ? parseTimeToMinutes(dayConfig.breakStart) : 0;
    const dayBreakEndMins = hasDayBreak ? parseTimeToMinutes(dayConfig.breakEnd) : 0;

    // Date-specific blocked intervals
    const dateSpecificBlocks = blockedSlots
      .filter((b) => b.dateStr === dateStr && !b.isFullDay && b.startTime && b.endTime)
      .map((b) => ({
        start: parseTimeToMinutes(b.startTime),
        end: parseTimeToMinutes(b.endTime),
        reason: b.reason,
      }));

    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    // Filter past slots if date is today
    const now = new Date();
    const isToday = dateStr === now.toISOString().split('T')[0];
    const currentMins = now.getHours() * 60 + now.getMinutes() + 15; // 15 min buffer

    for (let t = startMins; t + slotDuration <= endMins; t += slotDuration) {
      const slotStart = t;
      const slotEnd = t + slotDuration;

      if (isToday && t <= currentMins) {
        continue;
      }

      // Check daily break collision
      if (hasDailyBreak && slotStart < dailyBreakEndMins && slotEnd > dailyBreakStartMins) {
        continue;
      }

      // Check day-specific break collision
      if (hasDayBreak && slotStart < dayBreakEndMins && slotEnd > dayBreakStartMins) {
        continue;
      }

      // Check date-specific blocked slots collision
      const isBlocked = dateSpecificBlocks.some(
        (b) => slotStart < b.end && slotEnd > b.start
      );
      if (isBlocked) {
        continue;
      }

      const formatted = formatMinutesToTime(t);
      if (t < 720) {
        // Before 12:00 PM
        morning.push(formatted);
      } else if (t < 1020) {
        // 12:00 PM to 05:00 PM
        afternoon.push(formatted);
      } else {
        // 05:00 PM onwards
        evening.push(formatted);
      }
    }

    return { morning, afternoon, evening };
  };

  const datesList = generateDatesList(clinic?.openingHours);
  const activeSlots = getSlotsForDate(selectedDate, clinic?.openingHours);
  const hasAnySlots =
    activeSlots.morning.length > 0 ||
    activeSlots.afternoon.length > 0 ||
    activeSlots.evening.length > 0;

  const selectedDateItem = datesList.find((d) => d.dateStr === selectedDate);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    const slots = getSlotsForDate(dateStr, clinic?.openingHours);
    const allSlots = [...slots.morning, ...slots.afternoon, ...slots.evening];
    if (allSlots.length > 0) {
      if (!selectedTime || !allSlots.includes(selectedTime)) {
        setSelectedTime(allSlots[0]);
      }
    } else {
      setSelectedTime(null);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    navigation.navigate('ConfirmDetails', {
      clinicSlug,
      doctorSlug: doctorSlug || (clinic?.doctors?.[0]?.slug),
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
          <Text style={styles.stepBadge}>
            {procedureSlug ? 'STEP 1 OF 3' : 'STEP 2 OF 4'}
          </Text>
          <Text style={styles.title}>When suits you best?</Text>
          <Text style={styles.subtitle}>
            Choose an appointment date and consultation slot aligned with doctor working hours.
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
            {datesList.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  activeOpacity={0.8}
                  onPress={() => handleDateSelect(item.dateStr)}
                  style={[
                    styles.dateCard,
                    item.isClosed && styles.dateCardClosed,
                    isSelected ? styles.dateCardSelected : styles.dateCardUnselected,
                    shadows.subtle,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected ? styles.textSelected : styles.textUnselected,
                      item.isClosed && !isSelected && styles.textMutedDay,
                    ]}
                  >
                    {item.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected ? styles.textSelected : styles.textDark,
                      item.isClosed && !isSelected && styles.textMutedDay,
                    ]}
                  >
                    {item.dayNumber}
                  </Text>
                  <Text
                    style={[
                      styles.month,
                      isSelected ? styles.textSelected : styles.textUnselected,
                      item.isClosed && !isSelected && styles.textMutedDay,
                    ]}
                  >
                    {item.month}
                  </Text>
                  {item.isClosed ? (
                    <View style={styles.closedPill}>
                      <Text style={styles.closedPillText}>Off</Text>
                    </View>
                  ) : null}
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

          {selectedDateItem?.isClosed || !hasAnySlots ? (
            <View style={styles.closedNoticeBox}>
              <AlertCircle size={20} color="#D97706" />
              <View style={styles.closedNoticeTextCol}>
                <Text style={styles.closedNoticeTitle}>No Slots Available on this Day</Text>
                <Text style={styles.closedNoticeSub}>
                  The doctor is off duty or all slots for today have concluded. Please select another date above.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Morning Slots */}
              {activeSlots.morning.length > 0 ? (
                <View style={styles.timeGroup}>
                  <View style={styles.timeGroupHeader}>
                    <Sun size={14} color="#D97706" />
                    <Text style={styles.timeGroupTitle}>Morning</Text>
                  </View>
                  <View style={styles.slotsGrid}>
                    {activeSlots.morning.map((slot) => {
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
              ) : null}

              {/* Afternoon Slots */}
              {activeSlots.afternoon.length > 0 ? (
                <View style={styles.timeGroup}>
                  <View style={styles.timeGroupHeader}>
                    <Sunset size={14} color="#EA580C" />
                    <Text style={styles.timeGroupTitle}>Afternoon</Text>
                  </View>
                  <View style={styles.slotsGrid}>
                    {activeSlots.afternoon.map((slot) => {
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
              ) : null}

              {/* Evening Slots */}
              {activeSlots.evening.length > 0 ? (
                <View style={styles.timeGroup}>
                  <View style={styles.timeGroupHeader}>
                    <Moon size={14} color="#4F46E5" />
                    <Text style={styles.timeGroupTitle}>Evening</Text>
                  </View>
                  <View style={styles.slotsGrid}>
                    {activeSlots.evening.map((slot) => {
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
              ) : null}
            </>
          )}
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
    paddingBottom: 24,
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
  dateCardClosed: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    opacity: 0.7,
  },
  closedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.pill,
    marginTop: 3,
  },
  closedPillText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: '#DC2626',
  },
  textMutedDay: {
    color: colors.textMuted,
  },
  closedNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
    marginTop: 8,
  },
  closedNoticeTextCol: {
    flex: 1,
  },
  closedNoticeTitle: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: '#92400E',
    marginBottom: 4,
  },
  closedNoticeSub: {
    fontSize: typography.fontSizes.caption,
    color: '#B45309',
    lineHeight: 18,
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
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    width: '100%',
  },
});
