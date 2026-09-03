import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Award } from 'lucide-react-native';
import { Doctor } from '../../types/doctor.types';
import { RatingBadge } from '../ui/RatingBadge';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
  onBookPress?: () => void;
  style?: ViewStyle;
  variant?: 'vertical' | 'compact';
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onPress,
  onBookPress,
  style,
  variant = 'vertical',
}) => {
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.compactCard, shadows.card, style]}
      >
        <Image
          source={{ uri: doctor.photoUrl }}
          style={styles.compactPhoto}
          contentFit="cover"
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text style={styles.compactSpec} numberOfLines={1}>
            {doctor.specialization}
          </Text>
          <View style={styles.compactFooter}>
            <RatingBadge rating={doctor.rating} reviewCount={doctor.reviewCount} size="sm" />
            <Text style={styles.compactExp}>{doctor.experienceYears}+ yrs exp</Text>
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
      <View style={styles.topRow}>
        <Image
          source={{ uri: doctor.photoUrl }}
          style={styles.photo}
          contentFit="cover"
        />
        <View style={styles.infoCol}>
          <View style={styles.ratingRow}>
            <RatingBadge rating={doctor.rating} reviewCount={doctor.reviewCount} size="sm" />
            <View style={styles.expBadge}>
              <Award size={11} color={colors.primaryDark} />
              <Text style={styles.expText}>{doctor.experienceYears}+ yrs exp</Text>
            </View>
          </View>

          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.qualification} numberOfLines={1}>
            {doctor.qualification}
          </Text>
          <Text style={styles.specialization} numberOfLines={1}>
            {doctor.specialization}
          </Text>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {doctor.bio}
      </Text>

      <View style={styles.actionsRow}>
        <Text style={styles.profileLink}>View Full Doctor Profile</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBookPress || onPress}
          style={styles.bookBtn}
        >
          <Text style={styles.bookBtnText}>Book with Doctor</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  infoCol: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  expText: {
    fontSize: typography.fontSizes.micro,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
    marginLeft: 3,
  },
  name: {
    fontSize: typography.fontSizes.h3 - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  qualification: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 1,
  },
  specialization: {
    fontSize: typography.fontSizes.caption,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
    marginTop: 2,
  },
  bio: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 10,
  },
  profileLink: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
  },
  bookBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },

  // Compact Variant (for horizontal carousels)
  compactCard: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactPhoto: {
    width: '100%',
    height: 120,
  },
  compactContent: {
    padding: 10,
  },
  compactName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  compactSpec: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.primaryDark,
    marginTop: 2,
  },
  compactFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  compactExp: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
  },
});
