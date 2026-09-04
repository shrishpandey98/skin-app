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
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { Appointment } from '../../types/appointment.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const DoctorScheduleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    activeClinic,
    activeDoctor,
    stats,
    initializeDoctorPortal,
    updateAppointmentStatus,
    loading,
  } = useDoctorStore();

  const { appointments } = useAppointmentsStore();
  const [filterMode, setFilterMode] = useState<'today' | 'pending' | 'all'>('today');

  useEffect(() => {
    initializeDoctorPortal();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const displayedAppointments = appointments.filter((apt) => {
    if (filterMode === 'today') return apt.appointmentDate === todayStr;
    if (filterMode === 'pending') return apt.status === 'pending';
    return true; // 'all'
  });

  const handleConfirm = async (aptId: string, apt: Appointment) => {
    await updateAppointmentStatus(aptId, 'confirmed');
    if (apt.patientPhone) {
      openWhatsAppChat(
        apt.patientPhone,
        `Hello ${apt.patientName}, your appointment on ${apt.appointmentDate} at ${apt.appointmentTime} is CONFIRMED with ${activeDoctor.name} at ${activeClinic.name}.`
      );
    }
  };

  const handleComplete = async (aptId: string) => {
    await updateAppointmentStatus(aptId, 'completed');
  };

  const handleOpenDetail = (apt: Appointment) => {
    navigation.navigate('DoctorAppointmentDetail', { appointment: apt });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Clean Minimal Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.clinicNameText}>{activeClinic.name}</Text>
          <Text style={styles.headerTitle}>Doctor Appointments</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('DoctorProcedures')}
          style={styles.headerPillBtn}
        >
          <Sparkles size={14} color={colors.primaryDark} />
          <Text style={styles.headerPillBtnText}>Edit Prices</Text>
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
        {/* Minimal 3-Pill Filter Bar */}
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
                            `Hello ${apt.patientName}, regarding your visit with ${activeDoctor.name} at ${activeClinic.name}.`
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
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  clinicNameText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  headerPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  headerPillBtnText: {
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

  // Minimal Filter Bar
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

  // Appointment Cards List
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingVertical: 2.5,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  statusTagPending: {
    backgroundColor: '#FFF4E5',
  },
  statusTagConfirmed: {
    backgroundColor: '#EAF7EE',
  },
  statusTagCompleted: {
    backgroundColor: '#EEF2FF',
  },
  statusTagText: {
    fontSize: typography.fontSizes.micro - 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
  },
  statusTagTextPending: {
    color: '#B26A00',
  },
  statusTagTextConfirmed: {
    color: '#2D8A4E',
  },
  statusTagTextCompleted: {
    color: '#4F46E5',
  },

  patientName: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  procedureName: {
    fontSize: typography.fontSizes.caption + 1,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  notesSnippet: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 10,
  },

  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 10,
    gap: 8,
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
});
