import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Star, CheckCircle } from 'lucide-react-native';
import { Review } from '../../types/review.types';
import { colors, borderRadius, typography } from '../../constants/theme';

interface ReviewCardProps {
  review: Review;
  style?: ViewStyle;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={styles.userCol}>
          <Text style={styles.userName}>{review.userName}</Text>
          {review.isVerifiedBooking ? (
            <View style={styles.verifiedRow}>
              <CheckCircle size={11} color="#2D8A4E" />
              <Text style={styles.verifiedText}>Verified In-Clinic Patient</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={13}
              color="#E5A93C"
              fill={star <= review.rating ? '#E5A93C' : 'transparent'}
            />
          ))}
        </View>
      </View>

      {review.treatmentName ? (
        <View style={styles.treatmentTag}>
          <Text style={styles.treatmentText}>Treatment: {review.treatmentName}</Text>
        </View>
      ) : null}

      <Text style={styles.reviewText}>{review.reviewText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userCol: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: typography.fontSizes.micro,
    color: '#226D3C',
    fontWeight: typography.fontWeights.medium,
    marginLeft: 3,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  treatmentTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: typography.fontSizes.micro,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  reviewText: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
    lineHeight: 18,
  },
});
