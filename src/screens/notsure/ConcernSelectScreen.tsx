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
import { ArrowLeft, Sparkles, Flame, Shield, Sun, Wind, Heart, ChevronRight } from 'lucide-react-native';
import { CONCERN_CATEGORIES } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

export const ConcernSelectScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const getConcernIcon = (id: string) => {
    switch (id) {
      case 'skin':
        return <Sparkles size={24} color={colors.primary} />;
      case 'acne':
        return <Flame size={24} color="#E05638" />;
      case 'anti_ageing':
        return <Shield size={24} color={colors.secondary} />;
      case 'pigmentation':
        return <Sun size={24} color="#D97706" />;
      case 'hair':
        return <Wind size={24} color="#2563EB" />;
      case 'face_contour':
        return <Heart size={24} color="#DB2777" />;
      default:
        return <Sparkles size={24} color={colors.primary} />;
    }
  };

  const handleSelectConcern = (concern: (typeof CONCERN_CATEGORIES)[0]) => {
    analytics.track('concern_selected', { concernCategory: concern.id, label: concern.label });
    navigation.navigate('ConcernQuestions', {
      concernId: concern.id,
      concernLabel: concern.label,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Treatment Explorer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBox}>
          <Text style={styles.stepBadge}>STEP 1 OF 2</Text>
          <Text style={styles.title}>What would you like to improve?</Text>
          <Text style={styles.subtitle}>
            Select your primary area of interest. We’ll ask a couple of quick questions to show you relevant treatment options.
          </Text>
        </View>

        <View style={styles.cardsGrid}>
          {CONCERN_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => handleSelectConcern(item)}
              style={[styles.concernCard, shadows.subtle]}
            >
              <View style={styles.iconCircle}>{getConcernIcon(item.id)}</View>
              <View style={styles.textCol}>
                <Text style={styles.concernTitle}>{item.label}</Text>
                <Text style={styles.concernSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Disclaimer / Compliance Notice */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            💡 Note: This tool provides general treatment discovery and procedure education. It does not replace a doctor’s clinical diagnosis.
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
  stepBadge: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  concernCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
  },
  concernTitle: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 2,
  },
  concernSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  disclaimerBox: {
    backgroundColor: '#F8F6F3',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
