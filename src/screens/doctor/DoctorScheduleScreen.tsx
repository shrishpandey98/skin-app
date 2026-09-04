import React, { useEffect } from 'react';
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
  User,
  Stethoscope,
  CheckCircle2,
  Clock3,
  XCircle,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  Building2,
  TrendingUp,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { useAppointmentsStore } from '../../stores/appointments.store';
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

  useEffect(() => {
    initializeDoctorPortal();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
  const pendingAppointments = appointments.filter((a) => a.status === 'pending');

  const handleConfirm = async (aptId: string, apt: any) => {
    await updateAppointmentStatus(aptId, 'confirmed');
    // Offer quick WhatsApp confirmation
    if (apt.patientPhone) {
      openWhatsAppChat(
        apt.patientPhone,
        `Hello ${apt.patientName}, your in-clinic consultation at ${activeClinic.name} for ${apt.appointmentDate} at ${apt.appointmentTime} is CONFIRMED with ${activeDoctor.name}. See you soon!`
      );
    }
  };

  const handleComplete = async (aptId: string) => {
    await updateAppointmentStatus(aptId, 'completed', 'Treatment completed successfully.');
  };

  const handleOpenDetail = (apt: any) => {
    navigation.navigate('DoctorAppointmentDetail', { appointment: apt });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.clinicBadge}>
            <Building2 size={14} color={colors.primary} />
            <Text style={styles.clinicBadgeText} numberOfLines={1}>
              {activeClinic.name}
            </Text>
          </View>
          <Text style={styles.headerTitle}>Dr. Purva's Portal</Text>
          <Text style={styles.headerSubtitle}>Live Schedule & Patient Queue</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('DoctorProcedures')}
          style={styles.headerActionBtn}
        >
          <Sparkles size={16} color={colors.primaryDark} />
          <Text style={styles.headerActionBtnText}>Knowledge Base</Text>
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
        {/* Metric Cards Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadows.subtle, { borderLeftColor: colors.primary }]}>
            <Text style={styles.statNumber}>{stats.todayAppointmentsCount}</Text>
            <Text style={styles.statLabel}>Today's Queue</Text>
          </View>

          <View style={[styles.statCard, shadows.subtle, { borderLeftColor: '#E65100' }]}>
            <Text style={[styles.statNumber, { color: '#E65100' }]}>{stats.pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>

          <View style={[styles.statCard, shadows.subtle, { borderLeftColor: '#2D8A4E' }]}>
            <Text style={[styles.statNumber, { color: '#2D8A4E' }]}>{stats.confirmedCount}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>

          <View style={[styles.statCard, shadows.subtle, { borderLeftColor: colors.secondary }]}>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>{stats.totalPatientsCount}</Text>
            <Text style={styles.statLabel}>Total Patients</Text>
          </View>
        </View>

        {/* Action Banner: Pending Requests */}
        {pendingAppointments.length > 0 && (
          <View style={[styles.actionBanner, shadows.subtle]}>
            <View style={styles.bannerHeader}>
              <Clock3 size={18} color="#E65100" />
              <Text style={styles.bannerTitle}>
                {pendingAppointments.length} Appointment Request(s) Awaiting Confirmation
              </Text>
            </View>
            <Text style={styles.bannerSubtitle}>
              Patients receive instant WhatsApp updates when you confirm.
            </Text>

            {pendingAppointments.slice(0, 2).map((apt) => (
              <View key={apt.id} style={styles.pendingAptRow}>
                <View style={styles.pendingTextCol}>
                  <Text style={styles.pendingPatientName}>{apt.patientName}</Text>
                  <Text style={styles.pendingDetails}>
                    {apt.procedure?.name || 'General Consultation'} • {apt.appointmentDate} at {apt.appointmentTime}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleConfirm(apt.id, apt)}
                  style={styles.quickConfirmBtn}
                >
                  <CheckCircle2 size={15} color="#FFFFFF" />
                  <Text style={styles.quickConfirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Today's Schedule Timeline Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Today's Schedule ({todayAppointments.length})</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('DoctorAppointments')}
          >
            <Text style={styles.viewAllText}>All Appointments →</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length === 0 ? (
          <View style={[styles.emptyBox, shadows.subtle]}>
            <Calendar size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Appointments Scheduled for Today</Text>
            <Text style={styles.emptySubtitle}>
              New customer bookings will appear here in real-time.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineList}>
            {todayAppointments.map((apt) => {
              const isConfirmed = apt.status === 'confirmed';
              const isCompleted = apt.status === 'completed';

              return (
                <TouchableOpacity
                  key={apt.id}
                  activeOpacity={0.9}
                  onPress={() => handleOpenDetail(apt)}
                  style={[styles.appointmentCard, shadows.card]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.timeTag}>
                      <Clock size={13} color={colors.primaryDark} />
                      <Text style={styles.timeText}>{apt.appointmentTime}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        isConfirmed && styles.statusPillConfirmed,
                        isCompleted && styles.statusPillCompleted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isConfirmed && styles.statusPillTextConfirmed,
                          isCompleted && styles.statusPillTextCompleted,
                        ]}
                      >
                        {apt.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.patientName}>{apt.patientName}</Text>
                  <Text style={styles.procedureName}>
                    {apt.procedure?.name || 'In-Clinic Dermatological Consultation'}
                  </Text>

                  {apt.notes ? (
                    <Text style={styles.patientNotes} numberOfLines={2}>
                      Note: "{apt.notes}"
                    </Text>
                  ) : null}

                  {/* Quick Action Footer */}
                  <View style={styles.cardFooter}>
                    {apt.patientPhone && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => openWhatsAppChat(apt.patientPhone, `Hello ${apt.patientName}, checking in regarding your visit today at ${activeClinic.name}.`)}
                        style={styles.chatActionBtn}
                      >
                        <MessageSquare size={14} color="#25D366" />
                        <Text style={styles.chatActionBtnText}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}

                    {isConfirmed && !isCompleted && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleComplete(apt.id)}
                        style={styles.completeActionBtn}
                      >
                        <CheckCircle2 size={14} color="#2D8A4E" />
                        <Text style={styles.completeActionBtnText}>Mark Done</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetail(apt)}
                      style={styles.detailsBtn}
                    >
                      <Text style={styles.detailsBtnText}>Details</Text>
                      <ArrowRight size={13} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick Knowledge Base Link Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('DoctorProcedures')}
          style={[styles.knowledgeBaseCard, shadows.card]}
        >
          <View style={styles.kbLeft}>
            <View style={styles.kbIconCircle}>
              <Sparkles size={20} color={colors.primary} />
            </View>
            <View style={styles.kbTextCol}>
              <Text style={styles.kbTitle}>Procedure Knowledge Base</Text>
              <Text style={styles.kbSubtitle}>
                Manage clinic pricing or add new procedures to the central database.
              </Text>
            </View>
          </View>
          <ArrowRight size={18} color={colors.primary} />
        </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  clinicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  clinicBadgeText: {
    fontSize: typography.fontSizes.micro,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.bold,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  headerActionBtnText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },

  // Stats Grid
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderLeftWidth: 3.5,
  },
  statNumber: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSizes.micro - 0.5,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
    marginTop: 2,
    textAlign: 'center',
  },

  // Action Banner
  actionBanner: {
    backgroundColor: '#FFF8F0',
    borderWidth: 1.5,
    borderColor: '#FFD8B2',
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 18,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: typography.fontSizes.caption + 1,
    fontWeight: typography.fontWeights.bold,
    color: '#D95D00',
  },
  bannerSubtitle: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  pendingAptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  pendingTextCol: {
    flex: 1,
    marginRight: 10,
  },
  pendingPatientName: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  pendingDetails: {
    fontSize: typography.fontSizes.micro + 0.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D8A4E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  quickConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.micro + 1,
    fontWeight: typography.fontWeights.bold,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },

  // Empty Box
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Timeline & Appointments
  timelineList: {
    gap: 12,
    marginBottom: 18,
  },
  appointmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  timeText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  statusPill: {
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusPillConfirmed: {
    backgroundColor: '#EAF7EE',
  },
  statusPillCompleted: {
    backgroundColor: '#EEF2FF',
  },
  statusPillText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: '#B26A00',
  },
  statusPillTextConfirmed: {
    color: '#2D8A4E',
  },
  statusPillTextCompleted: {
    color: '#4F46E5',
  },
  patientName: {
    fontSize: typography.fontSizes.h3 - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  procedureName: {
    fontSize: typography.fontSizes.caption + 1,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 6,
  },
  patientNotes: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
    fontStyle: 'italic',
    backgroundColor: colors.surfaceSubtle,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginBottom: 10,
  },

  // Card Footer Actions
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 10,
    gap: 10,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  chatActionBtnText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: '#1E7E34',
  },
  completeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  completeActionBtnText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: '#2D8A4E',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  detailsBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },

  // Knowledge Base Banner Card
  knowledgeBaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6EE',
    borderWidth: 1.5,
    borderColor: '#E8D29F',
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  kbLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  kbIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kbTextCol: {
    flex: 1,
  },
  kbTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  kbSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
