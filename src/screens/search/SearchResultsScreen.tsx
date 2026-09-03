import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Building2,
  User,
  HelpCircle,
  TrendingUp,
} from 'lucide-react-native';
import { SearchBar } from '../../components/ui/SearchBar';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { DoctorCard } from '../../components/cards/DoctorCard';
import { EmptyState } from '../../components/states/EmptyState';
import { searchService, SearchResultsData } from '../../services/search.service';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

const POPULAR_SEARCHES = [
  'Botox',
  'Hydrafacial',
  'Laser Hair Removal',
  'Acne Scars',
  'Dermal Fillers',
  'Sector 17',
  'Dr. Ananya Sharma',
  'Skin Brightening',
];

export const SearchResultsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [results, setResults] = useState<SearchResultsData>({
    procedures: [],
    clinics: [],
    doctors: [],
    concerns: [],
    totalCount: 0,
  });
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query.trim().length > 1) {
      const timer = setTimeout(() => {
        performSearch(query);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setResults({
        procedures: [],
        clinics: [],
        doctors: [],
        concerns: [],
        totalCount: 0,
      });
      setHasSearched(false);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    const res = await searchService.globalSearch(q);
    setResults(res);
    setHasSearched(true);
    analytics.track('search_performed', { query: q, count: res.totalCount });
  };

  const handleProcedurePress = (slug: string) => {
    navigation.navigate('ProcedureDetailModal', { procedureSlug: slug });
  };

  const handleClinicPress = (slug: string) => {
    navigation.navigate('ClinicDetailModal', { clinicSlug: slug });
  };

  const handleDoctorPress = (slug: string) => {
    navigation.navigate('DoctorProfileModal', { doctorSlug: slug });
  };

  const handleConcernPress = (concernId: string, label: string) => {
    navigation.navigate('NotSureFlow', {
      screen: 'ConcernQuestions',
      params: { concernId, concernLabel: label },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder="Search procedures, clinics or concerns..."
          autoFocus
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* If user hasn't typed enough, show Popular Search terms */}
        {!hasSearched || query.trim().length < 2 ? (
          <View style={styles.popularSection}>
            <View style={styles.popularHeader}>
              <TrendingUp size={16} color={colors.primary} />
              <Text style={styles.popularTitle}>Popular Searches</Text>
            </View>
            <View style={styles.chipsWrapper}>
              {POPULAR_SEARCHES.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.75}
                  onPress={() => setQuery(item)}
                  style={styles.searchChip}
                >
                  <Search size={12} color={colors.textSecondary} />
                  <Text style={styles.searchChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Results Sections */}
        {hasSearched && (
          <View style={styles.resultsWrapper}>
            {/* 1. Procedures Results */}
            {results.procedures.length > 0 ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={styles.sectionTitle}>
                    Procedures ({results.procedures.length})
                  </Text>
                </View>
                {results.procedures.map((proc) => (
                  <ProcedureCard
                    key={proc.id}
                    procedure={proc}
                    onPress={() => handleProcedurePress(proc.slug)}
                  />
                ))}
              </View>
            ) : null}

            {/* 2. Clinics Results */}
            {results.clinics.length > 0 ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <Building2 size={16} color={colors.secondary} />
                  <Text style={styles.sectionTitle}>
                    Clinics ({results.clinics.length})
                  </Text>
                </View>
                {results.clinics.map((clinic) => (
                  <ClinicCard
                    key={clinic.id}
                    clinic={clinic}
                    onPress={() => handleClinicPress(clinic.slug)}
                  />
                ))}
              </View>
            ) : null}

            {/* 3. Doctors Results */}
            {results.doctors.length > 0 ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <User size={16} color={colors.primaryDark} />
                  <Text style={styles.sectionTitle}>
                    Doctors ({results.doctors.length})
                  </Text>
                </View>
                {results.doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onPress={() => handleDoctorPress(doc.slug)}
                  />
                ))}
              </View>
            ) : null}

            {/* 4. Concerns Results */}
            {results.concerns.length > 0 ? (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <HelpCircle size={16} color={colors.peach} />
                  <Text style={styles.sectionTitle}>Matching Skin Concerns</Text>
                </View>
                {results.concerns.map((concern) => (
                  <TouchableOpacity
                    key={concern.id}
                    activeOpacity={0.85}
                    onPress={() => handleConcernPress(concern.id, concern.label)}
                    style={[styles.concernCard, shadows.subtle]}
                  >
                    <View style={styles.concernIconCircle}>
                      <HelpCircle size={18} color={colors.peach} />
                    </View>
                    <View style={styles.concernTextCol}>
                      <Text style={styles.concernTitle}>{concern.label}</Text>
                      <Text style={styles.concernSubtitle}>{concern.subtitle}</Text>
                    </View>
                    <Text style={styles.exploreFlowLink}>Start Guide →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* Empty State */}
            {results.totalCount === 0 ? (
              <EmptyState
                title="No search results"
                description={`We couldn't find any procedures, clinics, doctors or concerns matching "${query}".`}
                actionText="Clear Search"
                onActionPress={() => setQuery('')}
              />
            ) : null}
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  searchBar: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  popularSection: {
    paddingTop: 8,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  popularTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  searchChipText: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  resultsWrapper: {
    paddingTop: 4,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  concernCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAF6',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FEEFE6',
    marginBottom: 10,
  },
  concernIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  concernTextCol: {
    flex: 1,
  },
  concernTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  concernSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exploreFlowLink: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.peach,
    marginLeft: 8,
  },
});
