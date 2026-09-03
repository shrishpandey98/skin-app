import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, Bookmark } from 'lucide-react-native';
import { Procedure } from '../../types/procedure.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/auth.store';

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
        <Image
          source={{ uri: procedure.heroImageUrl }}
          style={styles.horizontalImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.horizontalContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {procedure.categoryLabel || procedure.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.horizontalTitle} numberOfLines={1}>
            {procedure.name}
          </Text>
          <Text style={styles.horizontalDesc} numberOfLines={2}>
            {procedure.shortDescription}
          </Text>
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
          source={{ uri: procedure.heroImageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.categoryBadgeOverlay}>
          <Text style={styles.categoryBadgeOverlayText}>
            {procedure.categoryLabel || procedure.category.toUpperCase()}
          </Text>
        </View>
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

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{procedure.name}</Text>
          <ChevronRight size={18} color={colors.primary} />
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {procedure.shortDescription}
        </Text>

        <View style={styles.footerRow}>
          <Text style={styles.exploreText}>View Treatment Details</Text>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: colors.surfaceSubtle,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(26, 24, 36, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  categoryBadgeOverlayText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textInverse,
    letterSpacing: 0.3,
  },
  saveBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    flex: 1,
  },
  description: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
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

  // Horizontal Card Variant (for Home Carousel)
  horizontalCard: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  horizontalImage: {
    width: '100%',
    height: 125,
  },
  horizontalContent: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
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
});
