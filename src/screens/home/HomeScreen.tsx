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
  Stethoscope,
  Building2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { PROCEDURE_CATEGORIES } from '../../constants/categories';
import { MOCK_PROCEDURES, MOCK_CLINICS } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

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

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('ProceduresTab', { initialCategory: categoryId });
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
        {/* Minimalist Clean Hero Header */}
        <View style={styles.heroSection}>
          <Text style={styles.heroGreeting}>Discover Aesthetic Care</Text>
          <Text style={styles.heroSubtext}>
            Verified dermatology clinics & transparent pricing
          </Text>

          {/* Quick Search */}
          <SearchBar
            placeholder="Search treatments, clinics or concerns..."
            isTouchableOnly
            onPress={handleSearchPress}
            style={styles.searchBar}
          />
        </View>

        {/* 3 Quick Action Tiles (Clean Horizontal 3-Card Row) */}
        <View style={styles.actionRow}>
          {/* Tile 1: Procedures */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleExploreProcedures}
            style={[styles.actionTile, shadows.subtle]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Stethoscope size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionTileTitle}>Treatments</Text>
            <Text style={styles.actionTileSub}>12+ Procedures</Text>
          </TouchableOpacity>

          {/* Tile 2: Clinics */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleFindClinics}
            style={[styles.actionTile, shadows.subtle]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.secondaryLight }]}>
              <Building2 size={20} color={colors.secondary} />
            </View>
            <Text style={styles.actionTileTitle}>Clinics</Text>
            <Text style={styles.actionTileSub}>Top Centers</Text>
          </TouchableOpacity>

          {/* Tile 3: Not Sure */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNotSure}
            style={[styles.actionTile, styles.actionTileHighlight, shadows.subtle]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FDF4ED' }]}>
              <HelpCircle size={20} color={colors.peach} />
            </View>
            <Text style={styles.actionTileTitle}>Not Sure?</Text>
            <Text style={[styles.actionTileSub, { color: colors.peach }]}>Guided Match</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {PROCEDURE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.75}
                onPress={() => handleCategoryPress(cat.id)}
                style={[styles.categoryChip, { backgroundColor: cat.bgColor }]}
              >
                <Text style={[styles.categoryChipText, { color: cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Procedures Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Popular Treatments"
            actionText="See All"
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

        {/* Top Rated Verified Clinics Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Verified Clinics"
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

        {/* Sleek Trust Footer Pill */}
        <View style={styles.trustPill}>
          <ShieldCheck size={16} color={colors.primary} />
          <Text style={styles.trustPillText}>
            Verified Dermatologists • Direct Clinic Pricing • Zero Booking Fees
          </Text>
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
    paddingBottom: 28,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  heroGreeting: {
    fontSize: typography.fontSizes.h1 + 2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.4,
  },
  heroSubtext: {
    fontSize: typography.fontSizes.caption + 1,
    color: colors.textSecondary,
    marginTop: 3,
    marginBottom: 14,
  },
  searchBar: {},

  // Action Tiles Row
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTileHighlight: {
    borderColor: '#F3DFC9',
    backgroundColor: '#FFFCFA',
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTileTitle: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  actionTileSub: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
  },

  // Sections
  section: {
    marginBottom: 22,
    paddingLeft: 20,
  },
  categoryScroll: {
    paddingRight: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
  },
  horizontalScroll: {
    paddingRight: 20,
  },

  // Minimal Trust Pill
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginTop: 6,
  },
  trustPillText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
});
