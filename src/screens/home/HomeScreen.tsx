import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Sparkles,
  SunMedium,
  Zap,
  Droplets,
  Syringe,
  Pipette,
  HeartPulse,
  FlaskConical,
  Target,
  Bandage,
  TrendingUp,
  Grid,
  CheckCircle2,
  ArrowRight,
  Bot,
} from 'lucide-react-native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { MOCK_PROCEDURES, MOCK_CLINICS } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';
import { proceduresService } from '../../services/procedures.service';
import { clinicsService } from '../../services/clinics.service';
import { Clinic } from '../../types/clinic.types';
import { useAppointmentsStore } from '../../stores/appointments.store';

// 12 Common Procedures with True-to-Procedure Clinical & Aesthetic Icons
const ALL_PROCEDURES_ICONS = [
  {
    slug: 'hydrafacial',
    name: 'HydraFacial',
    icon: Droplets, // Deep hydration & vortex water cleansing
    color: '#0284C7',
    bg: '#E0F2FE',
  },
  {
    slug: 'laser-hair-removal',
    name: 'Laser Hair',
    icon: Zap, // Laser light pulses
    color: '#EA580C',
    bg: '#FFEDD5',
  },
  {
    slug: 'botox',
    name: 'Botox',
    icon: Syringe, // Neuromodulator micro-injection
    color: '#4F46E5',
    bg: '#EEF2FF',
  },
  {
    slug: 'dermal-fillers',
    name: 'Fillers',
    icon: Pipette, // Precision micro-droplet contouring
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    slug: 'prp-hair-treatment',
    name: 'PRP Hair',
    icon: HeartPulse, // Platelet-rich plasma & vascular stimulation
    color: '#DC2626',
    bg: '#FEE2E2',
  },
  {
    slug: 'chemical-peel',
    name: 'Peels',
    icon: FlaskConical, // Dermatological acid peeling solution
    color: '#059669',
    bg: '#D1FAE5',
  },
  {
    slug: 'laser-toning',
    name: 'Laser Toning',
    icon: Target, // Nd:YAG targeted pigment shattering
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  {
    slug: 'acne-scar-treatment',
    name: 'Acne Scars',
    icon: Bandage, // Dermal healing & scar repair
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    slug: 'pigmentation-treatment',
    name: 'Melasma',
    icon: SunMedium, // Melanin / sun damage clearance
    color: '#B45309',
    bg: '#FEF3C7',
  },
  {
    slug: 'skin-brightening',
    name: 'Medi-Facial',
    icon: Sparkles, // Instant luminous radiance
    color: '#AD904A',
    bg: '#FAF4E6',
  },
  {
    slug: 'skin-tightening',
    name: 'HIFU Lift',
    icon: TrendingUp, // Non-surgical ultrasound lifting & tightening
    color: '#0891B2',
    bg: '#CFFAFE',
  },
  {
    slug: 'microneedling',
    name: 'Microneedling',
    icon: Grid, // Collagen induction micro-needle matrix
    color: '#475569',
    bg: '#F1F5F9',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Continuous animated highlight pulse for "Not Sure..."
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    analytics.track('app_opened');

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleSearchPress = () => {
    navigation.navigate('SearchResultsModal');
  };

  const handleExploreProcedures = () => {
    navigation.navigate('ProceduresTab');
  };

  const handleFindClinics = () => {
    navigation.navigate('ClinicsTab');
  };

  const handleNotSure = () => {
    analytics.track('not_sure_flow_started');
    navigation.navigate('NotSureFlow');
  };

  const handleProcedurePress = (slug: string, name: string) => {
    analytics.track('procedure_viewed', { slug, name });
    navigation.navigate('ProcedureDetailModal', { procedureSlug: slug });
  };

  const handleClinicPress = (slug: string, name: string) => {
    analytics.track('clinic_viewed', { slug, name });
    navigation.navigate('ClinicDetailModal', { clinicSlug: slug });
  };

  const handleAskIra = (initialQuery?: string) => {
    analytics.track('ira_opened_from_home', { initialQuery });
    navigation.navigate('IraTab', { initialQuery });
  };

  // Animated interpolations for the highlighted "Not Sure" box
  const animatedBorderColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#DEC481', '#997F3E', '#DEC481'],
  });

  const animatedBgColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FAF6EE', '#FFF9EC', '#FAF6EE'],
  });

  const animatedScale = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.018, 1],
  });

  const animatedBadgeGlow = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1, 0.85],
  });

  const [refreshing, setRefreshing] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  useEffect(() => {
    clinicsService.getAllClinics().then((data) => setClinics(data));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [_, __, loadedClinics] = await Promise.allSettled([
        proceduresService.refreshLiveProcedures(),
        useAppointmentsStore.getState().initializeAppointments(),
        clinicsService.getAllClinics(),
      ]);
      if (loadedClinics.status === 'fulfilled') {
        setClinics(loadedClinics.value);
      }
    } catch (e) {
      console.warn('Home refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar onRefresh={handleRefresh} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Header */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Aesthetic Care, Curated</Text>
          <Text style={styles.heroSubtitle}>
            Verified dermatology clinics & transparent pricing
          </Text>

          <SearchBar
            placeholder="Search treatments, clinics or concerns..."
            isTouchableOnly
            onPress={handleSearchPress}
            style={styles.searchBar}
          />

          {/* Ask Ira Quick Bar */}
          <TouchableOpacity
            style={styles.iraBanner}
            onPress={() => handleAskIra()}
            activeOpacity={0.85}
          >
            <View style={styles.iraBannerLeft}>
              <View style={styles.iraIconCircle}>
                <Sparkles size={16} color={colors.textInverse} />
              </View>
              <View>
                <View style={styles.iraTitleRow}>
                  <Text style={styles.iraBannerTitle}>Ask Ira</Text>
                  <View style={styles.iraPill}>
                    <Text style={styles.iraPillText}>AI Advisor</Text>
                  </View>
                </View>
                <Text style={styles.iraBannerSubtitle}>
                  Instant answers on downtime, sessions & comparisons
                </Text>
              </View>
            </View>
            <ArrowRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            1. ALL COMMON PROCEDURES (1-VIEW ICON GRID, NO CARDS)
           ───────────────────────────────────────────────────────────── */}
        <View style={styles.proceduresSection}>
          <SectionHeader
            title="Common Procedures"
            actionText="View All"
            onActionPress={handleExploreProcedures}
          />

          <View style={styles.iconGrid}>
            {ALL_PROCEDURES_ICONS.map((proc) => {
              const IconComp = proc.icon;
              return (
                <TouchableOpacity
                  key={proc.slug}
                  activeOpacity={0.75}
                  onPress={() => handleProcedurePress(proc.slug, proc.name)}
                  style={styles.iconGridItem}
                >
                  <View style={[styles.iconCircle, { backgroundColor: proc.bg }]}>
                    <IconComp size={22} color={proc.color} />
                  </View>
                  <Text style={styles.iconLabel} numberOfLines={2}>
                    {proc.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            2. NOT SURE ... (ANIMATED HIGHLIGHT CARD)
           ───────────────────────────────────────────────────────────── */}
        <View style={styles.notSureWrapper}>
          <Animated.View
            style={[
              styles.notSureCard,
              shadows.card,
              {
                borderColor: animatedBorderColor,
                backgroundColor: animatedBgColor,
                transform: [{ scale: animatedScale }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleNotSure}
            >
              {/* Animated Glowing Tag */}
              <Animated.View
                style={[
                  styles.notSureTag,
                  {
                    opacity: animatedBadgeGlow,
                  },
                ]}
              >
                <Sparkles size={13} color={colors.primaryDark} />
                <Text style={styles.notSureTagText}>GUIDED TREATMENT FINDER</Text>
              </Animated.View>

              {/* Headline & Description */}
              <Text style={styles.notSureTitle}>Not sure what your skin needs?</Text>
              <Text style={styles.notSureDescription}>
                Answer 3 simple questions about your concerns to get matched with doctor-recommended treatments and direct pricing.
              </Text>

              {/* Highlighted CTA Button */}
              <View style={styles.notSureCta}>
                <Text style={styles.notSureCtaText}>Start 30-Sec Assessment</Text>
                <ArrowRight size={16} color={colors.textInverse} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            3. TOP VERIFIED CLINICS (Rendered if clinics exist)
           ───────────────────────────────────────────────────────────── */}
        {clinics.length > 0 ? (
          <View style={styles.clinicsSection}>
            <SectionHeader
              title="Top Verified Clinics"
              actionText="View All"
              onActionPress={handleFindClinics}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {clinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id || clinic.slug}
                  clinic={clinic}
                  variant="horizontal"
                  onPress={() => handleClinicPress(clinic.slug, clinic.name)}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Trust & Safety Reassurance */}
        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <CheckCircle2 size={15} color={colors.primary} />
            <Text style={styles.trustItemText}>Verified MDs Only</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <CheckCircle2 size={15} color={colors.primary} />
            <Text style={styles.trustItemText}>Direct Clinic Pricing</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <CheckCircle2 size={15} color={colors.primary} />
            <Text style={styles.trustItemText}>Zero Booking Fees</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 36,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.caption + 1,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: 14,
  },
  searchBar: {
    marginBottom: 10,
  },
  iraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7EEDD',
    borderWidth: 1,
    borderColor: '#E6D7B9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    marginTop: 2,
    marginBottom: 4,
    ...shadows.subtle,
  },
  iraBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  iraIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iraBannerTitle: {
    fontSize: 13,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  iraPill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  iraPillText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  iraBannerSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // ─────────────────────────────────────────────────────────────
  // 1. ALL PROCEDURES 1-VIEW ICON GRID (NO CARDS)
  // ─────────────────────────────────────────────────────────────
  proceduresSection: {
    marginTop: 14,
    paddingHorizontal: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginTop: 6,
    paddingVertical: 4,
  },
  iconGridItem: {
    width: '23%', // 4 items per row in 1 clean cohesive view
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  iconLabel: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ─────────────────────────────────────────────────────────────
  // 2. NOT SURE ... (ANIMATED HIGHLIGHT CARD)
  // ─────────────────────────────────────────────────────────────
  notSureWrapper: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 6,
  },
  notSureCard: {
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 2,
  },
  notSureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3E4BF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 5,
    marginBottom: 10,
  },
  notSureTagText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.heavy,
    color: colors.primaryDark,
    letterSpacing: 0.6,
  },
  notSureTitle: {
    fontSize: typography.fontSizes.h3 + 1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  notSureDescription: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  notSureCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.pill,
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  notSureCtaText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.2,
  },

  // ─────────────────────────────────────────────────────────────
  // 3. TOP VERIFIED CLINICS
  // ─────────────────────────────────────────────────────────────
  clinicsSection: {
    marginTop: 18,
    paddingLeft: 20,
  },
  horizontalScroll: {
    paddingRight: 20,
    paddingTop: 2,
    paddingBottom: 6,
  },

  // Trust Strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustItemText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  trustDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
  },
});
