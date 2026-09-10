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
import { Sparkles, RotateCcw, Building2, ArrowLeft } from 'lucide-react-native';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';
import { recommendationService } from '../../services/recommendation.service';
import { proceduresService } from '../../services/procedures.service';
import { Procedure } from '../../types/procedure.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

export const ConcernResultsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { concernId, concernLabel, selectedOptions = [], matchingProcedureSlugs = [] } = route.params || {};

  const [matchingProcedures, setMatchingProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchingProcedures();
  }, [concernId, selectedOptions, matchingProcedureSlugs]);

  const loadMatchingProcedures = async () => {
    setLoading(true);
    try {
      const recs = await recommendationService.getRecommendations({
        concernId: concernId || 'skin',
        selectedOptionIds: selectedOptions.length > 0 ? selectedOptions : matchingProcedureSlugs,
        concernLabel,
      });
      setMatchingProcedures(recs.allMatching);
    } catch (e) {
      console.warn('Error fetching recommendations:', e);
      const fallback = await proceduresService.getRelatedProcedures(matchingProcedureSlugs);
      setMatchingProcedures(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleProcedurePress = (slug: string, name: string) => {
    analytics.track('procedure_viewed', { slug, name, fromNotSure: true });
    navigation.navigate('ProcedureDetailModal', { procedureSlug: slug });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
    }
  };

  const handleRestart = () => {
    navigation.navigate('ConcernSelect');
  };

  const handleBrowseAll = () => {
    analytics.track('browse_all_procedures_pressed');
    try {
      navigation.navigate('MainTabs', { screen: 'ProceduresTab' });
    } catch {
      navigation.navigate('ProceduresTab');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBack}
            style={styles.backBtn}
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerPill}>
            <Sparkles size={12} color={colors.primaryDark} />
            <Text style={styles.headerPillText}>DISCOVERY RESULTS</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRestart}
          style={styles.restartBtn}
        >
          <RotateCcw size={14} color={colors.textSecondary} />
          <Text style={styles.restartBtnText}>Start Over</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compliance Notice Banner */}
        <View style={styles.resultsHero}>
          <Text style={styles.heroTitle}>
            These treatments may be relevant to your concern
          </Text>
          <Text style={styles.heroSubtitle}>
            Based on your preference for {concernLabel || 'aesthetic improvement'}, dermatologists frequently explore the following treatments:
          </Text>
        </View>

        {/* Procedures List */}
        <View style={styles.proceduresList}>
          {matchingProcedures.map((proc) => (
            <ProcedureCard
              key={proc.id}
              procedure={proc}
              onPress={() => handleProcedurePress(proc.slug, proc.name)}
            />
          ))}
        </View>

        {/* Next Steps Card */}
        <View style={[styles.nextStepsCard, shadows.subtle]}>
          <View style={styles.nextStepsHeader}>
            <Building2 size={20} color={colors.primary} />
            <Text style={styles.nextStepsTitle}>How to Proceed</Text>
          </View>
          <Text style={styles.nextStepsText}>
            1. Tap on any treatment above to read what to expect, downtime & FAQs.{'\n'}
            2. Compare verified clinics offering that treatment in Chandigarh.{'\n'}
            3. Book a zero-commitment in-clinic consultation for personalized advice.
          </Text>
        </View>

        <PrimaryButton
          title="Browse All Treatments Directory"
          onPress={handleBrowseAll}
          variant="secondary"
          style={styles.browseAllBtn}
        />
      </ScrollView>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  headerPillText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  restartBtnText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  resultsHero: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  proceduresList: {
    marginBottom: 16,
  },
  nextStepsCard: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  nextStepsTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  nextStepsText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  browseAllBtn: {
    marginBottom: 20,
  },
});
