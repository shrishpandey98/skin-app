import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors, borderRadius, typography } from '../../constants/theme';
import { FAQItemData } from '../../types/procedure.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  faq: FAQItemData;
  isInitiallyOpen?: boolean;
}

export const FAQItem: React.FC<FAQItemProps> = ({ faq, isInitiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggle}
        style={styles.header}
      >
        <Text style={styles.question}>{faq.question}</Text>
        {isOpen ? (
          <ChevronUp size={18} color={colors.primary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
      {isOpen ? (
        <View style={styles.answerWrapper}>
          <Text style={styles.answer}>{faq.answer}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    paddingRight: 12,
    lineHeight: 20,
  },
  answerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 12,
  },
  answer: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
