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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Globe,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const DoctorSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { activeClinic, activeDoctor, setDoctorMode } = useDoctorStore();

  const handleSwitchToCustomer = () => {
    setDoctorMode(false);
    navigation.navigate('MainTabs');
  };

  const days = [
    { day: 'Monday – Friday', hours: '10:00 AM – 07:00 PM' },
    { day: 'Saturday', hours: '10:00 AM – 06:30 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clinic & Portal Settings</Text>
        <Text style={styles.headerSubtitle}>{activeClinic.name}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Switch Role Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleSwitchToCustomer}
          style={[styles.switchCard, shadows.card]}
        >
          <View style={styles.switchLeft}>
            <View style={styles.switchIcon}>
              <RotateCcw size={20} color={colors.primary} />
            </View>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Switch to Customer App</Text>
              <Text style={styles.switchSubtitle}>
                Browse marketplace treatments and view live customer experience.
              </Text>
            </View>
          </View>
          <ArrowRight size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Clinic Info Section */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.cardHeader}>
            <Building2 size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Clinic Profile</Text>
          </View>

          <Text style={styles.clinicName}>{activeClinic.name}</Text>
          <Text style={styles.clinicDesc}>{activeClinic.description}</Text>

          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{activeClinic.address}</Text>
          </View>

          <View style={styles.detailRow}>
            <Phone size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{activeClinic.phone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{activeClinic.email}</Text>
          </View>
        </View>

        {/* Operating Hours */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.cardHeader}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Operating Hours</Text>
          </View>

          {days.map((d, idx) => (
            <View key={idx} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{d.day}</Text>
              <Text style={[styles.dayHours, d.hours === 'Closed' && styles.closedText]}>
                {d.hours}
              </Text>
            </View>
          ))}
        </View>

        {/* Doctor Credentials */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.cardHeader}>
            <User size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Chief Dermatologist Profile</Text>
          </View>

          <Text style={styles.doctorName}>{activeDoctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{activeDoctor.specialization}</Text>
          <Text style={styles.doctorQualification}>{activeDoctor.qualification}</Text>
          <Text style={styles.doctorBio}>{activeDoctor.bio}</Text>
        </View>

        {/* Knowledge Base Link */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('DoctorProcedures')}
          style={[styles.linkBtn, shadows.subtle]}
        >
          <View style={styles.linkBtnLeft}>
            <Sparkles size={18} color={colors.primaryDark} />
            <Text style={styles.linkBtnText}>Master Procedure Knowledge Base & Pricing</Text>
          </View>
          <ArrowRight size={16} color={colors.primaryDark} />
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // Switch Role Card
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6EE',
    borderWidth: 1.5,
    borderColor: '#E8D29F',
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  switchSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  clinicName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  clinicDesc: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
  },

  // Operating Hours
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  dayLabel: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },
  dayHours: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  closedText: {
    color: '#D32F2F',
  },

  // Doctor Info
  doctorName: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  doctorSpecialization: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
    marginTop: 2,
  },
  doctorQualification: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  doctorBio: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Link Button
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkBtnText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
});
