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
  ShieldCheck,
  ChevronRight,
  Sun,
  Zap,
  Wind,
  Shield,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { MOCK_PROCEDURES, MOCK_CLINICS } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

const QUICK_CATEGORIES = [
  {
    id: 'skin',
    label: 'Skin Glow',
    icon: Sun,
    color: '#AD904A',
    bg: '#FAF4E6',
    target: 'procedures',
  },
  {
    id: 'injectables',
    label: 'Injectables',
    icon: Sparkles,
    color: '#36536B',
    bg: '#EBF1F5',
    target: 'procedures',
  },
  {
    id: 'laser',
    label: 'Laser Care',
    icon: Zap,
    color: '#3E9BAA',
    bg: '#EAF6F8',
    target: 'procedures',
  },
  {
    id: 'hair',
    label: 'Hair PRP',
    icon: Wind,
    color: '#D68C58',
    bg: '#FDF4ED',
    target: 'procedures',
  },
  {
    id: 'anti_ageing',
    label: 'Anti-Ageing',
    icon: Shield,
    color: '#AD904A',
    bg: '#FAF4E6',
    target: 'procedures',
  },
  {
    id: 'all_clinics',
    label: 'All Clinics',
    icon: Building2,
    color: '#36536B',
    bg: '#EBF1F5',
    target: 'clinics',
  },
];

const TRENDING_SEARCHES = [
  { label: 'HydraFacial', slug: 'hydrafacial' },
  { label: 'Laser Hair Reduction', slug: 'laser-hair-reduction' },
  { label: 'Botox Anti-Wrinkle', slug: 'botox-anti-wrinkle' },
  { label: 'PRP Hair Therapy', slug: 'prp-hair-therapy' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    analytics.track('app_opened');
  }, []);

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

  const handleCategoryPress = (item: typeof QUICK_CATEGORIES[0]) => {
    if (item.target === 'clinics') {
      navigation.navigate('ClinicsTab');
    } else {
      navigation.navigate('ProceduresTab', { initialCategory: item.id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header & Search */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.locationPill}>
              <Award size={12} color={colors.primary} />
              <Text style={styles.locationPillText}>Chandigarh & Panchkula</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Aesthetic Care, Curated</Text>
          <Text style={styles.heroSubtitle}>
            Verified dermatology clinics & transparent pricing
          </Text>

          {/* Quick Search Bar */}
          <SearchBar
            placeholder="Search treatments, clinics or concerns..."
            isTouchableOnly
            onPress={handleSearchPress}
            style={styles.searchBar}
          />

          {/* Trending Quick Search Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingScroll}
          >
            <Text style={styles.trendingPrefix}>Popular:</Text>
            {TRENDING_SEARCHES.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => handleProcedurePress(item.slug, item.label)}
                style={styles.trendingChip}
              >
                <Text style={styles.trendingChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 6-Item Quick Category Grid */}
        <View style={styles.categorySection}>
          <View style={styles.categoryGrid}>
            {QUICK_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.75}
                  onPress={() => handleCategoryPress(cat)}
                  style={styles.categoryItem}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: cat.bg }]}>
                    <IconComp size={20} color={cat.color} />
                  </View>
                  <Text style={styles.categoryItemLabel} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Guided Match Interactive Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleNotSure}
          style={[styles.guidedBanner, shadows.subtle]}
        >
          <View style={styles.guidedLeft}>
            <View style={styles.guidedIconWrapper}>
              <Sparkles size={20} color={colors.primary} />
            </View>
            <View style={styles.guidedTextContainer}>
              <Text style={styles.guidedTitle}>Not sure what your skin needs?</Text>
              <Text style={styles.guidedSubtitle}>
                Take a 30-second guided quiz to find doctor-backed treatments
              </Text>
            </View>
          </View>
          <View style={styles.guidedArrowBtn}>
            <ArrowRight size={16} color={colors.primaryDark} />
          </View>
        </TouchableOpacity>

        {/* Popular Treatments Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Popular Treatments"
            actionText="See All (12+)"
            onActionPress={handleExploreProcedures}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {MOCK_PROCEDURES.slice(0, 6).map((proc) => (
              <ProcedureCard
                key={proc.id}
                procedure={proc}
                variant="horizontal"
                onPress={() => handleProcedurePress(proc.slug, proc.name)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Top Verified Clinics Section */}
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

        {/* Sleek Trust & Safety Strip */}
        <View style={styles.trustStrip}>
          <View style={styles.trustItem}>
            <CheckCircle2 size={16} color={colors.primary} />
            <Text style={styles.trustItemText}>Verified MDs Only</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <CheckCircle2 size={16} color={colors.primary} />
            <Text style={styles.trustItemText}>Direct Clinic Pricing</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <CheckCircle2 size={16} color={colors.primary} />
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
    paddingTop: 10,
    paddingBottom: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  locationPillText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 10,
  },

  // Trending Search Chips
  trendingScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  trendingPrefix: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  trendingChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trendingChipText: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },

  // Category Grid (2 rows of 3 items for clean balance)
  categorySection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  categoryItemLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    textAlign: 'center',
  },

  // Guided Match Banner
  guidedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6ED',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#EFE1C5',
  },
  guidedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  guidedIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  guidedTextContainer: {
    flex: 1,
  },
  guidedTitle: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  guidedSubtitle: {
    fontSize: typography.fontSizes.micro + 0.5,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  guidedArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFE1C5',
  },

  // Sections
  section: {
    marginTop: 16,
    marginBottom: 8,
    paddingLeft: 20,
  },
  horizontalScroll: {
    paddingRight: 20,
    paddingTop: 4,
    paddingBottom: 6,
  },

  // Trust Strip
  trustStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
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
    gap: 6,
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
