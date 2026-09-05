import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  Stethoscope,
  Sparkles,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { Appointment, AppointmentStatus } from '../../types/appointment.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const DoctorAppointmentDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { appointment: initialApt } = route.params || {};

  const { activeClinic, activeDoctor, updateAppointmentStatus } = useDoctorStore();
  const [appointment, setAppointment] = useState<Appointment>(initialApt);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!appointment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Details</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    setIsUpdating(true);
    await updateAppointmentStatus(appointment.id, newStatus, clinicalNotes);
    setAppointment({ ...appointment, status: newStatus });
    setIsUpdating(false);

    if (newStatus === 'confirmed' && appointment.patientPhone) {
      openWhatsAppChat(
        appointment.patientPhone,
        `Hello ${appointment.patientName}, your consultation on ${appointment.appointmentDate} at ${appointment.appointmentTime} is CONFIRMED with ${activeDoctor.name || 'the doctor'} at ${activeClinic.name || 'our clinic'}.`
      );
    }
  };

  const handleSendWhatsAppReminder = () => {
    if (appointment.patientPhone) {
      openWhatsAppChat(
        appointment.patientPhone,
        `Hello ${appointment.patientName}, this is a gentle reminder from ${activeClinic.name || 'our clinic'} regarding your appointment with ${activeDoctor.name || 'the doctor'} on ${appointment.appointmentDate} at ${appointment.appointmentTime}. Please arrive 10 minutes early. Let us know if you need to adjust your time!`
      );
    }
  };

  const isPending = appointment.status === 'pending';
  const isConfirmed = appointment.status === 'confirmed';
  const isCompleted = appointment.status === 'completed';
  const isCancelled = appointment.status === 'cancelled';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Hero Card */}
        <View style={[styles.heroCard, shadows.card]}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.statusPill,
                isPending && styles.statusPillPending,
                isConfirmed && styles.statusPillConfirmed,
                isCompleted && styles.statusPillCompleted,
                isCancelled && styles.statusPillCancelled,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  isPending && styles.statusPillTextPending,
                  isConfirmed && styles.statusPillTextConfirmed,
                  isCompleted && styles.statusPillTextCompleted,
                  isCancelled && styles.statusPillTextCancelled,
                ]}
              >
                STATUS: {appointment.status.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.bookingIdText}>ID: #{appointment.id.slice(-6)}</Text>
          </View>

          <Text style={styles.patientName}>{appointment.patientName}</Text>
          <Text style={styles.procedureName}>
            {appointment.procedure?.name || 'In-Clinic General Consultation'}
          </Text>

          <View style={styles.scheduleRow}>
            <Calendar size={15} color={colors.primary} />
            <Text style={styles.scheduleText}>
              {appointment.appointmentDate} at {appointment.appointmentTime}
            </Text>
          </View>
        </View>

        {/* Patient Contact Info */}
        <View style={[styles.infoSection, shadows.subtle]}>
          <Text style={styles.sectionHeader}>Patient Details</Text>

          <View style={styles.infoRow}>
            <User size={16} color={colors.primary} />
            <Text style={styles.infoValue}>{appointment.patientName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Phone size={16} color={colors.primary} />
            <Text style={styles.infoValue}>{appointment.patientPhone || 'Not provided'}</Text>
          </View>

          {appointment.patientEmail ? (
            <View style={styles.infoRow}>
              <Mail size={16} color={colors.textSecondary} />
              <Text style={styles.infoValue}>{appointment.patientEmail}</Text>
            </View>
          ) : null}

          {appointment.notes ? (
            <View style={styles.patientNotesBox}>
              <Text style={styles.patientNotesLabel}>Patient Booking Note:</Text>
              <Text style={styles.patientNotesContent}>"{appointment.notes}"</Text>
            </View>
          ) : null}
        </View>

        {/* Doctor Consultation Notes Input */}
        <View style={[styles.infoSection, shadows.subtle]}>
          <Text style={styles.sectionHeader}>Clinical / Doctor Notes</Text>
          <TextInput
            style={styles.doctorNotesInput}
            placeholder="Add clinical observations, skin analysis notes, or procedure plan..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={clinicalNotes}
            onChangeText={setClinicalNotes}
          />
        </View>

        {/* Action Controls */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionHeader}>Manage Appointment Status</Text>

          <View style={styles.statusButtonsCol}>
            {isPending && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleStatusChange('confirmed')}
                style={[styles.actionBtn, styles.confirmActionBtn]}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.confirmActionBtnText}>Confirm & Send WhatsApp Confirmation</Text>
              </TouchableOpacity>
            )}

            {isConfirmed && !isCompleted && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleStatusChange('completed')}
                style={[styles.actionBtn, styles.completeActionBtn]}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.completeActionBtnText}>Mark Consultation as Completed</Text>
              </TouchableOpacity>
            )}

            {appointment.patientPhone && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendWhatsAppReminder}
                style={[styles.actionBtn, styles.reminderActionBtn]}
              >
                <MessageSquare size={18} color="#1E7E34" />
                <Text style={styles.reminderActionBtnText}>Send WhatsApp Reminder</Text>
              </TouchableOpacity>
            )}

            {!isCancelled && !isCompleted && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  Alert.alert(
                    'Cancel Appointment',
                    'Are you sure you want to cancel this appointment?',
                    [
                      { text: 'No', style: 'cancel' },
                      { text: 'Yes, Cancel', style: 'destructive', onPress: () => handleStatusChange('cancelled') },
                    ]
                  );
                }}
                style={[styles.actionBtn, styles.cancelActionBtn]}
              >
                <XCircle size={18} color="#D32F2F" />
                <Text style={styles.cancelActionBtnText}>Cancel Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
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
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  statusPillPending: {
    backgroundColor: '#FFF4E5',
  },
  statusPillConfirmed: {
    backgroundColor: '#EAF7EE',
  },
  statusPillCompleted: {
    backgroundColor: '#EEF2FF',
  },
  statusPillCancelled: {
    backgroundColor: '#FDF2F2',
  },
  statusPillText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.heavy,
    letterSpacing: 0.5,
  },
  statusPillTextPending: {
    color: '#B26A00',
  },
  statusPillTextConfirmed: {
    color: '#2D8A4E',
  },
  statusPillTextCompleted: {
    color: '#4F46E5',
  },
  statusPillTextCancelled: {
    color: '#D32F2F',
  },
  bookingIdText: {
    fontSize: typography.fontSizes.micro + 0.5,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.semibold,
  },
  patientName: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    marginBottom: 2,
  },
  procedureName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: 10,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  scheduleText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },

  // Info Sections
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoValue: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  patientNotesBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: 6,
  },
  patientNotesLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
  },
  patientNotesContent: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 2,
  },

  doctorNotesInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: 12,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Action Buttons
  actionsSection: {
    marginTop: 4,
  },
  statusButtonsCol: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    gap: 8,
  },
  confirmActionBtn: {
    backgroundColor: '#2D8A4E',
  },
  confirmActionBtnText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
  },
  completeActionBtn: {
    backgroundColor: colors.primary,
  },
  completeActionBtnText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
  },
  reminderActionBtn: {
    backgroundColor: '#E7F9EE',
    borderWidth: 1.5,
    borderColor: '#B3E6C5',
  },
  reminderActionBtnText: {
    color: '#1E7E34',
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
  },
  cancelActionBtn: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1.5,
    borderColor: '#F8D7DA',
  },
  cancelActionBtnText: {
    color: '#D32F2F',
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
  },
});
