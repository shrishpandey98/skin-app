import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  User,
  Stethoscope,
  MapPin,
  Navigation,
  Phone,
  AlertTriangle,
} from 'lucide-react-native';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const AppointmentDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { appointmentId } = route.params || {};

  const { appointments, cancelAppointment } = useAppointmentsStore();
  const appointment = appointments.find((a) => a.id === appointmentId) || appointments[0];

  const isUpcoming =
    appointment?.status === 'confirmed' ||
    appointment?.status === 'pending' ||
    appointment?.status === 'rescheduled';

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this appointment?', [
      { text: 'No, Keep it', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          cancelAppointment(appointment.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleGetDirections = () => {
    if (!appointment?.clinic) return;
    const query = encodeURIComponent(`${appointment.clinic.name} ${appointment.clinic.address}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url!).catch(console.warn);
  };

  const handleCall = () => {
    if (appointment?.clinic?.phone) {
      Linking.openURL(`tel:${appointment.clinic.phone.replace(/\s+/g, '')}`).catch(console.warn);
    }
  };

  if (!appointment) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Header Box */}
        <View style={[styles.statusBox, shadows.subtle]}>
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>
            <StatusBadge status={appointment.status} style={styles.statusBadge} />
          </View>
          <Text style={styles.refId}>ID: #{appointment.id.slice(-6).toUpperCase()}</Text>
        </View>

        {/* Schedule Box */}
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.cardHeaderTitle}>Schedule</Text>
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <Calendar size={16} color={colors.primary} />
              <Text style={styles.scheduleText}>{appointment.appointmentDate}</Text>
            </View>
            <View style={styles.scheduleItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.scheduleText}>{appointment.appointmentTime}</Text>
            </View>
          </View>
        </View>

        {/* Clinic & Location */}
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.cardHeaderTitle}>Clinic</Text>
          <View style={styles.itemRow}>
            <Building2 size={18} color={colors.primary} />
            <View style={styles.itemTextCol}>
              <Text style={styles.itemBold}>{appointment.clinic?.name || 'Aesthetic Clinic'}</Text>
              <Text style={styles.itemMuted}>{appointment.clinic?.address || 'Chandigarh'}</Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={handleGetDirections}
              style={styles.actionPill}
            >
              <Navigation size={13} color={colors.primaryDark} />
              <Text style={styles.actionPillText}>Get Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.82} onPress={handleCall} style={styles.actionPill}>
              <Phone size={13} color={colors.primaryDark} />
              <Text style={styles.actionPillText}>Call Clinic</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Practitioner */}
        {appointment.doctor ? (
          <View style={[styles.card, shadows.card]}>
            <Text style={styles.cardHeaderTitle}>Practitioner</Text>
            <View style={styles.itemRow}>
              <User size={18} color={colors.secondary} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemBold}>{appointment.doctor.name}</Text>
                <Text style={styles.itemMuted}>{appointment.doctor.specialization}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Treatment Goal */}
        {appointment.procedure ? (
          <View style={[styles.card, shadows.card]}>
            <Text style={styles.cardHeaderTitle}>Treatment Goal</Text>
            <View style={styles.itemRow}>
              <Stethoscope size={18} color={colors.peach} />
              <View style={styles.itemTextCol}>
                <Text style={styles.itemBold}>{appointment.procedure.name}</Text>
                <Text style={styles.itemMuted}>{appointment.procedure.shortDescription}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Patient Details */}
        <View style={[styles.card, shadows.card]}>
          <Text style={styles.cardHeaderTitle}>Patient</Text>
          <Text style={styles.patientName}>{appointment.patientName}</Text>
          <Text style={styles.patientPhone}>{appointment.patientPhone}</Text>
          {appointment.notes ? (
            <Text style={styles.patientNotes}>Notes: {appointment.notes}</Text>
          ) : null}
        </View>

        {/* Cancellation CTA if upcoming */}
        {isUpcoming ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCancel}
            style={styles.cancelBookingBtn}
          >
            <AlertTriangle size={15} color="#DC3545" />
            <Text style={styles.cancelBookingText}>Cancel this Appointment</Text>
          </TouchableOpacity>
        ) : null}
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
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  statusBadge: {
    marginTop: 2,
  },
  refId: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemTextCol: {
    flex: 1,
  },
  itemBold: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  itemMuted: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    gap: 6,
  },
  actionPillText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },
  patientName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  patientPhone: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  patientNotes: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
  },
  cancelBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginTop: 6,
  },
  cancelBookingText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: '#DC3545',
  },
});
