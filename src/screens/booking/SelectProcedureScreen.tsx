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
import { ArrowLeft, CheckCircle2, Stethoscope, Sparkles } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { PriceTag } from '../../components/ui/PriceTag';
import { clinicsService } from '../../services/clinics.service';
import { Clinic, ClinicProcedurePricing } from '../../types/clinic.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const SelectProcedureScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clinicSlug, doctorSlug, preSelectedProcedureSlug } = route.params || {};

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [selectedProcedureSlug, setSelectedProcedureSlug] = useState<string | null>(
    preSelectedProcedureSlug || null
  );

  useEffect(() => {
    loadClinic();
  }, [clinicSlug]);

  const loadClinic = async () => {
    const c = await clinicsService.getClinicBySlug(clinicSlug || 'aesthetica-skin-and-laser-clinic');
    if (c) setClinic(c);
  };

  const handleContinue = (procSlug?: string | null) => {
    navigation.navigate('SelectDateTime', {
      clinicSlug,
      doctorSlug,
      procedureSlug: procSlug !== undefined ? procSlug : selectedProcedureSlug,
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
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Treatment</Text>
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
          <Text style={styles.stepBadge}>STEP 2 OF 5</Text>
          <Text style={styles.title}>What is your treatment goal?</Text>
          <Text style={styles.subtitle}>
            Select a specific treatment or choose General Skin Consultation.
          </Text>
        </View>

        {/* General Consultation Option */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedProcedureSlug(null)}
          style={[
            styles.generalCard,
            selectedProcedureSlug === null ? styles.cardSelected : styles.cardUnselected,
            shadows.subtle,
          ]}
        >
          <View style={styles.generalIconCircle}>
            <Stethoscope size={22} color={colors.secondary} />
          </View>
          <View style={styles.generalTextCol}>
            <Text style={styles.generalTitle}>General In-Clinic Consultation</Text>
            <Text style={styles.generalSubtitle}>
              Meet the doctor for clinical skin assessment & tailored treatment plan.
            </Text>
          </View>
          {selectedProcedureSlug === null ? (
            <CheckCircle2 size={20} color={colors.primary} />
          ) : null}
        </TouchableOpacity>

        <Text style={styles.orDivider}>OR SELECT A SPECIFIC PROCEDURE</Text>

        {/* Procedures List */}
        <View style={styles.proceduresList}>
          {clinic?.procedures?.map((proc) => {
            const isSelected =
              selectedProcedureSlug === proc.procedureId ||
              selectedProcedureSlug === proc.id.replace(/^cp_[a-z]+_/, '').replace(/_/g, '-');

            const procTitle = proc.id
              .replace(/^cp_[a-z]+_/, '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <TouchableOpacity
                key={proc.id}
                activeOpacity={0.88}
                onPress={() => setSelectedProcedureSlug(proc.procedureId)}
                style={[
                  styles.procCard,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                  shadows.subtle,
                ]}
              >
                <View style={styles.procInfoCol}>
                  <View style={styles.procTitleRow}>
                    <Text style={styles.procName}>{procTitle}</Text>
                    {isSelected ? (
                      <CheckCircle2 size={18} color={colors.primary} />
                    ) : null}
                  </View>
                  {proc.description ? (
                    <Text style={styles.procDesc}>{proc.description}</Text>
                  ) : null}
                  <PriceTag
                    priceFrom={proc.priceFrom}
                    priceTo={proc.priceTo}
                    unit={proc.priceUnit}
                    prefix="Estimated Rate:"
                    size="sm"
                    style={styles.priceTag}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, shadows.card]}>
        <PrimaryButton
          title="Continue to Date & Time"
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
  backBtn: {
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
  generalCard: {
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
  generalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  generalTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  generalTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  generalSubtitle: {
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
  proceduresList: {
    gap: 10,
  },
  procCard: {
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  procInfoCol: {
    flex: 1,
  },
  procTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  procName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  procDesc: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  priceTag: {
    marginTop: 2,
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
