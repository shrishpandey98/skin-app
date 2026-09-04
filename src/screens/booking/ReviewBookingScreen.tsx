import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  X,
} from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { clinicsService } from '../../services/clinics.service';
import { doctorsService } from '../../services/doctors.service';
import { proceduresService } from '../../services/procedures.service';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { useAuthStore } from '../../stores/auth.store';
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
  const {
    isAuthenticated,
    isGuest,
    loginWithCredentials,
    loginWithGoogle,
  } = useAuthStore();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(false);

  // Guest Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authEmail, setAuthEmail] = useState(patientEmail || '');
  const [authName, setAuthName] = useState(patientName || '');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    loadEntities();
    if (patientEmail && !authEmail) setAuthEmail(patientEmail);
    if (patientName && !authName) setAuthName(patientName);
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

  const executeAppointmentCreation = async () => {
    setLoading(true);
    try {
      const appointment = await createAppointment({
        clinicId: clinic?.id || clinicSlug,
        doctorId: doctor?.id || doctorSlug,
        procedureId: procedure?.id || procedureSlug,
        appointmentDate,
        appointmentTime,
        patientName: patientName || authName || 'Patient',
        patientPhone: patientPhone || '+91 98765 43210',
        patientEmail: patientEmail || authEmail || undefined,
        notes,
      });

      analytics.track('booking_completed', {
        appointmentId: appointment.id,
        clinicSlug,
        doctorSlug,
        procedureSlug,
      });

      setLoading(false);
      setShowAuthModal(false);
      navigation.navigate('BookingSuccess', {
        appointmentId: appointment.id,
        appointment,
      });
    } catch (e) {
      console.warn('Booking confirmation failed', e);
      setLoading(false);
    }
  };

  const handleMainCTA = () => {
    if (isGuest || !isAuthenticated) {
      // Prompt Guest for Signup / Signin on the last step
      setShowAuthModal(true);
    } else {
      executeAppointmentCreation();
    }
  };

  const handleModalSignupOrSignin = async () => {
    const targetEmail = authEmail.trim() || patientEmail.trim();
    if (!targetEmail) {
      setAuthError('Please enter your email or username');
      return;
    }
    if (!authPassword.trim() || authPassword.length < 4) {
      setAuthError('Password must be at least 4 characters');
      return;
    }
    if (authMode === 'signup' && !authName.trim() && !patientName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }

    try {
      setLoadingAuth(true);
      setAuthError('');
      await new Promise((res) => setTimeout(res, 400));
      await loginWithCredentials(
        targetEmail,
        authPassword.trim(),
        authMode === 'signup' ? (authName.trim() || patientName.trim()) : undefined
      );
      // Once signed up/signed in, finalize booking
      await executeAppointmentCreation();
    } catch (e: any) {
      setAuthError('Authentication failed. Please check your credentials.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleModalGoogleAuth = async () => {
    try {
      setLoadingGoogle(true);
      setAuthError('');
      await loginWithGoogle();
      // Google OAuth listener in auth.store will authenticate user, then we proceed
      await executeAppointmentCreation();
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.toLowerCase().includes('provider is not enabled') || msg.toLowerCase().includes('unsupported provider')) {
        setAuthError('Google OAuth is not yet enabled in Supabase dashboard. Please use email & password.');
      } else {
        setAuthError(msg || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoadingGoogle(false);
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
          <Text style={styles.stepBadge}>STEP 5 OF 5 • FINAL STEP</Text>
          <Text style={styles.title}>Review appointment</Text>
          <Text style={styles.subtitle}>
            Please review the details below before confirming your in-clinic consultation.
          </Text>
        </View>

        {/* Guest Signup Prompt Banner */}
        {(isGuest || !isAuthenticated) && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowAuthModal(true)}
            style={[styles.guestPromptBanner, shadows.subtle]}
          >
            <View style={styles.guestBannerIcon}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View style={styles.guestBannerContent}>
              <Text style={styles.guestBannerTitle}>Guest Booking</Text>
              <Text style={styles.guestBannerSubtitle}>
                Create an account in 10 seconds to receive instant doctor confirmations & track appointments.
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Appointment Summary Card */}
        <View style={[styles.summaryCard, shadows.card]}>
          {/* Clinic */}
          <View style={styles.itemRow}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <Building2 size={18} color={colors.primary} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemLabel}>Clinic & Location</Text>
              <Text style={styles.itemValueBold}>{clinic?.name || 'Dr. Purva\'s Skin & Laser Clinic'}</Text>
              <Text style={styles.itemSubValue}>{clinic?.address || 'Plot No. 1187, Sector 11, Panchkula'}</Text>
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
                {doctor ? doctor.name : 'Dr. Purva Pande (Lead Dermatologist)'}
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
            <Text style={styles.patientNameText}>{patientName || 'Patient'}</Text>
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
          title={
            isGuest || !isAuthenticated
              ? 'Sign Up & Confirm Appointment'
              : 'Confirm In-Clinic Appointment'
          }
          onPress={handleMainCTA}
          loading={loading}
          style={styles.footerBtn}
        />
      </View>

      {/* Guest Signup / Sign In Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuthModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, shadows.floating]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <Sparkles size={18} color={colors.primary} />
                <Text style={styles.modalTitle}>
                  {authMode === 'signup' ? 'Create Account & Confirm' : 'Sign In to Confirm'}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowAuthModal(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {authMode === 'signup'
                ? 'Sign up to lock in your appointment schedule and receive WhatsApp & email updates.'
                : 'Sign in to confirm your appointment under your Aura account.'}
            </Text>

            {/* Mode Switcher */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                style={[styles.tabBtn, authMode === 'signup' && styles.tabBtnActive]}
              >
                <Text style={[styles.tabBtnText, authMode === 'signup' && styles.tabBtnTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                style={[styles.tabBtn, authMode === 'signin' && styles.tabBtnActive]}
              >
                <Text style={[styles.tabBtnText, authMode === 'signin' && styles.tabBtnTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {authError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            {authMode === 'signup' && (
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalInputLabel}>Full Name</Text>
                <View style={styles.modalInputBox}>
                  <User size={16} color={colors.primary} />
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textMuted}
                    value={authName}
                    onChangeText={setAuthName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Email or Username</Text>
              <View style={styles.modalInputBox}>
                <Mail size={16} color={colors.primary} />
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={authEmail}
                  onChangeText={setAuthEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Password</Text>
              <View style={styles.modalInputBox}>
                <Lock size={16} color={colors.primary} />
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={authPassword}
                  onChangeText={setAuthPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={colors.textSecondary} />
                  ) : (
                    <Eye size={16} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Submit */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleModalSignupOrSignin}
              disabled={loadingAuth || loading}
              style={[styles.modalSubmitBtn, shadows.subtle]}
            >
              {loadingAuth || loading ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>
                  {authMode === 'signup'
                    ? 'Create Account & Confirm Booking'
                    : 'Sign In & Confirm Booking'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Google SSO */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleModalGoogleAuth}
              disabled={loadingGoogle || loading}
              style={[styles.googleModalBtn, shadows.subtle]}
            >
              {loadingGoogle ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <View style={styles.googleModalContent}>
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleGText}>G</Text>
                  </View>
                  <Text style={styles.googleModalBtnText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

  // Guest Prompt Banner
  guestPromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  guestBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBannerContent: {
    flex: 1,
  },
  guestBannerTitle: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  guestBannerSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.text,
    lineHeight: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },

  // Modal Mode Switcher Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.pill,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.pill,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  tabBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeights.bold,
  },

  // Error Box
  errorBox: {
    backgroundColor: '#FDF2F2',
    padding: 10,
    borderRadius: borderRadius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F8D7DA',
  },
  errorText: {
    fontSize: typography.fontSizes.caption - 1,
    color: '#D32F2F',
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },

  // Inputs
  modalInputGroup: {
    marginBottom: 12,
  },
  modalInputLabel: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  modalInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  modalTextInput: {
    flex: 1,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },

  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  modalSubmitBtnText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
  },

  // Google Modal Button
  googleModalBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleModalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  googleModalBtnText: {
    fontSize: typography.fontSizes.caption + 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
});
