import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { RatingBadge } from '../../components/ui/RatingBadge';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { LoadingState } from '../../components/states/LoadingState';
import { doctorsService } from '../../services/doctors.service';
import { clinicsService } from '../../services/clinics.service';
import { Doctor } from '../../types/doctor.types';
import { Review } from '../../types/review.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

export const DoctorProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { doctorSlug, clinicSlug } = route.params || { doctorSlug: 'dr-ananya-sharma' };

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctorData();
  }, [doctorSlug]);

  const loadDoctorData = async () => {
    setLoading(true);
    const doc = await doctorsService.getDoctorBySlug(doctorSlug);
    if (doc) {
      setDoctor(doc);
      const revs = await doctorsService.getReviewsForDoctor(doc.id);
      setReviews(revs);
    }
    setLoading(false);
  };

  const handleBook = () => {
    if (!doctor) return;
    const targetClinicSlug = clinicSlug || doctor.clinicId || 'clinic_aesthetica';
    analytics.track('booking_started', { doctorSlug: doctor.slug, clinicSlug: targetClinicSlug });
    navigation.navigate('BookingFlow', {
      screen: 'SelectProcedure',
      params: {
        clinicSlug: targetClinicSlug,
        doctorSlug: doctor.slug,
      },
    });
  };

  if (loading || !doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Loading doctor profile & credentials..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Main Header Card */}
        <View style={[styles.mainCard, shadows.card]}>
          <Image
            source={{ uri: doctor.photoUrl }}
            style={styles.doctorPhoto}
            contentFit="cover"
          />

          <View style={styles.doctorInfoCol}>
            <View style={styles.badgesRow}>
              <RatingBadge rating={doctor.rating} reviewCount={doctor.reviewCount} />
              <View style={styles.expBadge}>
                <Award size={12} color={colors.primaryDark} />
                <Text style={styles.expText}>{doctor.experienceYears}+ Years Exp</Text>
              </View>
            </View>

            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.qualification}>{doctor.qualification}</Text>
            <Text style={styles.specialization}>{doctor.specialization}</Text>
          </View>
        </View>

        {/* Clinic Association Box */}
        {doctor.clinicName ? (
          <View style={styles.clinicAssociationBox}>
            <View style={styles.clinicIconCircle}>
              <Building2 size={18} color={colors.primary} />
            </View>
            <View style={styles.clinicTextCol}>
              <Text style={styles.clinicLabel}>Practicing At</Text>
              <Text style={styles.clinicNameText}>{doctor.clinicName}</Text>
              {doctor.clinicAddress ? (
                <Text style={styles.clinicAddressText}>{doctor.clinicAddress}</Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.body}>
          {/* Biography */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>About {doctor.name}</Text>
            <Text style={styles.bioText}>{doctor.bio}</Text>
          </View>

          {/* Procedures Offered / Clinical Focus */}
          {doctor.proceduresOffered && doctor.proceduresOffered.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Treatments & Clinical Focus</Text>
              <View style={styles.focusGrid}>
                {doctor.proceduresOffered.map((item, index) => (
                  <View key={index} style={styles.focusChip}>
                    <CheckCircle2 size={13} color="#2D8A4E" />
                    <Text style={styles.focusChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Reviews */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Patient Feedback</Text>
            {reviews.length > 0 ? (
              reviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
            ) : (
              <Text style={styles.noReviewsText}>
                No verified reviews published for this doctor yet.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={[styles.stickyBottomBar, shadows.floating]}>
        <View style={styles.stickyCol}>
          <Text style={styles.stickyClinic}>{doctor.clinicName || 'In-Clinic'}</Text>
          <Text style={styles.stickyDoc}>Consultation Booking</Text>
        </View>
        <PrimaryButton
          title={`Book with ${doctor.name.split(' ')[1] || 'Doctor'}`}
          onPress={handleBook}
          style={styles.bookBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  placeholder: {
    width: 32,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  mainCard: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doctorPhoto: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSubtle,
    marginBottom: 14,
  },
  doctorInfoCol: {
    justifyContent: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  expText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: 4,
  },
  doctorName: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  qualification: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  specialization: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semibold,
  },

  // Clinic Association Box
  clinicAssociationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5FA',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E8E3F0',
    marginBottom: 10,
  },
  clinicIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clinicTextCol: {
    flex: 1,
  },
  clinicLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeights.bold,
  },
  clinicNameText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 1,
  },
  clinicAddressText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 10,
  },
  bioText: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  focusChipText: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
    fontWeight: typography.fontWeights.medium,
  },
  noReviewsText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stickyCol: {
    flex: 1,
  },
  stickyClinic: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
  },
  stickyDoc: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  bookBtn: {
    paddingHorizontal: 20,
  },
});
