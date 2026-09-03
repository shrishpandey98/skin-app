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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  Stethoscope,
  Navigation,
  ArrowRight,
} from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { Appointment } from '../../types/appointment.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const BookingSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { appointment } = route.params || {};

  const handleGoHome = () => {
    navigation.getParent()?.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleViewInProfile = () => {
    navigation.getParent()?.navigate('ProfileFlow', {
      screen: 'MyAppointments',
      params: { initialTab: 'upcoming' },
    });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon Animation Box */}
        <View style={styles.successBox}>
          <View style={styles.iconCircle}>
            <CheckCircle size={48} color="#2D8A4E" />
          </View>
          <Text style={styles.successTitle}>Appointment Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your in-clinic booking is saved. The clinic team will be ready for you at your scheduled slot.
          </Text>
        </View>

        {/* Appointment Card */}
        <View style={[styles.ticketCard, shadows.card]}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketHeaderLabel}>IN-CLINIC APPOINTMENT</Text>
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedBadgeText}>CONFIRMED</Text>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleCol}>
              <Calendar size={15} color={colors.primaryDark} />
              <Text style={styles.scheduleText}>{appointment?.appointmentDate || 'Upcoming Date'}</Text>
            </View>
            <View style={styles.scheduleCol}>
              <Clock size={15} color={colors.primaryDark} />
              <Text style={styles.scheduleText}>{appointment?.appointmentTime || '11:30 AM'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Clinic */}
          <View style={styles.infoRow}>
            <Building2 size={16} color={colors.primary} style={styles.infoIcon} />
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Clinic</Text>
              <Text style={styles.infoValue}>{appointment?.clinic?.name || 'Aesthetica Clinic'}</Text>
              <Text style={styles.infoSubValue}>{appointment?.clinic?.address || 'Chandigarh'}</Text>
            </View>
          </View>

          {/* Doctor */}
          {appointment?.doctor ? (
            <View style={styles.infoRow}>
              <User size={16} color={colors.secondary} style={styles.infoIcon} />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Doctor</Text>
                <Text style={styles.infoValue}>{appointment.doctor.name}</Text>
              </View>
            </View>
          ) : null}

          {/* Procedure */}
          {appointment?.procedure ? (
            <View style={styles.infoRow}>
              <Stethoscope size={16} color={colors.peach} style={styles.infoIcon} />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Treatment Goal</Text>
                <Text style={styles.infoValue}>{appointment.procedure.name}</Text>
              </View>
            </View>
          ) : null}

          {/* Action to Get Directions */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={handleGetDirections}
            style={styles.directionsBtn}
          >
            <Navigation size={14} color={colors.primaryDark} />
            <Text style={styles.directionsBtnText}>Get Directions to Clinic</Text>
          </TouchableOpacity>
        </View>

        {/* CTA Buttons */}
        <View style={styles.actionsBox}>
          <PrimaryButton
            title="View in My Appointments"
            onPress={handleViewInProfile}
            style={styles.primaryActionBtn}
          />
          <PrimaryButton
            title="Back to Home Discovery"
            onPress={handleGoHome}
            variant="ghost"
            style={styles.ghostActionBtn}
          />
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EAF7EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 18,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketHeaderLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.8,
  },
  confirmedBadge: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  confirmedBadgeText: {
    fontSize: typography.fontSizes.micro - 1,
    fontWeight: typography.fontWeights.bold,
    color: '#226D3C',
  },
  scheduleRow: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 16,
    marginBottom: 12,
  },
  scheduleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  infoTextCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  infoSubValue: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 6,
    marginTop: 4,
  },
  directionsBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },
  actionsBox: {
    gap: 10,
  },
  primaryActionBtn: {},
  ghostActionBtn: {},
});
