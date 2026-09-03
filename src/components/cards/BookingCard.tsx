import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Calendar, Clock, MapPin, User, Stethoscope } from 'lucide-react-native';
import { Appointment } from '../../types/appointment.types';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

interface BookingCardProps {
  appointment: Appointment;
  onPress: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  style?: ViewStyle;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  appointment,
  onPress,
  onReschedule,
  onCancel,
  style,
}) => {
  const isUpcoming =
    appointment.status === 'confirmed' ||
    appointment.status === 'pending' ||
    appointment.status === 'rescheduled';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, shadows.card, style]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.clinicName} numberOfLines={1}>
          {appointment.clinic?.name || 'Aesthetic Clinic'}
        </Text>
        <StatusBadge status={appointment.status} />
      </View>

      <View style={styles.locationRow}>
        <MapPin size={13} color={colors.textMuted} />
        <Text style={styles.locationText} numberOfLines={1}>
          {appointment.clinic?.address || appointment.clinic?.area || 'Chandigarh'}
        </Text>
      </View>

      <View style={styles.divider} />

      {appointment.procedure ? (
        <View style={styles.detailRow}>
          <Stethoscope size={14} color={colors.primary} />
          <Text style={styles.detailLabel}>Treatment:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {appointment.procedure.name}
          </Text>
        </View>
      ) : null}

      {appointment.doctor ? (
        <View style={styles.detailRow}>
          <User size={14} color={colors.secondary} />
          <Text style={styles.detailLabel}>Doctor:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {appointment.doctor.name}
          </Text>
        </View>
      ) : null}

      <View style={styles.dateTimeBadge}>
        <View style={styles.timeItem}>
          <Calendar size={14} color={colors.primaryDark} />
          <Text style={styles.timeText}>{appointment.appointmentDate}</Text>
        </View>
        <View style={styles.timeItem}>
          <Clock size={14} color={colors.primaryDark} />
          <Text style={styles.timeText}>{appointment.appointmentTime}</Text>
        </View>
      </View>

      {isUpcoming && (onReschedule || onCancel) ? (
        <View style={styles.actionsRow}>
          {onReschedule ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onReschedule}
              style={styles.rescheduleBtn}
            >
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
          ) : null}
          {onCancel ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  clinicName: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginLeft: 6,
    marginRight: 4,
  },
  detailValue: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    flex: 1,
  },
  dateTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    gap: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    gap: 10,
  },
  rescheduleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceSubtle,
  },
  rescheduleBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    backgroundColor: '#FDECEC',
  },
  cancelBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: '#DC3545',
  },
});
