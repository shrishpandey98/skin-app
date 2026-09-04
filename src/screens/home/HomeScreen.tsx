import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
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
  Award,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Stethoscope,
} from 'lucide-react-native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { MOCK_PROCEDURES, MOCK_CLINICS } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

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

  useEffect(() => {
    analytics.track('app_opened');
  }, []);

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
            1. COMMON PROCEDURES
           ───────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeader
            title="Common Procedures"
            actionText="See All (12+)"
            onActionPress={() => handleExploreProcedures()}
          />

          {/* Category Filter Pills */}
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

          {/* Procedures Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {filteredProcedures.slice(0, 6).map((proc) => (
              <ProcedureCard
                key={proc.id}
                procedure={proc}
                variant="horizontal"
                onPress={() => handleProcedurePress(proc.slug, proc.name)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            2. NOT SURE ... (PROMINENTLY HIGHLIGHTED)
           ───────────────────────────────────────────────────────────── */}
        <View style={styles.notSureWrapper}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNotSure}
            style={[styles.notSureCard, shadows.card]}
          >
            {/* Top Accent Tag */}
            <View style={styles.notSureTag}>
              <Sparkles size={13} color={colors.primaryDark} />
              <Text style={styles.notSureTagText}>GUIDED TREATMENT FINDER</Text>
            </View>

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

        {/* Trust & Safety Strip */}
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
  // 2. NOT SURE ... (PROMINENT HIGHLIGHT CARD)
  // ─────────────────────────────────────────────────────────────
  notSureWrapper: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 4,
  },
  notSureCard: {
    backgroundColor: '#FAF5EA',
    borderRadius: borderRadius.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#DEC481',
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
