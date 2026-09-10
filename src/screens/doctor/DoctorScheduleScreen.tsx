import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Building2,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Coffee,
  Ban,
  AlertCircle,
  Check,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { Appointment } from '../../types/appointment.types';
import { BlockedTimeSlot } from '../../types/clinic.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { openWhatsAppChat } from '../../utils/whatsapp';

const TIME_OPTIONS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
];

const REASON_PRESETS = [
  'Surgery / O.T.',
  'Lunch / Rest Break',
  'Emergency',
  'Personal Leave',
  'Out of Clinic',
  'Staff Meeting',
];

export const DoctorScheduleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    activeClinic,
    activeDoctor,
    clinicDoctors,
    doctorUser,
    selectedDoctorFilter,
    setSelectedDoctorFilter,
    stats,
    initializeDoctorPortal,
    updateAppointmentStatus,
    addBlockedTimeSlot,
    removeBlockedTimeSlot,
    loading,
  } = useDoctorStore();

  const { appointments } = useAppointmentsStore();
  const [filterMode, setFilterMode] = useState<'today' | 'pending' | 'all'>('today');

  // Blocked Slot Modal State
  const todayStr = new Date().toISOString().split('T')[0];
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockDateStr, setBlockDateStr] = useState(todayStr);
  const [isFullDay, setIsFullDay] = useState(false);
  const [blockStartTime, setBlockStartTime] = useState('02:00 PM');
  const [blockEndTime, setBlockEndTime] = useState('04:00 PM');
  const [blockReason, setBlockReason] = useState('Surgery / O.T.');
  const [customReason, setCustomReason] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  useEffect(() => {
    initializeDoctorPortal();
  }, []);

  const getTodayScheduleSummary = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayKey = days[new Date().getDay()];
    const todayHours = (activeClinic?.openingHours as any)?.[todayDayKey];
    if (!todayHours || todayHours.isClosed) {
      return { status: 'Closed Today', open: false, label: 'Off Duty' };
    }
    const slotMins = activeClinic?.openingHours?.slotDurationMinutes || 45;
    return {
      status: `Available Today: ${todayHours.open} – ${todayHours.close}`,
      open: true,
      label: `${slotMins}m slots`,
    };
  };

  const todaySchedule = getTodayScheduleSummary();

  const displayedAppointments = appointments.filter((apt) => {
    if (filterMode === 'today' && apt.appointmentDate !== todayStr) return false;
    if (filterMode === 'pending' && apt.status !== 'pending') return false;
    return true;
  });

  const blockedSlots: BlockedTimeSlot[] = activeClinic?.openingHours?.blockedSlots || [];
  // Sort blocked slots: today & upcoming first
  const activeBlockedSlots = blockedSlots
    .filter((b) => b.dateStr >= todayStr)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  const handleConfirm = async (aptId: string, apt: Appointment) => {
    await updateAppointmentStatus(aptId, 'confirmed');
    if (apt.patientPhone) {
      const docName = apt.doctor?.name || 'our specialist';
      openWhatsAppChat(
        apt.patientPhone,
        `Hello ${apt.patientName}, your appointment on ${apt.appointmentDate} at ${apt.appointmentTime} is CONFIRMED with ${docName} at ${activeClinic.name}.`
      );
    }
  };

  const handleComplete = async (aptId: string) => {
    await updateAppointmentStatus(aptId, 'completed');
  };

  const handleOpenDetail = (apt: Appointment) => {
    navigation.navigate('DoctorAppointmentDetail', { appointment: apt });
  };

  // Block Modal Handlers
  const handleOpenBlockModal = () => {
    setBlockDateStr(todayStr);
    setIsFullDay(false);
    setBlockStartTime('02:00 PM');
    setBlockEndTime('04:00 PM');
    setBlockReason('Surgery / O.T.');
    setCustomReason('');
    setIsBlockModalOpen(true);
  };

  const handleSaveBlockSlot = async () => {
    setSavingBlock(true);
    try {
      const finalReason = customReason.trim() ? customReason.trim() : blockReason;
      await addBlockedTimeSlot({
        dateStr: blockDateStr,
        isFullDay,
        startTime: isFullDay ? undefined : blockStartTime,
        endTime: isFullDay ? undefined : blockEndTime,
        reason: finalReason,
      });
      setIsBlockModalOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to block time period');
    } finally {
      setSavingBlock(false);
    }
  };

  const handleRemoveBlock = async (slotId: string) => {
    try {
      await removeBlockedTimeSlot(slotId);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to remove blocked slot');
    }
  };

  // Next 7 days list for date chips
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      const month = MONTH_NAMES[d.getMonth()];
      days.push({
        dateStr,
        label: `${dayName}, ${d.getDate()} ${month}`,
        shortLabel: `${dayName} ${d.getDate()}`,
      });
    }
    return days;
  };

  const formatSlotDate = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayName}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Clinic Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {activeClinic?.name?.trim() || doctorUser?.clinicName?.trim() || "Doctor's Clinic"}
          </Text>
          <Text style={styles.headerSubtitle}>Clinic Portal</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={initializeDoctorPortal}
          style={[styles.headerRefreshBtn, shadows.subtle]}
        >
          <RefreshCw size={15} color={colors.primary} />
          <Text style={styles.headerRefreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={initializeDoctorPortal} />
        }
      >
        {/* Doctor Info & Today's Availability Card */}
        <View style={[styles.docAvailabilityCard, shadows.subtle]}>
          <View style={styles.docAvailabilityTop}>
            <View style={styles.docAvatarMini}>
              <Text style={styles.docAvatarMiniText}>
                {(activeDoctor?.name || 'Dr').replace(/^Dr[\s\.\-_]+/i, '').charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
            <View style={styles.docAvailabilityTextCol}>
              <Text style={styles.docAvailabilityName}>
                {activeDoctor?.name || doctorUser?.name || 'Dr. Purva Pande'}
              </Text>
              <View style={styles.docAvailabilityBadgeRow}>
                <View
                  style={[
                    styles.availabilityDot,
                    todaySchedule.open ? styles.dotOpen : styles.dotClosed,
                  ]}
                />
                <Text style={styles.docAvailabilityHours}>
                  {todaySchedule.status} {todaySchedule.open ? `• ${todaySchedule.label}` : ''}
                </Text>
              </View>
            </View>

            {/* + Block Time Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenBlockModal}
              style={styles.blockTimeBtn}
            >
              <Plus size={14} color={colors.primaryDark} />
              <Text style={styles.blockTimeBtnText}>Block Time</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Blocked Slots / Leave Card */}
        {activeBlockedSlots.length > 0 && (
          <View style={[styles.blockedSlotsCard, shadows.subtle]}>
            <View style={styles.blockedCardHeader}>
              <View style={styles.blockedHeaderLeft}>
                <Ban size={15} color="#DC2626" />
                <Text style={styles.blockedCardTitle}>Blocked Periods & Time-Off</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenBlockModal}
                style={styles.addBlockMiniBtn}
              >
                <Plus size={12} color={colors.primary} />
                <Text style={styles.addBlockMiniBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.blockedList}>
              {activeBlockedSlots.map((slot) => (
                <View key={slot.id} style={styles.blockedItem}>
                  <View style={styles.blockedItemLeft}>
                    <View style={styles.blockedDateBadge}>
                      <Text style={styles.blockedDateBadgeText}>{formatSlotDate(slot.dateStr)}</Text>
                    </View>
                    <View style={styles.blockedDetails}>
                      <Text style={styles.blockedTimeText}>
                        {slot.isFullDay
                          ? '⛔ Entire Day Off'
                          : `⏰ ${slot.startTime} – ${slot.endTime}`}
                      </Text>
                      <Text style={styles.blockedReasonText}>
                        {slot.reason || 'Doctor Unavailable'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleRemoveBlock(slot.id)}
                    style={styles.removeBlockBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Minimal 3-Pill Status Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterMode('today')}
            style={[styles.filterPill, filterMode === 'today' && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filterMode === 'today' && styles.filterPillTextActive]}>
              Today ({stats.todayAppointmentsCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterMode('pending')}
            style={[styles.filterPill, filterMode === 'pending' && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filterMode === 'pending' && styles.filterPillTextActive]}>
              Pending ({stats.pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFilterMode('all')}
            style={[styles.filterPill, filterMode === 'all' && styles.filterPillActive]}
          >
            <Text style={[styles.filterPillText, filterMode === 'all' && styles.filterPillTextActive]}>
              All ({appointments.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointment Cards */}
        {displayedAppointments.length === 0 ? (
          <View style={[styles.emptyCard, shadows.subtle]}>
            <Calendar size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Appointments</Text>
            <Text style={styles.emptySubtitle}>
              {filterMode === 'today'
                ? 'No patient visits scheduled for today.'
                : 'No appointments in this view.'}
            </Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {displayedAppointments.map((apt) => {
              const isPending = apt.status === 'pending';
              const isConfirmed = apt.status === 'confirmed';
              const isCompleted = apt.status === 'completed';

              return (
                <TouchableOpacity
                  key={apt.id}
                  activeOpacity={0.9}
                  onPress={() => handleOpenDetail(apt)}
                  style={[styles.appointmentCard, shadows.card]}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.timeBadge}>
                      <Clock size={12} color={colors.primaryDark} />
                      <Text style={styles.timeBadgeText}>
                        {apt.appointmentTime} • {apt.appointmentDate}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusTag,
                        isPending && styles.statusTagPending,
                        isConfirmed && styles.statusTagConfirmed,
                        isCompleted && styles.statusTagCompleted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          isPending && styles.statusTagTextPending,
                          isConfirmed && styles.statusTagTextConfirmed,
                          isCompleted && styles.statusTagTextCompleted,
                        ]}
                      >
                        {apt.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.patientName}>{apt.patientName}</Text>
                  <Text style={styles.procedureName}>
                    {apt.procedure?.name || 'In-Clinic Consultation'}
                  </Text>

                  {/* Assigned Doctor Tag */}
                  <View style={styles.assignedDocBadge}>
                    <Text style={styles.assignedDocBadgeText}>
                      🩺 {apt.doctor?.name || 'Any Available Specialist'}
                    </Text>
                  </View>

                  {apt.notes ? (
                    <Text style={styles.notesSnippet} numberOfLines={1}>
                      "{apt.notes}"
                    </Text>
                  ) : null}

                  {/* Minimal 1-Tap Action Strip */}
                  <View style={styles.actionStrip}>
                    {apt.patientPhone && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          openWhatsAppChat(
                            apt.patientPhone!,
                            `Hello ${apt.patientName}, regarding your visit with ${apt.doctor?.name || 'our doctor'} at ${activeClinic.name}.`
                          )
                        }
                        style={styles.whatsappAction}
                      >
                        <MessageSquare size={13} color="#25D366" />
                        <Text style={styles.whatsappActionText}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}

                    {isPending && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleConfirm(apt.id, apt)}
                        style={styles.confirmAction}
                      >
                        <CheckCircle2 size={13} color="#FFFFFF" />
                        <Text style={styles.confirmActionText}>Confirm</Text>
                      </TouchableOpacity>
                    )}

                    {isConfirmed && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleComplete(apt.id)}
                        style={styles.doneAction}
                      >
                        <CheckCircle2 size={13} color="#2D8A4E" />
                        <Text style={styles.doneActionText}>Mark Done</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── MODAL: Block Time / Time-Off ── */}
      <Modal
        visible={isBlockModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsBlockModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Block Time / Time-Off</Text>
                <Text style={styles.modalSubtitle}>
                  Temporarily disable bookings for surgery, personal time, or break
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsBlockModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              {/* Select Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Date</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dateScroll}
                >
                  {getNext7Days().map((d) => (
                    <TouchableOpacity
                      key={d.dateStr}
                      activeOpacity={0.8}
                      onPress={() => setBlockDateStr(d.dateStr)}
                      style={[
                        styles.dateChip,
                        blockDateStr === d.dateStr && styles.dateChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateChipText,
                          blockDateStr === d.dateStr && styles.dateChipTextActive,
                        ]}
                      >
                        {d.shortLabel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Block Type Switch */}
              <View style={styles.blockTypeCard}>
                <View style={styles.blockTypeHeader}>
                  <Text style={styles.blockTypeTitle}>Entire Day Off</Text>
                  <Switch
                    value={isFullDay}
                    onValueChange={setIsFullDay}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={Platform.OS === 'android' ? (isFullDay ? colors.primaryDark : '#f4f3f4') : undefined}
                  />
                </View>
                <Text style={styles.blockTypeSubtitle}>
                  {isFullDay
                    ? 'All slots for this date will be closed in customer app'
                    : 'Block specific hours (e.g. 02:00 PM – 04:00 PM)'}
                </Text>
              </View>

              {/* Specific Hours Selector */}
              {!isFullDay && (
                <View style={styles.timeSelectSection}>
                  <View style={styles.timeGroup}>
                    <Text style={styles.formLabel}>Start Time</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.timeScroll}
                    >
                      {TIME_OPTIONS.slice(0, -1).map((t) => (
                        <TouchableOpacity
                          key={t}
                          activeOpacity={0.8}
                          onPress={() => setBlockStartTime(t)}
                          style={[
                            styles.miniTimeChip,
                            blockStartTime === t && styles.miniTimeChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniTimeChipText,
                              blockStartTime === t && styles.miniTimeChipTextActive,
                            ]}
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.timeGroup}>
                    <Text style={styles.formLabel}>End Time</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.timeScroll}
                    >
                      {TIME_OPTIONS.slice(1).map((t) => (
                        <TouchableOpacity
                          key={t}
                          activeOpacity={0.8}
                          onPress={() => setBlockEndTime(t)}
                          style={[
                            styles.miniTimeChip,
                            blockEndTime === t && styles.miniTimeChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.miniTimeChipText,
                              blockEndTime === t && styles.miniTimeChipTextActive,
                            ]}
                          >
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}

              {/* Reason Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reason / Label</Text>
                <View style={styles.reasonChipsWrap}>
                  {REASON_PRESETS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      activeOpacity={0.8}
                      onPress={() => {
                        setBlockReason(r);
                        setCustomReason('');
                      }}
                      style={[
                        styles.reasonChip,
                        blockReason === r && !customReason && styles.reasonChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          blockReason === r && !customReason && styles.reasonChipTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.customReasonInput}
                  placeholder="Or enter custom reason (e.g. Laser O.T. / Personal Leave)..."
                  placeholderTextColor={colors.textMuted}
                  value={customReason}
                  onChangeText={setCustomReason}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveBlockSlot}
                disabled={savingBlock}
                style={[styles.savePrimaryBtn, shadows.subtle]}
              >
                {savingBlock ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Ban size={17} color={colors.textInverse} />
                    <Text style={styles.savePrimaryBtnText}>
                      {isFullDay ? 'Block Entire Day' : `Block ${blockStartTime} – ${blockEndTime}`}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3 - 2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  headerRefreshText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },

  // Doctor Availability Summary Card
  docAvailabilityCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  docAvailabilityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docAvatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarMiniText: {
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  docAvailabilityTextCol: {
    flex: 1,
  },
  docAvailabilityName: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  docAvailabilityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOpen: {
    backgroundColor: '#2E7D32',
  },
  dotClosed: {
    backgroundColor: '#DC2626',
  },
  docAvailabilityHours: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  blockTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#E8D29F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  blockTimeBtnText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },

  // Blocked Slots List Card
  blockedSlotsCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
  },
  blockedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  blockedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockedCardTitle: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: '#991B1B',
  },
  addBlockMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  addBlockMiniBtnText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  blockedList: {
    gap: 8,
  },
  blockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  blockedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  blockedDateBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  blockedDateBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: '#991B1B',
  },
  blockedDetails: {
    flex: 1,
  },
  blockedTimeText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  blockedReasonText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  removeBlockBtn: {
    padding: 6,
  },

  // Minimal Status Filter Bar
  filterBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.pill,
    padding: 4,
    marginBottom: 16,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.pill,
  },
  filterPillActive: {
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  filterPillText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeights.bold,
  },

  // Assigned Doctor Badge
  assignedDocBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7F4EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginTop: 4,
    marginBottom: 6,
  },
  assignedDocBadgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },

  // Cards List
  cardsList: {
    gap: 12,
  },
  appointmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  timeBadgeText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  statusTagPending: {
    backgroundColor: '#FEF3C7',
  },
  statusTagConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusTagCompleted: {
    backgroundColor: '#E0E7FF',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.heavy,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statusTagTextPending: {
    color: '#92400E',
  },
  statusTagTextConfirmed: {
    color: '#15803D',
  },
  statusTagTextCompleted: {
    color: '#3730A3',
  },
  patientName: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  procedureName: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  notesSnippet: {
    fontSize: typography.fontSizes.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  actionStrip: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  whatsappAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  whatsappActionText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: '#1E7E34',
  },
  confirmAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D8A4E',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  confirmActionText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
  },
  doneAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  doneActionText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: '#2D8A4E',
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalForm: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: 8,
  },
  dateScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  dateChipTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },
  blockTypeCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  blockTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  blockTypeTitle: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  blockTypeSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timeSelectSection: {
    marginBottom: 14,
    gap: 10,
  },
  timeGroup: {
    gap: 4,
  },
  timeScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  miniTimeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  miniTimeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  miniTimeChipText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  miniTimeChipTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },
  reasonChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  reasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  reasonChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  reasonChipText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
    color: colors.text,
  },
  reasonChipTextActive: {
    color: '#92400E',
    fontWeight: typography.fontWeights.bold,
  },
  customReasonInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
  },
  savePrimaryBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savePrimaryBtnText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: '#FFFFFF',
  },
});
