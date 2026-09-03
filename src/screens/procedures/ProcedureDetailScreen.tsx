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
  Bookmark,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Sparkles,
  Building2,
  ChevronRight,
} from 'lucide-react-native';
import { FAQItem } from '../../components/ui/FAQItem';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { ProcedureCard } from '../../components/cards/ProcedureCard';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { LoadingState } from '../../components/states/LoadingState';
import { proceduresService } from '../../services/procedures.service';
import { Procedure } from '../../types/procedure.types';
import { ClinicOfferingProcedure } from '../../types/clinic.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useAuthStore } from '../../stores/auth.store';
import { analytics } from '../../services/analytics.service';

export const ProcedureDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { procedureSlug } = route.params || { procedureSlug: 'botox' };

  const { isProcedureSaved, toggleSaveProcedure } = useAuthStore();
  const isSaved = isProcedureSaved(procedureSlug);

  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [clinicsOffering, setClinicsOffering] = useState<ClinicOfferingProcedure[]>([]);
  const [relatedProcedures, setRelatedProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcedureDetails();
  }, [procedureSlug]);

  const loadProcedureDetails = async () => {
    setLoading(true);
    const proc = await proceduresService.getProcedureBySlug(procedureSlug);
    if (proc) {
      setProcedure(proc);
      const clinics = await proceduresService.getClinicsOfferingProcedure(proc.slug);
      setClinicsOffering(clinics);
      if (proc.relatedProcedureSlugs) {
        const related = await proceduresService.getRelatedProcedures(proc.relatedProcedureSlugs);
        setRelatedProcedures(related);
      }
    }
    setLoading(false);
  };

  const handleBookmark = () => {
    if (procedure) {
      toggleSaveProcedure(procedure.slug);
    }
  };

  const handleClinicPress = (clinicSlug: string) => {
    analytics.track('clinic_viewed', { slug: clinicSlug, fromProcedure: procedureSlug });
    navigation.navigate('ClinicDetailModal', { clinicSlug });
  };

  const handleBookWithClinic = (clinicSlug: string) => {
    analytics.track('booking_started', { clinicSlug, procedureSlug });
    navigation.navigate('BookingFlow', {
      screen: 'SelectDoctor',
      params: {
        clinicSlug,
        preSelectedProcedureSlug: procedureSlug,
      },
    });
  };

  if (loading || !procedure) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="Loading procedure details & verified clinics..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Floating Header */}
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
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: procedure.heroImageUrl }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>
                {procedure.categoryLabel || procedure.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{procedure.name}</Text>
          </View>
        </View>

        <View style={styles.bodyContent}>
          {/* Short Description */}
          <Text style={styles.shortDescription}>{procedure.shortDescription}</Text>

          {/* Quick Info Grid */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.infoCard}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.infoLabel}>Downtime</Text>
              <Text style={styles.infoValue}>{procedure.downtime}</Text>
            </View>
            <View style={styles.infoCard}>
              <Calendar size={16} color={colors.secondary} />
              <Text style={styles.infoLabel}>Sessions</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {procedure.sessionsInfo}
              </Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>About {procedure.name}</Text>
            <Text style={styles.paragraph}>{procedure.description}</Text>
          </View>

          {/* Common Uses */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>What it Treats & Common Uses</Text>
            {procedure.commonUses.map((use, index) => (
              <View key={index} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{use}</Text>
              </View>
            ))}
          </View>

          {/* Benefits */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Key Benefits</Text>
            {procedure.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <CheckCircle2 size={16} color="#2D8A4E" style={styles.benefitIcon} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* What to Expect */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>What to Expect in Clinic</Text>
            <View style={styles.expectCard}>
              <Text style={styles.paragraph}>{procedure.whatToExpect}</Text>
            </View>
          </View>

          {/* Considerations & Safety */}
          {procedure.considerations?.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Considerations & Safety</Text>
              <View style={styles.cautionCard}>
                <AlertCircle size={18} color="#D97706" style={styles.cautionIcon} />
                <View style={styles.cautionContent}>
                  {procedure.considerations.map((item, idx) => (
                    <Text key={idx} style={styles.cautionText}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          {/* FAQs */}
          {procedure.faqs?.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              {procedure.faqs.map((faq, index) => (
                <FAQItem key={index} faq={faq} isInitiallyOpen={index === 0} />
              ))}
            </View>
          ) : null}

          {/* 🌟 CRITICAL SECTION: Clinics Offering This Procedure */}
          <View style={[styles.sectionBlock, styles.clinicsHubSection]}>
            <View style={styles.clinicsHubHeader}>
              <Building2 size={22} color={colors.primary} />
              <View style={styles.clinicsHubTextWrapper}>
                <Text style={styles.clinicsHubTitle}>
                  Clinics Offering {procedure.name}
                </Text>
                <Text style={styles.clinicsHubSubtitle}>
                  Compare clinic-specific pricing & book verified in-clinic consultations
                </Text>
              </View>
            </View>

            {clinicsOffering.length > 0 ? (
              clinicsOffering.map(({ clinic, pricing }) => (
                <ClinicCard
                  key={clinic.id}
                  clinic={clinic}
                  specificPricing={pricing}
                  procedureName={procedure.name}
                  onPress={() => handleClinicPress(clinic.slug)}
                  onBookPress={() => handleBookWithClinic(clinic.slug)}
                />
              ))
            ) : (
              <View style={styles.noClinicsBox}>
                <Text style={styles.noClinicsText}>
                  No clinics currently listed offering {procedure.name} in your city.
                </Text>
              </View>
            )}
          </View>

          {/* Related Procedures */}
          {relatedProcedures.length > 0 ? (
            <View style={styles.sectionBlock}>
              <SectionHeader
                title="Related Treatments"
                subtitle="Other treatments often paired together"
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {relatedProcedures.map((item) => (
                  <ProcedureCard
                    key={item.id}
                    procedure={item}
                    variant="horizontal"
                    onPress={() =>
                      navigation.push('ProcedureDetailModal', { procedureSlug: item.slug })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingBottom: 40,
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
  heroContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: colors.surfaceSubtle,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(26, 24, 36, 0.65)',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    marginBottom: 6,
  },
  categoryChipText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: typography.fontSizes.hero,
    fontWeight: typography.fontWeights.heavy,
    color: colors.textInverse,
    letterSpacing: -0.3,
  },
  bodyContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  shortDescription: {
    fontSize: typography.fontSizes.bodyLarge,
    color: colors.text,
    lineHeight: 24,
    fontWeight: typography.fontWeights.medium,
    marginBottom: 16,
  },
  quickInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.text,
    lineHeight: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  benefitIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.text,
    lineHeight: 20,
  },
  expectCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cautionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cautionIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  cautionContent: {
    flex: 1,
  },
  cautionText: {
    fontSize: typography.fontSizes.caption,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 4,
  },

  // Clinics Hub
  clinicsHubSection: {
    backgroundColor: '#FDFCFB',
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginTop: 8,
  },
  clinicsHubHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  clinicsHubTextWrapper: {
    flex: 1,
  },
  clinicsHubTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  clinicsHubSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noClinicsBox: {
    padding: 20,
    alignItems: 'center',
  },
  noClinicsText: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  relatedScroll: {
    paddingRight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});
