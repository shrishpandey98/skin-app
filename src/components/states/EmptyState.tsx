import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SearchX } from 'lucide-react-native';
import { PrimaryButton } from '../ui/PrimaryButton';
import { colors, typography } from '../../constants/theme';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {icon || <SearchX size={32} color={colors.primary} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionText && onActionPress ? (
        <PrimaryButton
          title={actionText}
          onPress={onActionPress}
          variant="secondary"
          size="sm"
          style={styles.btn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  btn: {
    marginTop: 8,
  },
});
