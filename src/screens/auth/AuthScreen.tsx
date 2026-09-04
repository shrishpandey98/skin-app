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
import { Sparkles, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { loginWithGoogle, loginWithCredentials, continueAsGuest } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleGoogleSSO = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage('');
      await loginWithGoogle();
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.toLowerCase().includes('provider is not enabled') || msg.toLowerCase().includes('unsupported provider')) {
        setErrorMessage('Google OAuth is not yet enabled in your Supabase dashboard. Please enable Google in Supabase > Authentication > Providers, or use Email / Continue as Guest.');
      } else {
        setErrorMessage(msg || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleCredentialsAuth = async () => {
    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter your username or email');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    try {
      setLoadingAuth(true);
      setErrorMessage('');
      await new Promise((res) => setTimeout(res, 400));
      await loginWithCredentials(
        usernameOrEmail.trim(),
        password.trim(),
        mode === 'signup' ? fullName.trim() : undefined
      );
    } catch (e: any) {
      setErrorMessage('Authentication failed. Please check credentials.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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
              <Sparkles size={20} color={colors.primary} />
            </View>
            <Text style={styles.brandName}>AURA</Text>
            <Text style={styles.brandTagline}>Aesthetic Dermatology & Clinic Marketplace</Text>
          </View>

          {/* Sign In / Sign Up Mode Switcher */}
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
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              style={[styles.tabBtn, mode === 'signup' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, mode === 'signup' && styles.tabBtnTextActive]}>
                Create Account
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
            {mode === 'signup' ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[styles.inputBox, shadows.subtle]}>
                  <User size={18} color={colors.primary} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Dr. / Ms. / Mr. Name"
                    placeholderTextColor={colors.textMuted}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username or Email</Text>
              <View style={[styles.inputBox, shadows.subtle]}>
                <Mail size={18} color={colors.primary} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@example.com or username"
                  placeholderTextColor={colors.textMuted}
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
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

            {/* Submit Credentials Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCredentialsAuth}
              disabled={loadingAuth}
              style={[styles.primaryAuthBtn, shadows.subtle]}
            >
              {loadingAuth ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={styles.primaryAuthBtnText}>
                  {mode === 'signin' ? 'Sign In to Aura' : 'Create Account'}
                </Text>
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
            onPress={handleGoogleSSO}
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
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Continue as Guest Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGuest}
            style={styles.guestBtn}
          >
            <Text style={styles.guestBtnTitle}>Continue as Guest</Text>
            <Text style={styles.guestBtnSubtitle}>
              Explore treatments & transparent clinic pricing first →
            </Text>
          </TouchableOpacity>

          {/* Privacy Reassurance */}
          <View style={styles.trustBox}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={styles.trustText}>
              Direct in-clinic booking • Verified MDs • Zero spam
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
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Brand Header
  brandHero: {
    alignItems: 'center',
    marginBottom: 26,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandName: {
    fontSize: 28,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.pill,
    padding: 4,
    marginBottom: 20,
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
    marginBottom: 18,
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
    marginTop: 6,
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
    marginVertical: 18,
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
    marginBottom: 16,
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

  // Guest Button
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  guestBtnTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 2,
  },
  guestBtnSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
  },

  // Trust Footnote
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  trustText: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
  },
});
