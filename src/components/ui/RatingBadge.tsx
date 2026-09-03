import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, borderRadius, typography } from '../../constants/theme';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  style?: ViewStyle;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  style,
}) => {
  const iconSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <View
      style={[
        styles.container,
        size === 'sm' && styles.sm,
        size === 'lg' && styles.lg,
        style,
      ]}
    >
      <Star size={iconSize} color="#E5A93C" fill="#E5A93C" />
      <Text
        style={[
          styles.ratingText,
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
        ]}
      >
        {rating.toFixed(1)}
      </Text>
      {showCount && reviewCount !== undefined ? (
        <Text
          style={[
            styles.countText,
            size === 'sm' && styles.countSm,
            size === 'lg' && styles.countLg,
          ]}
        >
          ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9EE',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  lg: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: '#8A5D00',
    marginLeft: 4,
  },
  textSm: {
    fontSize: typography.fontSizes.micro,
  },
  textLg: {
    fontSize: typography.fontSizes.body,
  },
  countText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  countSm: {
    fontSize: typography.fontSizes.micro - 1,
  },
  countLg: {
    fontSize: typography.fontSizes.caption,
  },
});
