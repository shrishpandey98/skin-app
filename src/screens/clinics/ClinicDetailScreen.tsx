import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  ChevronRight,
  Sparkles,
  Stethoscope,
} from 'lucide-react-native';
import { RatingBadge } from '../../components/ui/RatingBadge';
import { VerifiedBadge } from '../../components/ui/VerifiedBadge';
import { PriceTag } from '../../components/ui/PriceTag';
import { DoctorCard } from '../../components/cards/DoctorCard';
import { ReviewCard } from '../../components/cards/ReviewCard';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { LoadingState } from '../../components/states/LoadingState';
import { clinicsService } from '../../services/clinics.service';
import { proceduresService } from '../../services/procedures.service';
import { Clinic } from '../../types/clinic.types';
import { Doctor } from '../../types/doctor.types';
import { Review } from '../../types/review.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/auth.store';
import { analytics } from '../../services/analytics.service';

export const ClinicDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clinicSlug } = route.params || { clinicSlug: 'aesthetica-skin-and-laser-clinic' };

  const { isClinicSaved, toggleSaveClinic } = useAuthStore();
  const isSaved = isClinicSaved(clinicSlug);

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinicData();
  }, [clinicSlug]);

  const loadClinicData = async () => {
    setLoading(true);
    const c = await clinicsService.getClinicBySlug(clinicSlug);
    if (c) {
      setClinic(c);
      const docs = await clinicsService.getDoctorsForClinic(c.slug);
      setDoctors(docs);
      const revs = await clinicsService.getReviewsForClinic(c.id);
      setReviews(revs);
    }
    setLoading(false);
  };

  const handleBookmark = () => {
    if (clinic) {
      toggleSaveClinic(clinic.slug);
    }
  };

  const handleDoctorPress = (doctorSlug: string) => {
    analytics.track('doctor_viewed', { doctorSlug, clinicSlug });
    navigation.navigate('DoctorProfileModal', { doctorSlug, clinicSlug });
  };

  const handleProcedurePress = (procedureId: string) => {
    // Navigate to procedure detail
    const slug = procedureId.replace('proc_', '').replace(/_/g, '-');
    navigation.navigate('ProcedureDetailModal', { procedureSlug: slug });
  };

  const handleBookAppointment = (procedureSlug?: string, doctorSlug?: string) => {
    if (!clinic) return;
    analytics.track('booking_started', { clinicSlug: clinic.slug, procedureSlug, doctorSlug });
    navigation.navigate('BookingFlow', {
      screen: 'SelectDoctor',
      params: {
        clinicSlug: clinic.slug,
        preSelectedDoctorSlug: doctorSlug,
        preSelectedProcedureSlug: procedureSlug,
      },
    });
  };

  const handleGetDirections = () => {
    if (!clinic) return;
    const query = encodeURIComponent(`${clinic.name} ${clinic.address}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url!).catch(console.warn);
  };

  const handleCallClinic = () => {
    if (clinic?.phone) {
      Linking.openURL(`tel:${clinic.phone.replace(/\s+/g, '')}`).catch(console.warn);
    }
  };

  if (loading || !clinic) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Loading clinic profile and doctor availability..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Floating Header Actions */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={[styles.headerIconBtn, shadows.card]}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBookmark}
          style={[styles.headerIconBtn, shadows.card]}
        >
          <Bookmark
            size={19}
            color={isSaved ? colors.primary : colors.text}
            fill={isSaved ? colors.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: clinic.coverImageUrl }}
            style={styles.coverImage}
            contentFit="cover"
          />
          <View style={styles.coverOverlay} />
        </View>

        {/* Profile Card Header */}
        <View style={styles.profileHeaderBox}>
          <View style={styles.logoAndBadgesRow}>
            <Image
              source={{ uri: clinic.logoUrl }}
              style={[styles.logoImage, shadows.card]}
              contentFit="cover"
            />
            <View style={styles.badgesWrapper}>
              <RatingBadge rating={clinic.rating} reviewCount={clinic.reviewCount} size="md" />
              {clinic.verificationStatus === 'verified' ? (
                <VerifiedBadge size="md" />
              ) : null}
            </View>
          </View>

          <Text style={styles.clinicName}>{clinic.name}</Text>

          <View style={styles.locationRow}>
            <MapPin size={15} color={colors.primary} />
            <Text style={styles.locationText}>{clinic.address}</Text>
          </View>

          {/* Action Chips */}
          <View style={styles.quickContactRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCallClinic}
              style={styles.contactChip}
            >
              <Phone size={13} color={colors.primaryDark} />
              <Text style={styles.contactChipText}>Call Clinic</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGetDirections}
              style={styles.contactChip}
            >
              <Navigation size={13} color={colors.primaryDark} />
              <Text style={styles.contactChipText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* About Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>About the Clinic</Text>
            <Text style={styles.aboutText}>{clinic.description}</Text>
          </View>

          {/* 🌟 CRITICAL SECTION: Procedures & Clinic-Specific Pricing */}
          <View style={styles.sectionBlock}>
            <View style={styles.proceduresHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Treatments & Pricing</Text>
                <Text style={styles.sectionSubtitle}>
                  Transparent clinic-specific rates & transparent packages
                </Text>
              </View>
            </View>

            <View style={styles.proceduresList}>
              {clinic.procedures?.map((proc) => {
                const procTitle = proc.id
                  .replace(/^cp_[a-z]+_/, '')
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase());

                return (
                  <View key={proc.id} style={[styles.procedureItem, shadows.subtle]}>
                    <View style={styles.procInfoCol}>
                      <Text style={styles.procTitle}>{procTitle}</Text>
                      {proc.description ? (
                        <Text style={styles.procDesc}>{proc.description}</Text>
                      ) : null}
                      <PriceTag
                        priceFrom={proc.priceFrom}
                        priceTo={proc.priceTo}
                        unit={proc.priceUnit}
                        prefix="From"
                        size="md"
                        style={styles.procPriceTag}
                      />
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.82}
                      onPress={() => handleBookAppointment(proc.procedureId)}
                      style={styles.procBookBtn}
                    >
                      <Text style={styles.procBookBtnText}>Book</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Doctors Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Dermatologists & Specialists</Text>
            <Text style={styles.sectionSubtitle}>
              Consult with board-certified aesthetic practitioners
            </Text>

            <View style={styles.doctorsList}>
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onPress={() => handleDoctorPress(doctor.slug)}
                  onBookPress={() => handleBookAppointment(undefined, doctor.slug)}
                />
              ))}
            </View>
          </View>

          {/* Clinic Photos Gallery */}
          {clinic.galleryImages?.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Clinic Ambience</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryScroll}
              >
                {clinic.galleryImages.map((imgUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imgUrl }}
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Customer Reviews */}
          <View style={styles.sectionBlock}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionTitle}>Patient Reviews</Text>
              <RatingBadge rating={clinic.rating} reviewCount={clinic.reviewCount} size="sm" />
            </View>

            {reviews.length > 0 ? (
              reviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
            ) : (
              <Text style={styles.noReviewsText}>
                No verified patient reviews published yet.
              </Text>
            )}
          </View>

          {/* Opening Hours */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.hoursCard}>
              {Object.entries(clinic.openingHours).map(([day, hours]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.dayLabel}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                  <Text style={styles.hoursValue}>
                    {hours ? `${hours.open} – ${hours.close}` : 'Closed'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location / Directions representation */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Location & Directions</Text>
            <View style={styles.mapCard}>
              <View style={styles.mapPlaceholder}>
                <MapPin size={28} color={colors.primary} />
                <Text style={styles.mapAddressText}>{clinic.address}</Text>
                <Text style={styles.mapCityText}>{clinic.city}, {clinic.state}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleGetDirections}
                style={styles.mapDirectionsBtn}
              >
                <Navigation size={15} color={colors.textInverse} />
                <Text style={styles.mapDirectionsBtnText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={[styles.stickyBottomBar, shadows.floating]}>
        <View style={styles.stickyTextCol}>
          <Text style={styles.stickyPriceLabel}>In-Clinic Consultation</Text>
          <Text style={styles.stickyPriceText}>Free Booking</Text>
        </View>
        <PrimaryButton
          title="Book Appointment"
          onPress={() => handleBookAppointment()}
          style={styles.stickyBookBtn}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  floatingHeader: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: colors.surfaceSubtle,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  // Profile Box
  profileHeaderBox: {
    backgroundColor: colors.surface,
    marginTop: -30,
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#302635',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoAndBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgesWrapper: {
    alignItems: 'flex-end',
    gap: 6,
  },
  clinicName: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  quickContactRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 12,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    gap: 6,
  },
  contactChipText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  aboutText: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Procedures & Pricing List
  proceduresHeaderRow: {
    marginBottom: 10,
  },
  proceduresList: {
    gap: 10,
  },
  procedureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  procInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  procTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 3,
  },
  procDesc: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  procPriceTag: {
    marginTop: 2,
  },
  procBookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
  },
  procBookBtnText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
  },

  // Doctors
  doctorsList: {
    marginTop: 6,
  },

  // Gallery
  galleryScroll: {
    paddingRight: 18,
    gap: 12,
  },
  galleryImage: {
    width: 220,
    height: 140,
    borderRadius: borderRadius.md,
  },

  // Reviews
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noReviewsText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },

  // Opening Hours
  hoursCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  dayLabel: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  hoursValue: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
    fontWeight: typography.fontWeights.semibold,
  },

  // Location / Map
  mapCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapPlaceholder: {
    padding: 24,
    backgroundColor: '#F8F6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapAddressText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  mapCityText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mapDirectionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    gap: 6,
  },
  mapDirectionsBtnText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
  },

  bottomSpacer: {
    height: 40,
  },

  // Sticky Bottom Bar
  stickyBottomBar: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stickyTextCol: {
    flex: 1,
  },
  stickyPriceLabel: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
  },
  stickyPriceText: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: '#2D8A4E',
  },
  stickyBookBtn: {
    paddingHorizontal: 24,
  },
});
