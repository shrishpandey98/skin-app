import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, typography } from '../../constants/theme';

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  count?: number;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  isSelected,
  onPress,
  count,
  icon,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        isSelected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}
    >
      {icon ? <>{icon}</> : null}
      <Text
        style={[
          styles.label,
          isSelected ? styles.labelSelected : styles.labelUnselected,
          icon ? { marginLeft: 6 } : null,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && count > 0 ? (
        <Text
          style={[
            styles.count,
            isSelected ? styles.countSelected : styles.countUnselected,
          ]}
        >
          {count}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    marginRight: 8,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.medium,
  },
  labelUnselected: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.semibold,
  },
  count: {
    fontSize: typography.fontSizes.caption,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.pill,
  },
  countUnselected: {
    backgroundColor: colors.surfaceSubtle,
    color: colors.textSecondary,
  },
  countSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: colors.textInverse,
  },
});
