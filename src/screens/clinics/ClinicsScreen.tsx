import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterChip } from '../../components/ui/FilterChip';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { EmptyState } from '../../components/states/EmptyState';
import { clinicsService, ClinicFilters } from '../../services/clinics.service';
import { Clinic } from '../../types/clinic.types';
import { colors, typography } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'rating', label: 'Highest Rated ★' },
  { id: 'reviews', label: 'Most Reviewed' },
];

export const ClinicsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinics();
  }, [selectedSort, verifiedOnly]);

  const loadClinics = async () => {
    setLoading(true);
    const filters: ClinicFilters = {
      verifiedOnly,
      sortBy: selectedSort,
    };
    const data = await clinicsService.getAllClinics(filters);
    setClinics(data);
    setLoading(false);
  };

  const filteredClinics = clinics.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleClinicPress = (clinic: Clinic) => {
    analytics.track('clinic_viewed', { slug: clinic.slug, name: clinic.name });
    navigation.navigate('ClinicDetailModal', { clinicSlug: clinic.slug });
  };

  const handleBookPress = (clinic: Clinic) => {
    analytics.track('booking_started', { clinicSlug: clinic.slug });
    navigation.navigate('BookingFlow', {
      screen: 'SelectDoctor',
      params: {
        clinicSlug: clinic.slug,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar />

      <View style={styles.header}>
        <Text style={styles.title}>Aesthetic Clinics</Text>
        <Text style={styles.subtitle}>
          Discover verified dermatologists, compare procedure pricing and book consultations.
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search clinics, doctors or areas (e.g. Sector 17)..."
          style={styles.searchBar}
        />
      </View>

      {/* Sort & Filter Pills */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {SORT_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.id}
              label={opt.label}
              isSelected={selectedSort === opt.id}
              onPress={() => setSelectedSort(opt.id as any)}
            />
          ))}
          <FilterChip
            label="Verified Only ✓"
            isSelected={verifiedOnly}
            onPress={() => setVerifiedOnly(!verifiedOnly)}
          />
        </ScrollView>
      </View>

      {/* Clinics FlatList */}
      <FlatList
        data={filteredClinics}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ClinicCard
            clinic={item}
            onPress={() => handleClinicPress(item)}
            onBookPress={() => handleBookPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No clinics found"
              description={
                searchQuery
                  ? `No clinics matching "${searchQuery}". Try searching for Sector 17, Sector 35, or Sector 8.`
                  : 'No clinics match the selected filters.'
              }
              actionText="Reset Filters"
              onActionPress={() => {
                setSearchQuery('');
                setVerifiedOnly(false);
                setSelectedSort('recommended');
              }}
            />
          ) : null
        }
      />

      {/* Floating Back Button */}
      <FloatingBackButton position="bottom-left" fallbackScreen="HomeTab" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  searchBar: {
    marginBottom: 4,
  },
  filtersSection: {
    marginBottom: 12,
  },
  filtersScroll: {
    paddingHorizontal: 18,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
});
