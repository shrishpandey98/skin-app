import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MapPin, Bookmark, Building2, ChevronRight } from 'lucide-react-native';
import { Clinic, ClinicProcedurePricing } from '../../types/clinic.types';
import { RatingBadge } from '../ui/RatingBadge';
import { VerifiedBadge } from '../ui/VerifiedBadge';
import { PriceTag } from '../ui/PriceTag';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/auth.store';

interface ClinicCardProps {
  clinic: Clinic;
  onPress: () => void;
  onBookPress?: () => void;
  specificPricing?: ClinicProcedurePricing; // When displayed on Procedure Detail Screen
  procedureName?: string;
  style?: ViewStyle;
  variant?: 'vertical' | 'horizontal';
}

export const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  onPress,
  onBookPress,
  specificPricing,
  procedureName,
  style,
  variant = 'vertical',
}) => {
  const { isClinicSaved, toggleSaveClinic } = useAuthStore();
  const isSaved = isClinicSaved(clinic.slug);

  const handleBookmark = (e: any) => {
    e.stopPropagation?.();
    toggleSaveClinic(clinic.slug);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.horizontalCard, shadows.card, style]}
      >
        <View style={styles.horizontalTopRow}>
          <View style={styles.iconCircleSm}>
            <Building2 size={18} color={colors.primary} />
          </View>
          <RatingBadge rating={clinic.rating} reviewCount={clinic.reviewCount} size="sm" />
        </View>

        <View style={styles.horizontalContent}>
          <View style={styles.titleWithBadge}>
            <Text style={styles.horizontalTitle} numberOfLines={1}>
              {clinic.name}
            </Text>
            {clinic.verificationStatus === 'verified' && <VerifiedBadge size="sm" />}
          </View>
          <View style={styles.locationRow}>
            <MapPin size={11} color={colors.textSecondary} />
            <Text style={styles.horizontalLocation} numberOfLines={1}>
              {clinic.area}, {clinic.city}
            </Text>
          </View>
        </View>

        <View style={styles.horizontalFooter}>
          <Text style={styles.viewLinkText}>View Clinic & Book</Text>
          <ChevronRight size={13} color={colors.primary} />
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
        {/* Top Header Row (Icon + Badges + Bookmark) */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.iconCircle}>
              <Building2 size={22} color={colors.primary} />
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {clinic.name}
                </Text>
              </View>
              <View style={styles.locationRow}>
                <MapPin size={13} color={colors.primary} />
                <Text style={styles.locationText}>
                  {clinic.address || `${clinic.area}, ${clinic.city}`}
                </Text>
              </View>
            </View>
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

        {/* Rating and Verification Row */}
        <View style={styles.badgeStrip}>
          <RatingBadge rating={clinic.rating} reviewCount={clinic.reviewCount} />
          {clinic.verificationStatus === 'verified' && <VerifiedBadge size="sm" />}
        </View>

        {/* Specific Procedure Pricing Row (when on Procedure detail) */}
        {specificPricing ? (
          <View style={styles.pricingHighlight}>
            <View>
              <Text style={styles.pricingProcedureLabel}>
                {procedureName || 'Treatment Offering'}
              </Text>
              <PriceTag
                priceFrom={specificPricing.priceFrom}
                priceTo={specificPricing.priceTo}
                unit={specificPricing.priceUnit}
                prefix="From"
                size="md"
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={onBookPress || onPress}
              style={styles.bookInlineBtn}
            >
              <Text style={styles.bookInlineBtnText}>Book In-Clinic</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* General Specialties Chips */
          <View style={styles.specialtiesWrapper}>
            {clinic.specialties.slice(0, 4).map((spec, i) => (
              <View key={i} style={styles.specialtyChip}>
                <Text style={styles.specialtyText}>{spec}</Text>
              </View>
            ))}
          </View>
        )}

        {!specificPricing ? (
          <View style={styles.footerRow}>
            <Text style={styles.viewProfileText}>View Clinic Profile & Procedures</Text>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={onBookPress || onPress}
              style={styles.quickBookBtn}
            >
              <Text style={styles.quickBookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: typography.fontSizes.h3 - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  badgeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  specialtiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  specialtyChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  specialtyText: {
    fontSize: typography.fontSizes.micro + 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  pricingHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF5EA',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#DEC481',
    marginTop: 4,
    marginBottom: 4,
  },
  pricingProcedureLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  bookInlineBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
  },
  bookInlineBtnText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 12,
  },
  viewProfileText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  quickBookBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  quickBookBtnText: {
    color: colors.primaryDark,
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
  },

  // Horizontal Card Variant (Preview Carousel)
  horizontalCard: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
  },
  horizontalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  horizontalContent: {
    marginBottom: 10,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  horizontalTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
  },
  horizontalLocation: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 8,
  },
  viewLinkText: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
});
