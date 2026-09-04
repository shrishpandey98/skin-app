import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Sparkles,
  Building2,
  ChevronRight,
  Sun,
  Zap,
  Wind,
  Shield,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Activity,
  HeartHandshake,
} from 'lucide-react-native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { MOCK_PROCEDURES, MOCK_CLINICS } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';
import { Procedure } from '../../types/procedure.types';

// Category icon & color mapping for icon-only display
const PROCEDURE_ICON_MAP: Record<string, { icon: any; color: string; bg: string; benefit: string }> = {
  hydrafacial: {
    icon: Sun,
    color: '#AD904A',
    bg: '#FAF4E6',
    benefit: 'Instant Glow • 45 min',
  },
  'laser-hair-removal': {
    icon: Zap,
    color: '#3E9BAA',
    bg: '#EAF6F8',
    benefit: 'Painless • 6-8 sittings',
  },
  botox: {
    icon: Sparkles,
    color: '#36536B',
    bg: '#EBF1F5',
    benefit: 'Wrinkle Smoothing • 15 min',
  },
  'prp-hair-treatment': {
    icon: Wind,
    color: '#D68C58',
    bg: '#FDF4ED',
    benefit: 'Follicle Growth • 4-6 sittings',
  },
  'chemical-peel': {
    icon: Layers,
    color: '#8A7032',
    bg: '#FAF4E6',
    benefit: 'Acne & Tan Clearance • 30 min',
  },
  'laser-toning': {
    icon: Zap,
    color: '#3E9BAA',
    bg: '#EAF6F8',
    benefit: 'Melasma & Brightening • 20 min',
  },
  'skin-tightening': {
    icon: Shield,
    color: '#AD904A',
    bg: '#FAF4E6',
    benefit: 'HIFU Face Lift • Single session',
  },
  'dermal-fillers': {
    icon: Sparkles,
    color: '#36536B',
    bg: '#EBF1F5',
    benefit: 'Volume & Lip Plump • 30 min',
  },
  'acne-scar-treatment': {
    icon: Activity,
    color: '#36536B',
    bg: '#EBF1F5',
    benefit: 'Fractional CO2 • Permanent',
  },
  'skin-brightening': {
    icon: Sun,
    color: '#AD904A',
    bg: '#FAF4E6',
    benefit: 'Medi-Facial Glow • 45 min',
  },
  'pigmentation-treatment': {
    icon: Layers,
    color: '#D68C58',
    bg: '#FDF4ED',
    benefit: 'Dark Spot Fade • 3-5 sittings',
  },
  microneedling: {
    icon: Activity,
    color: '#3E9BAA',
    bg: '#EAF6F8',
    benefit: 'Collagen Renewal • 40 min',
  },
};

const PROCEDURE_QUICK_FILTERS = [
  { id: 'all', label: 'All Treatments' },
  { id: 'skin', label: 'Skin Glow' },
  { id: 'laser', label: 'Laser' },
  { id: 'injectables', label: 'Botox & Fillers' },
  { id: 'hair', label: 'Hair PRP' },
  { id: 'anti_ageing', label: 'Anti-Ageing' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = React.useState('all');

  // Animation for Highlighting "Not Sure..."
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    analytics.track('app_opened');

    // Continuous breathing / glowing pulse animation for "Not Sure..."
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

  const handleExploreProcedures = (category?: string) => {
    if (category && category !== 'all') {
      navigation.navigate('ProceduresTab', { initialCategory: category });
    } else {
      navigation.navigate('ProceduresTab');
    }
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

  const filteredProcedures =
    selectedFilter === 'all'
      ? MOCK_PROCEDURES
      : MOCK_PROCEDURES.filter((p) => p.category === selectedFilter);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
        </View>

        {/* ─────────────────────────────────────────────────────────────
            1. COMMON PROCEDURES (ICON-ONLY, NO PHOTOS)
           ───────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Common Procedures"
            actionText="See All (12+)"
            onActionPress={() => handleExploreProcedures()}
          />

          {/* Quick Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {PROCEDURE_QUICK_FILTERS.map((cat) => {
              const isActive = selectedFilter === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.75}
                  onPress={() => setSelectedFilter(cat.id)}
                  style={[
                    styles.filterPill,
                    isActive ? styles.filterPillActive : styles.filterPillInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Icon-Only Procedure Cards Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {filteredProcedures.slice(0, 8).map((proc) => {
              const meta = PROCEDURE_ICON_MAP[proc.slug] || {
                icon: Sparkles,
                color: colors.primary,
                bg: colors.primaryLight,
                benefit: 'Clinical Dermatology',
              };
              const IconComp = meta.icon;

              return (
                <TouchableOpacity
                  key={proc.id}
                  activeOpacity={0.85}
                  onPress={() => handleProcedurePress(proc.slug, proc.name)}
                  style={[styles.iconProcCard, shadows.card]}
                >
                  {/* Icon Circle */}
                  <View style={[styles.iconProcCircle, { backgroundColor: meta.bg }]}>
                    <IconComp size={24} color={meta.color} />
                  </View>

                  {/* Category Chip */}
                  <View style={styles.iconProcCatBadge}>
                    <Text style={styles.iconProcCatText}>
                      {proc.categoryLabel || proc.category.toUpperCase()}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.iconProcTitle} numberOfLines={1}>
                    {proc.name}
                  </Text>

                  {/* Benefit / Sessions Info */}
                  <Text style={styles.iconProcBenefit} numberOfLines={1}>
                    {meta.benefit}
                  </Text>

                  {/* Bottom Action */}
                  <View style={styles.iconProcFooter}>
                    <Text style={styles.iconProcFooterText}>View Details</Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
            3. TOP VERIFIED CLINICS
           ───────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
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
            {MOCK_CLINICS.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                variant="horizontal"
                onPress={() => handleClinicPress(clinic.slug, clinic.name)}
              />
            ))}
          </ScrollView>
        </View>

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
    marginBottom: 6,
  },

  // Sections
  section: {
    marginTop: 18,
    paddingLeft: 20,
  },
  filterScroll: {
    paddingRight: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  filterPillText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
  },
  filterPillTextActive: {
    color: colors.textInverse,
  },
  filterPillTextInactive: {
    color: colors.textSecondary,
  },
  horizontalScroll: {
    paddingRight: 20,
    paddingTop: 2,
    paddingBottom: 6,
  },

  // ─────────────────────────────────────────────────────────────
  // 1. ICON-ONLY PROCEDURE CARDS
  // ─────────────────────────────────────────────────────────────
  iconProcCard: {
    width: 175,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  iconProcCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconProcCatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  iconProcCatText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  iconProcTitle: {
    fontSize: typography.fontSizes.body - 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  iconProcBenefit: {
    fontSize: typography.fontSizes.micro + 0.5,
    color: colors.textMuted,
    lineHeight: 15,
    marginBottom: 10,
  },
  iconProcFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 8,
  },
  iconProcFooterText: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
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
