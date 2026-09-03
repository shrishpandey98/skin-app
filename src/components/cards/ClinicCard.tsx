import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Bookmark } from 'lucide-react-native';
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
        <Image
          source={{ uri: clinic.coverImageUrl }}
          style={styles.horizontalImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.horizontalContent}>
          <View style={styles.badgeRow}>
            <RatingBadge rating={clinic.rating} reviewCount={clinic.reviewCount} size="sm" />
            {clinic.verificationStatus === 'verified' ? (
              <VerifiedBadge size="sm" />
            ) : null}
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={1}>
            {clinic.name}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={11} color={colors.textSecondary} />
            <Text style={styles.horizontalLocation} numberOfLines={1}>
              {clinic.area}, {clinic.city}
            </Text>
          </View>
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
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: clinic.coverImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.overlayRow}>
          <RatingBadge rating={clinic.rating} reviewCount={clinic.reviewCount} />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBookmark}
            style={styles.saveBtn}
          >
            <Bookmark
              size={16}
              color={isSaved ? colors.primary : colors.text}
              fill={isSaved ? colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {clinic.name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.locationRow}>
            <MapPin size={13} color={colors.primary} />
            <Text style={styles.locationText}>
              {clinic.address || `${clinic.area}, ${clinic.city}`}
            </Text>
          </View>
          {clinic.verificationStatus === 'verified' ? (
            <VerifiedBadge size="sm" />
          ) : null}
        </View>

        {/* Specific Procedure Pricing Row (Crucial for Procedure Discovery Hub) */}
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
            {clinic.specialties.slice(0, 3).map((spec, i) => (
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
  imageContainer: {
    width: '100%',
    height: 155,
    backgroundColor: colors.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
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
    marginBottom: 12,
  },
  specialtyChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  specialtyText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  pricingHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FDF7F8',
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#F8DFE4',
    marginTop: 4,
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

  // Horizontal Card Variant (for Home Carousel)
  horizontalCard: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  horizontalImage: {
    width: '100%',
    height: 130,
  },
  horizontalContent: {
    padding: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  horizontalTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  horizontalLocation: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginLeft: 3,
  },
});
