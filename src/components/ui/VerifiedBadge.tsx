import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors, borderRadius, typography } from '../../constants/theme';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'Verified Clinic',
  size = 'md',
  style,
}) => {
  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <View style={[styles.container, size === 'sm' && styles.sm, style]}>
      <CheckCircle2 size={iconSize} color="#2D8A4E" fill="#E8F5E9" />
      <Text style={[styles.text, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.semibold,
    color: '#226D3C',
    marginLeft: 4,
  },
  textSm: {
    fontSize: typography.fontSizes.micro,
  },
});
