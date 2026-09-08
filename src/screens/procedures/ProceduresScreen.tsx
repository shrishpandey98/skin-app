import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TopBar } from '../../components/ui/TopBar';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterChip } from '../../components/ui/FilterChip';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { EmptyState } from '../../components/states/EmptyState';
import { PROCEDURE_CATEGORIES } from '../../constants/categories';
import { proceduresService } from '../../services/procedures.service';
import { Procedure } from '../../types/procedure.types';
import { colors, typography } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';

export const ProceduresScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    route.params?.initialCategory || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);

  useEffect(() => {
    if (route.params?.initialCategory) {
      setSelectedCategory(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  useEffect(() => {
    loadProcedures();
  }, [selectedCategory]);

  const loadProcedures = async (force: boolean = false) => {
    if (!force) setLoading(true);
    const [data, all] = await Promise.all([
      proceduresService.getAllProcedures(selectedCategory, force),
      proceduresService.getAllProcedures('all', force),
    ]);
    setProcedures(data);
    setAllProcedures(all);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProcedures(true);
    setRefreshing(false);
  };

  const filteredProcedures = procedures.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.shortDescription?.toLowerCase().includes(q) ||
      p.commonUses?.some((u) => u.toLowerCase().includes(q)) ||
      p.category?.toLowerCase().includes(q) ||
      p.categoryLabel?.toLowerCase().includes(q)
    );
  });

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return allProcedures.length || 67;
    return allProcedures.filter((p) => (p.category || '').toLowerCase() === catId).length;
  };

  const handleProcedurePress = (procedure: Procedure) => {
    analytics.track('procedure_viewed', { slug: procedure.slug, name: procedure.name });
    navigation.navigate('ProcedureDetailModal', { procedureSlug: procedure.slug });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar onRefresh={handleRefresh} />

      <View style={styles.header}>
        <Text style={styles.title}>Explore Treatments</Text>
        <Text style={styles.subtitle}>
          {allProcedures.length || 67} verified clinical procedures from our Knowledge Base.
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search treatments (e.g. Botox, Hydrafacial)..."
          style={styles.searchBar}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {PROCEDURE_CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <FilterChip
                key={cat.id}
                label={`${cat.name} (${count})`}
                isSelected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(cat.id)}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Procedures List */}
      <FlatList
        data={filteredProcedures}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <ProcedureCard
            procedure={item}
            onPress={() => handleProcedurePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              title="No treatments found"
              description={
                searchQuery
                  ? `No treatments matching "${searchQuery}". Try searching for acne, glow, or anti-ageing.`
                  : 'No treatments found in this category.'
              }
              actionText="Show All Treatments"
              onActionPress={() => {
                setSelectedCategory('all');
                setSearchQuery('');
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
  filterSection: {
    marginBottom: 12,
  },
  categoryScroll: {
    paddingHorizontal: 18,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
});
