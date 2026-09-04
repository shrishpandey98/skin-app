import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import {
  ChevronRight,
  Bookmark,
  Sparkles,
  SunMedium,
  Zap,
  Droplets,
  Syringe,
  Pipette,
  HeartPulse,
  FlaskConical,
  Target,
  Bandage,
  TrendingUp,
  Grid,
} from 'lucide-react-native';
import { Procedure } from '../../types/procedure.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/auth.store';

// Mapping for preview icons matching the clinical nature of each procedure
const PROCEDURE_PREVIEW_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  hydrafacial: { icon: Droplets, color: '#0284C7', bg: '#E0F2FE' },
  'laser-hair-removal': { icon: Zap, color: '#EA580C', bg: '#FFEDD5' },
  botox: { icon: Syringe, color: '#4F46E5', bg: '#EEF2FF' },
  'dermal-fillers': { icon: Pipette, color: '#D97706', bg: '#FEF3C7' },
  'prp-hair-treatment': { icon: HeartPulse, color: '#DC2626', bg: '#FEE2E2' },
  'chemical-peel': { icon: FlaskConical, color: '#059669', bg: '#D1FAE5' },
  'laser-toning': { icon: Target, color: '#2563EB', bg: '#DBEAFE' },
  'acne-scar-treatment': { icon: Bandage, color: '#7C3AED', bg: '#EDE9FE' },
  'pigmentation-treatment': { icon: SunMedium, color: '#B45309', bg: '#FEF3C7' },
  'skin-brightening': { icon: Sparkles, color: '#AD904A', bg: '#FAF4E6' },
  'skin-tightening': { icon: TrendingUp, color: '#0891B2', bg: '#CFFAFE' },
  microneedling: { icon: Grid, color: '#475569', bg: '#F1F5F9' },
};

interface ProcedureCardProps {
  procedure: Procedure;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'vertical' | 'compact' | 'horizontal';
}

export const ProcedureCard: React.FC<ProcedureCardProps> = ({
  procedure,
  onPress,
  style,
  variant = 'vertical',
}) => {
  const { isProcedureSaved, toggleSaveProcedure } = useAuthStore();
  const isSaved = isProcedureSaved(procedure.slug);

  const meta = PROCEDURE_PREVIEW_ICONS[procedure.slug] || {
    icon: Sparkles,
    color: colors.primary,
    bg: colors.primaryLight,
  };
  const IconComp = meta.icon;

  const handleBookmark = (e: any) => {
    e.stopPropagation?.();
    toggleSaveProcedure(procedure.slug);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.horizontalCard, shadows.card, style]}
      >
        <View style={styles.horizontalTop}>
          <View style={[styles.iconCircleSm, { backgroundColor: meta.bg }]}>
            <IconComp size={20} color={meta.color} />
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {procedure.categoryLabel || procedure.category.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={1}>
            {procedure.name}
          </Text>
          <Text style={styles.horizontalDesc} numberOfLines={2}>
            {procedure.shortDescription}
          </Text>
        </View>

        <View style={styles.horizontalFooter}>
          <Text style={styles.exploreText}>View Details</Text>
          <ChevronRight size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, shadows.card, style]}
    >
      <View style={styles.content}>
        <View style={styles.cardTopRow}>
          <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
            <IconComp size={24} color={meta.color} />
          </View>
          <View style={styles.cardTopMiddle}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {procedure.categoryLabel || procedure.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{procedure.name}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBookmark}
            style={styles.saveBtn}
          >
            <Bookmark
              size={16}
              color={isSaved ? colors.primary : colors.textMuted}
              fill={isSaved ? colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {procedure.shortDescription}
        </Text>

        {procedure.downtime ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⏱ {procedure.downtime}</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.exploreText}>View Treatment Details & In-Clinic Pricing</Text>
          <ChevronRight size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleSm: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopMiddle: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSizes.h3 - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  description: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 10,
  },
  exploreText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },

  // Horizontal Card Variant
  horizontalCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  horizontalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  horizontalContent: {
    marginBottom: 10,
  },
  horizontalTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  horizontalDesc: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 8,
  },
});
