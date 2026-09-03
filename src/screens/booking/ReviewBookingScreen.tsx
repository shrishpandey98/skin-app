import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Building2,
  User,
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { clinicsService } from '../../services/clinics.service';
import { doctorsService } from '../../services/doctors.service';
import { proceduresService } from '../../services/procedures.service';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { Clinic } from '../../types/clinic.types';
import { Doctor } from '../../types/doctor.types';
import { Procedure } from '../../types/procedure.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { analytics } from '../../services/analytics.service';

export const ReviewBookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    clinicSlug,
    doctorSlug,
    procedureSlug,
    appointmentDate,
    appointmentTime,
    patientName,
    patientPhone,
    patientEmail,
    notes,
  } = route.params || {};

  const { createAppointment } = useAppointmentsStore();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    if (clinicSlug) {
      const c = await clinicsService.getClinicBySlug(clinicSlug);
      if (c) setClinic(c);
    }
    if (doctorSlug) {
      const d = await doctorsService.getDoctorBySlug(doctorSlug);
      if (d) setDoctor(d);
    }
    if (procedureSlug) {
      const p = await proceduresService.getProcedureBySlug(procedureSlug);
      if (p) setProcedure(p);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const appointment = await createAppointment({
        clinicId: clinic?.id || clinicSlug,
        doctorId: doctor?.id || doctorSlug,
        procedureId: procedure?.id || procedureSlug,
        appointmentDate,
        appointmentTime,
        patientName,
        patientPhone,
        patientEmail,
        notes,
      });

      analytics.track('booking_completed', {
        appointmentId: appointment.id,
        clinicSlug,
        doctorSlug,
        procedureSlug,
      });

      setLoading(false);
      navigation.navigate('BookingSuccess', {
        appointmentId: appointment.id,
        appointment,
      });
    } catch (e) {
      console.warn('Booking confirmation failed', e);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepBox}>
          <Text style={styles.stepBadge}>STEP 5 OF 5</Text>
          <Text style={styles.title}>Review appointment</Text>
          <Text style={styles.subtitle}>
            Please review the details below before confirming your in-clinic consultation.
          </Text>
        </View>

        {/* Appointment Summary Card */}
        <View style={[styles.summaryCard, shadows.card]}>
          {/* Clinic */}
          <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Building2 size={18} color={colors.primary} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Clinic & Location</Text>
              <Text style={styles.itemValueBold}>{clinic?.name || 'Aesthetic Clinic'}</Text>
              <Text style={styles.itemSubValue}>{clinic?.address || 'Chandigarh'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Practitioner */}
          <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.secondaryLight }]}>
              <User size={18} color={colors.secondary} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Practitioner</Text>
              <Text style={styles.itemValueBold}>
                {doctor ? doctor.name : 'Any Available Certified Dermatologist'}
              </Text>
              {doctor ? (
                <Text style={styles.itemSubValue}>{doctor.specialization}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Procedure */}
          <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF4ED' }]}>
              <Stethoscope size={18} color={colors.peach} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Treatment Goal</Text>
              <Text style={styles.itemValueBold}>
                {procedure ? procedure.name : 'General In-Clinic Consultation'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date & Time */}
          <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#EAF7EE' }]}>
              <Calendar size={18} color="#2D8A4E" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Appointment Schedule</Text>
              <Text style={styles.itemValueBold}>
                {appointmentDate} at {appointmentTime}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Patient Details */}
          <View style={styles.patientInfoBox}>
            <Text style={styles.itemLabel}>Patient Information</Text>
            <Text style={styles.patientNameText}>{patientName}</Text>
            <Text style={styles.patientContactText}>{patientPhone}</Text>
            {patientEmail ? (
              <Text style={styles.patientContactText}>{patientEmail}</Text>
            ) : null}
            {notes ? (
              <Text style={styles.patientNotesText}>Note: "{notes}"</Text>
            ) : null}
          </View>
        </View>

        {/* Zero Booking Fee Guarantee */}
        <View style={styles.guaranteeCard}>
          <ShieldCheck size={20} color="#2D8A4E" />
          <View style={styles.guaranteeTextCol}>
            <Text style={styles.guaranteeTitle}>Zero Booking Fees</Text>
            <Text style={styles.guaranteeSubtitle}>
              Booking an in-clinic appointment on Aura is 100% free. Any treatment costs are payable directly at the clinic.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, shadows.card]}>
        <PrimaryButton
          title="Confirm In-Clinic Appointment"
          onPress={handleConfirm}
          loading={loading}
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
  placeholder: {
    width: 32,
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemTextCol: {
    flex: 1,
  },
  itemLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  itemValueBold: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 2,
  },
  itemSubValue: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSubtle,
    marginVertical: 14,
  },
  patientInfoBox: {
    backgroundColor: colors.surfaceSubtle,
    padding: 12,
    borderRadius: borderRadius.md,
  },
  patientNameText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 4,
  },
  patientContactText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  patientNotesText: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
    fontStyle: 'italic',
    marginTop: 6,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF7EE',
    padding: 14,
    borderRadius: borderRadius.md,
    gap: 10,
    marginBottom: 16,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: '#226D3C',
    marginBottom: 2,
  },
  guaranteeSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: '#226D3C',
    lineHeight: 16,
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
