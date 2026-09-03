import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { X, CheckCircle2, UserCheck, ChevronRight } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { RatingBadge } from '../../components/ui/RatingBadge';
import { clinicsService } from '../../services/clinics.service';
import { Doctor } from '../../types/doctor.types';
import { Clinic } from '../../types/clinic.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const SelectDoctorScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clinicSlug, preSelectedDoctorSlug, preSelectedProcedureSlug } = route.params || {};

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorSlug, setSelectedDoctorSlug] = useState<string | null>(
    preSelectedDoctorSlug || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [clinicSlug]);

  const loadData = async () => {
    setLoading(true);
    const c = await clinicsService.getClinicBySlug(clinicSlug || 'aesthetica-skin-and-laser-clinic');
    if (c) {
      setClinic(c);
      const docs = await clinicsService.getDoctorsForClinic(c.slug);
      setDoctors(docs);
    }
    setLoading(false);
  };

  const handleContinue = (docSlug?: string | null) => {
    navigation.navigate('SelectProcedure', {
      clinicSlug,
      doctorSlug: docSlug !== undefined ? docSlug : selectedDoctorSlug,
      preSelectedProcedureSlug,
    });
  };

  const handleSkip = () => {
    handleContinue(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.getParent()?.goBack?.() || navigation.goBack()}
          style={styles.closeBtn}
        >
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Doctor</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepBox}>
          <Text style={styles.stepBadge}>STEP 1 OF 5</Text>
          <Text style={styles.title}>Choose a practitioner</Text>
          <Text style={styles.subtitle}>
            {clinic?.name || 'Clinic'} — Choose a specific doctor or skip for any available specialist.
          </Text>
        </View>

        {/* Any Available Specialist Option */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedDoctorSlug(null)}
          style={[
            styles.anyDoctorCard,
            selectedDoctorSlug === null ? styles.cardSelected : styles.cardUnselected,
            shadows.subtle,
          ]}
        >
          <View style={styles.anyIconCircle}>
            <UserCheck size={22} color={colors.primary} />
          </View>
          <View style={styles.anyTextCol}>
            <Text style={styles.anyTitle}>Any Available Specialist</Text>
            <Text style={styles.anySubtitle}>
              The clinic will assign the next available certified dermatologist.
            </Text>
          </View>
          {selectedDoctorSlug === null ? (
            <CheckCircle2 size={20} color={colors.primary} />
          ) : null}
        </TouchableOpacity>

        <Text style={styles.orDivider}>OR SELECT A SPECIFIC DOCTOR</Text>

        {/* Doctors List */}
        <View style={styles.doctorsList}>
          {doctors.map((doctor) => {
            const isSelected = selectedDoctorSlug === doctor.slug;
            return (
              <TouchableOpacity
                key={doctor.id}
                activeOpacity={0.88}
                onPress={() => setSelectedDoctorSlug(doctor.slug)}
                style={[
                  styles.doctorCard,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                  shadows.subtle,
                ]}
              >
                <Image
                  source={{ uri: doctor.photoUrl }}
                  style={styles.doctorPhoto}
                  contentFit="cover"
                />
                <View style={styles.doctorInfoCol}>
                  <View style={styles.docTopRow}>
                    <Text style={styles.docName}>{doctor.name}</Text>
                    {isSelected ? (
                      <CheckCircle2 size={18} color={colors.primary} />
                    ) : null}
                  </View>
                  <Text style={styles.docSpec} numberOfLines={1}>
                    {doctor.specialization}
                  </Text>
                  <View style={styles.docFooter}>
                    <RatingBadge rating={doctor.rating} reviewCount={doctor.reviewCount} size="sm" />
                    <Text style={styles.docExp}>{doctor.experienceYears}+ yrs exp</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, shadows.card]}>
        <PrimaryButton
          title="Continue to Procedure Selection"
          onPress={() => handleContinue()}
          style={styles.footerBtn}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  skipBtn: {
    padding: 6,
  },
  skipText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  stepBox: {
    marginBottom: 16,
  },
  stepBadge: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },
  anyDoctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  cardUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  cardSelected: {
    backgroundColor: '#FDF6F8',
    borderColor: colors.primary,
  },
  anyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  anyTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  anyTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  anySubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orDivider: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginVertical: 12,
    textAlign: 'center',
  },
  doctorsList: {
    gap: 12,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  doctorPhoto: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSubtle,
    marginRight: 12,
  },
  doctorInfoCol: {
    flex: 1,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  docName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  docSpec: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.primaryDark,
    marginBottom: 6,
  },
  docFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docExp: {
    fontSize: typography.fontSizes.micro,
    color: colors.textSecondary,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    width: '100%',
  },
});
