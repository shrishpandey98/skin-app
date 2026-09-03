import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppointmentStatus } from '../../types/appointment.types';
import { borderRadius, typography } from '../../constants/theme';

interface StatusBadgeProps {
  status: AppointmentStatus;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          bg: '#EAF7EE',
          text: '#1E7E34',
          dot: '#28A745',
        };
      case 'pending':
        return {
          label: 'Awaiting Clinic',
          bg: '#FEF8EA',
          text: '#976200',
          dot: '#E5A93C',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: '#F1EFFB',
          text: '#58429B',
          dot: '#8E7CC3',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: '#FDECEC',
          text: '#C82333',
          dot: '#DC3545',
        };
      case 'rescheduled':
        return {
          label: 'Rescheduled',
          bg: '#EBF3FE',
          text: '#155724',
          dot: '#4285F4',
        };
      default:
        return {
          label: status,
          bg: '#F5F5F5',
          text: '#666',
          dot: '#999',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.semibold,
  },
});
