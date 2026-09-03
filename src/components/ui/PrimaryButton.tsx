import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  variant = 'primary',
  size = 'md',
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        size === 'sm' && styles.sizeSm,
        size === 'lg' && styles.sizeLg,
        variant === 'primary' && styles.primary,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        disabled && styles.disabled,
        variant === 'primary' && !disabled && shadows.subtle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isGhost ? colors.primary : colors.textInverse}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              styles.text,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              variant === 'primary' && styles.textPrimary,
              isSecondary && styles.textSecondary,
              (isOutline || isGhost) && styles.textOutline,
              disabled && styles.textDisabled,
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: borderRadius.pill,
  },
  sizeSm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sizeLg: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.65,
  },
  text: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.semibold,
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: typography.fontSizes.caption,
  },
  textLg: {
    fontSize: typography.fontSizes.bodyLarge,
  },
  textPrimary: {
    color: colors.textInverse,
  },
  textSecondary: {
    color: colors.primaryDark,
  },
  textOutline: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.textMuted,
  },
});
