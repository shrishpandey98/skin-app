import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Stethoscope,
  Building2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';

export const DoctorAuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { loginDoctorWithCredentials, loginDoctorWithGoogle, setDoctorMode } = useDoctorStore();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCredentialsAuth = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your professional email or doctor ID');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }
    if (mode === 'register') {
      if (!doctorName.trim()) {
        setErrorMessage('Please enter doctor / practitioner name');
        return;
      }
      if (!clinicName.trim()) {
        setErrorMessage('Please enter your clinic name');
        return;
      }
    }

    try {
      setLoadingAuth(true);
      setErrorMessage('');
      await new Promise((res) => setTimeout(res, 400));
      await loginDoctorWithCredentials(
        email.trim(),
        password.trim(),
        mode === 'register' ? doctorName.trim() : undefined,
        mode === 'register' ? clinicName.trim() : undefined
      );
    } catch (e: any) {
      setErrorMessage('Authentication failed. Please check your credentials.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage('');
      await new Promise((res) => setTimeout(res, 400));
      await loginDoctorWithGoogle();
    } catch (e: any) {
      setErrorMessage(e?.message || 'Google authentication failed.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSwitchToCustomer = () => {
    setDoctorMode(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Floating Back to Customer App */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSwitchToCustomer}
        style={[styles.floatingSwitchBtn, shadows.subtle]}
      >
        <RotateCcw size={16} color={colors.primary} />
        <Text style={styles.floatingSwitchText}>Customer App</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandHero}>
            <View style={styles.logoBadge}>
              <Stethoscope size={24} color={colors.primary} />
            </View>
            <View style={styles.portalTag}>
              <Sparkles size={12} color={colors.primaryDark} />
              <Text style={styles.portalTagText}>DOCTOR & CLINIC PORTAL</Text>
            </View>
            <Text style={styles.brandName}>AURA CLINICAL</Text>
            <Text style={styles.brandTagline}>
              Manage appointments, procedures, and clinic pricing in real-time
            </Text>
          </View>

          {/* Sign In / Register Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              style={[styles.tabBtn, mode === 'signin' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, mode === 'signin' && styles.tabBtnTextActive]}>
                Doctor Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('register');
                setErrorMessage('');
              }}
              style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, mode === 'register' && styles.tabBtnTextActive]}>
                Register Clinic
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {mode === 'register' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Doctor / Practitioner Name</Text>
                  <View style={[styles.inputBox, shadows.subtle]}>
                    <User size={18} color={colors.primary} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Dr. Purva Pande"
                      placeholderTextColor={colors.textMuted}
                      value={doctorName}
                      onChangeText={setDoctorName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Clinic Name</Text>
                  <View style={[styles.inputBox, shadows.subtle]}>
                    <Building2 size={18} color={colors.primary} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Dr. Purva's Skin & Laser Clinic"
                      placeholderTextColor={colors.textMuted}
                      value={clinicName}
                      onChangeText={setClinicName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Professional Email / Clinic ID</Text>
              <View style={[styles.inputBox, shadows.subtle]}>
                <Mail size={18} color={colors.primary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="drpurva@skinandlaser.in or clinic id"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputBox, shadows.subtle]}>
                <Lock size={18} color={colors.primary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCredentialsAuth}
              disabled={loadingAuth}
              style={[styles.primaryAuthBtn, shadows.subtle]}
            >
              {loadingAuth ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.primaryAuthBtnText}>
                    {mode === 'signin' ? 'Sign In to Clinic Dashboard' : 'Register & Access Portal'}
                  </Text>
                  <ArrowRight size={18} color={colors.textInverse} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google SSO Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoogleAuth}
            disabled={loadingGoogle}
            style={[styles.googleBtn, shadows.subtle]}
          >
            {loadingGoogle ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <View style={styles.googleContent}>
                <View style={styles.googleIconCircle}>
                  <Text style={styles.googleGText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>Continue with Google (Doctor Account)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Quick Demo Pre-fill */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setEmail('drpurva@skinandlaser.in');
              setPassword('doctor123');
            }}
            style={styles.demoFillBtn}
          >
            <Text style={styles.demoFillText}>
              ⚡ Quick Fill: <Text style={{ fontWeight: 'bold' }}>Dr. Purva's Clinic Demo</Text>
            </Text>
          </TouchableOpacity>

          {/* Trust & Privacy Footnote */}
          <View style={styles.trustBox}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={styles.trustText}>
              256-bit Encrypted • Direct EHR & WhatsApp Sync • Patient Data Protected
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Floating Switch Button
  floatingSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  floatingSwitchText: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },

  // Brand Header
  brandHero: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FAF6EE',
    borderWidth: 1.5,
    borderColor: '#E8D29F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  portalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF6EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E8D29F',
  },
  portalTagText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.8,
  },
  brandName: {
    fontSize: 26,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.pill,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.pill,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  tabBtnText: {
    fontSize: typography.fontSizes.caption + 1,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.text,
    fontWeight: typography.fontWeights.bold,
  },

  // Errors
  errorBox: {
    backgroundColor: '#FDF2F2',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F8D7DA',
  },
  errorText: {
    fontSize: typography.fontSizes.caption,
    color: '#D32F2F',
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },

  // Form Fields
  formContainer: {
    gap: 14,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.text,
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },

  primaryAuthBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryAuthBtnText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
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
    letterSpacing: 0.5,
  },

  // Google SSO Button
  googleBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  googleBtnText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },

  // Demo fill
  demoFillBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  demoFillText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.primaryDark,
  },

  // Trust Footnote
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  trustText: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
});
