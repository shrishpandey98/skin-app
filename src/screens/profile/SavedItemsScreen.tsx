import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { EmptyState } from '../../components/states/EmptyState';
import { useAuthStore } from '../../stores/auth.store';
import { MOCK_CLINICS, MOCK_PROCEDURES } from '../../data/mockData';
import { colors, typography } from '../../constants/theme';

export const SavedItemsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [activeTab, setActiveTab] = useState<'clinics' | 'procedures'>(
    route.params?.initialTab || 'clinics'
  );

  const { savedClinics, savedProcedures } = useAuthStore();

  const bookmarkedClinics = MOCK_CLINICS.filter((c) => savedClinics.includes(c.slug));
  const bookmarkedProcedures = MOCK_PROCEDURES.filter((p) => savedProcedures.includes(p.slug));

  const handleClinicPress = (slug: string) => {
    navigation.navigate('ClinicDetailModal', { clinicSlug: slug });
  };

  const handleProcedurePress = (slug: string) => {
    navigation.navigate('ProcedureDetailModal', { procedureSlug: slug });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Bookmarks</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('clinics')}
          style={[styles.tabBtn, activeTab === 'clinics' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'clinics' && styles.tabTextActive]}>
            Saved Clinics ({bookmarkedClinics.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('procedures')}
          style={[styles.tabBtn, activeTab === 'procedures' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, activeTab === 'procedures' && styles.tabTextActive]}>
            Treatments ({bookmarkedProcedures.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      {activeTab === 'clinics' ? (
        <FlatList
          data={bookmarkedClinics}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClinicCard clinic={item} onPress={() => handleClinicPress(item.slug)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Bookmark size={32} color={colors.primary} />}
              title="No saved clinics"
              description="Save your favourite dermatology centers and doctors for quick access."
              actionText="Explore Clinics"
              onActionPress={() =>
                navigation.getParent()?.navigate('MainTabs', { screen: 'ClinicsTab' })
              }
            />
          }
        />
      ) : (
        <FlatList
          data={bookmarkedProcedures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProcedureCard procedure={item} onPress={() => handleProcedurePress(item.slug)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Bookmark size={32} color={colors.primary} />}
              title="No saved treatments"
              description="Bookmark aesthetic treatments you want to learn more about."
              actionText="Explore Treatments"
              onActionPress={() =>
                navigation.getParent()?.navigate('MainTabs', { screen: 'ProceduresTab' })
              }
            />
          }
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 6,
    marginHorizontal: 18,
    marginVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
});
