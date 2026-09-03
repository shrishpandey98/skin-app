import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, typography } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText = 'See All',
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onActionPress ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onActionPress}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <ChevronRight size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingLeft: 8,
  },
  actionText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
    marginRight: 2,
  },
});
