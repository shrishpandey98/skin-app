import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { CONCERN_QUESTIONS, CONCERN_MAPPINGS } from '../../data/mockData';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

export const ConcernQuestionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { concernId, concernLabel } = route.params || {
    concernId: 'skin',
    concernLabel: 'Skin Glow & Texture',
  };

  const questions = CONCERN_QUESTIONS[concernId] || CONCERN_QUESTIONS['skin'];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentSelection = selectedAnswers[currentQ?.id];

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQ.id]: optionId,
    });
  };

  const handleNext = () => {
    if (!currentSelection) return;

    if (isLastQuestion) {
      // Compute matching procedure slugs from mappings
      const allSelectedOptionIds = Object.values(selectedAnswers);
      const matchingSlugsSet = new Set<string>();

      allSelectedOptionIds.forEach((optId) => {
        const mapped = CONCERN_MAPPINGS[optId];
        if (mapped) {
          mapped.forEach((s) => matchingSlugsSet.add(s));
        }
      });

      // Fallback if none matched
      if (matchingSlugsSet.size === 0) {
        matchingSlugsSet.add('hydrafacial');
        matchingSlugsSet.add('chemical-peel');
      }

      const matchingProcedureSlugs = Array.from(matchingSlugsSet);

      analytics.track('concern_options_viewed', {
        concernId,
        selectedOptions: allSelectedOptionIds,
        matchingCount: matchingProcedureSlugs.length,
      });

      navigation.navigate('ConcernResults', {
        concernId,
        concernLabel,
        selectedOptions: allSelectedOptionIds,
        matchingProcedureSlugs,
      });
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  if (!currentQ) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{concernLabel}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress bar */}
        <View style={styles.progressRow}>
          {questions.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.progressBar,
                idx <= currentQuestionIndex ? styles.progressBarActive : styles.progressBarInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.stepText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>

        <Text style={styles.questionTitle}>{currentQ.question}</Text>
        {currentQ.subtitle ? (
          <Text style={styles.questionSubtitle}>{currentQ.subtitle}</Text>
        ) : null}

        {/* Options List */}
        <View style={styles.optionsList}>
          {currentQ.options.map((option) => {
            const isSelected = currentSelection === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.85}
                onPress={() => handleSelectOption(option.id)}
                style={[
                  styles.optionCard,
                  isSelected ? styles.optionCardSelected : styles.optionCardUnselected,
                  shadows.subtle,
                ]}
              >
                <View style={styles.radioWrapper}>
                  {isSelected ? (
                    <CheckCircle2 size={20} color={colors.primary} />
                  ) : (
                    <Circle size={20} color={colors.borderStrong} />
                  )}
                </View>

                <View style={styles.optionTextCol}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.sublabel ? (
                    <Text style={styles.optionSublabel}>{option.sublabel}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, shadows.card]}>
        <PrimaryButton
          title={isLastQuestion ? 'View Relevant Treatments' : 'Continue'}
          onPress={handleNext}
          disabled={!currentSelection}
          style={styles.footerBtn}
        />
      </View>
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
    paddingBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: colors.primary,
  },
  progressBarInactive: {
    backgroundColor: colors.border,
  },
  stepText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  questionSubtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  optionCardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  optionCardSelected: {
    backgroundColor: '#FDF6F8',
    borderColor: colors.primary,
  },
  radioWrapper: {
    marginRight: 14,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primaryDark,
  },
  optionSublabel: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    width: '100%',
  },
});
