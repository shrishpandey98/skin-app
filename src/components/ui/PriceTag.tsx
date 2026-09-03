import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography } from '../../constants/theme';

interface PriceTagProps {
  priceFrom: number;
  priceTo?: number;
  unit?: string;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  priceFrom,
  priceTo,
  unit = 'per session',
  prefix = 'From',
  size = 'md',
  style,
}) => {
  const formattedFrom = new Intl.NumberFormat('en-IN').format(priceFrom);
  const formattedTo = priceTo ? new Intl.NumberFormat('en-IN').format(priceTo) : null;

  return (
    <View style={[styles.container, style]}>
      {prefix ? (
        <Text style={[styles.prefix, size === 'sm' && styles.prefixSm]}>
          {prefix}{' '}
        </Text>
      ) : null}
      <Text
        style={[
          styles.amount,
          size === 'sm' && styles.amountSm,
          size === 'lg' && styles.amountLg,
        ]}
      >
        ₹{formattedFrom}
        {formattedTo ? ` – ₹${formattedTo}` : ''}
      </Text>
      {unit ? (
        <Text style={[styles.unit, size === 'sm' && styles.unitSm]}>
          {' '}/{unit.replace(/^per\s+/i, '')}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  prefix: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.regular,
  },
  prefixSm: {
    fontSize: typography.fontSizes.micro,
  },
  amount: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  amountSm: {
    fontSize: typography.fontSizes.caption,
  },
  amountLg: {
    fontSize: typography.fontSizes.h3,
    color: colors.primaryDark,
  },
  unit: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.regular,
  },
  unitSm: {
    fontSize: typography.fontSizes.micro,
  },
});
