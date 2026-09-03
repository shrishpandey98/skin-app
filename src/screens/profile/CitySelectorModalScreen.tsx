import React from 'react';
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
import { X, MapPin, CheckCircle2 } from 'lucide-react-native';
import { useLocationStore } from '../../stores/location.store';
import { CITIES } from '../../constants/categories';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const CitySelectorModalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { selectedCity, selectedArea, setCity, setArea } = useLocationStore();

  const handleSelectArea = (area: string | null) => {
    setArea(area);
    navigation.goBack();
  };

  const currentCityData = CITIES[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBox}>
          <Text style={styles.title}>Explore by City & Area</Text>
          <Text style={styles.subtitle}>
            Currently serving curated aesthetic clinics in the Tricity region.
          </Text>
        </View>

        {/* Selected City Card */}
        <View style={[styles.cityCard, shadows.subtle]}>
          <View style={styles.cityHeader}>
            <View style={styles.cityPin}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <View style={styles.cityTextCol}>
              <Text style={styles.cityName}>{currentCityData.name}</Text>
              <Text style={styles.stateName}>{currentCityData.state}</Text>
            </View>
            <CheckCircle2 size={22} color={colors.primary} />
          </View>

          <Text style={styles.areasTitle}>Popular Areas & Sectors</Text>
          <View style={styles.areasGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleSelectArea(null)}
              style={[
                styles.areaPill,
                selectedArea === null ? styles.areaPillSelected : styles.areaPillUnselected,
              ]}
            >
              <Text
                style={[
                  styles.areaText,
                  selectedArea === null ? styles.areaTextSelected : styles.areaTextUnselected,
                ]}
              >
                All Chandigarh
              </Text>
            </TouchableOpacity>

            {currentCityData.areas.map((area) => {
              const isSelected = selectedArea === area;
              return (
                <TouchableOpacity
                  key={area}
                  activeOpacity={0.8}
                  onPress={() => handleSelectArea(area)}
                  style={[
                    styles.areaPill,
                    isSelected ? styles.areaPillSelected : styles.areaPillUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.areaText,
                      isSelected ? styles.areaTextSelected : styles.areaTextUnselected,
                    ]}
                  >
                    {area}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Coming Soon Cities */}
        <View style={styles.comingSoonBox}>
          <Text style={styles.comingSoonTitle}>Expanding Soon To</Text>
          <Text style={styles.comingSoonCities}>
            Delhi NCR • Mumbai • Bengaluru • Ludhiana • Amritsar
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroBox: {
    marginBottom: 20,
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
  },
  cityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    paddingBottom: 14,
  },
  cityPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cityTextCol: {
    flex: 1,
  },
  cityName: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  stateName: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  areasTitle: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  areasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  areaPillUnselected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  areaPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  areaText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
  },
  areaTextUnselected: {
    color: colors.text,
  },
  areaTextSelected: {
    color: colors.textInverse,
  },
  comingSoonBox: {
    backgroundColor: '#FAF8F6',
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  comingSoonCities: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
