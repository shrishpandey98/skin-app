import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuthStore } from '../../stores/auth.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const OtpVerificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phoneOrEmail, isEmail, returnScreen, returnParams } = route.params || {
    phoneOrEmail: '+91 98765 43210',
  };

  const { login } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 4) return;
    setLoading(true);

    try {
      await login(phoneOrEmail, 'Priya Sharma');
      setLoading(false);

      if (returnScreen) {
        navigation.navigate(returnScreen, returnParams);
      } else {
        navigation.getParent()?.goBack?.() || navigation.goBack();
      }
    } catch (e) {
      setLoading(false);
      Alert.alert('Verification Failed', 'Invalid OTP code. Please try again.');
    }
  };

  const handleResend = () => {
    setCountdown(30);
    Alert.alert('OTP Resent', `A new verification code has been sent to ${phoneOrEmail}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroBox}>
          <View style={styles.iconCircle}>
            <KeyRound size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We have sent a 6-digit code to{' '}
            <Text style={styles.targetText}>{phoneOrEmail}</Text>
          </Text>
        </View>

        {/* OTP Input Field */}
        <View style={styles.otpSection}>
          <View style={[styles.inputContainer, shadows.subtle]}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="• • • • • •"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          {/* Resend Timer */}
          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.timerText}>Resend code in {countdown}s</Text>
            ) : (
              <TouchableOpacity activeOpacity={0.8} onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Demo Hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              💡 Demo Mode: Enter any 4–6 digit OTP (e.g. 123456) to sign in.
            </Text>
          </View>

          <PrimaryButton
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
            disabled={otp.length < 4}
            style={styles.ctaBtn}
          />
        </View>
      </ScrollView>
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
    padding: 24,
    paddingTop: 20,
  },
  heroBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: typography.fontSizes.h1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  targetText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  otpSection: {
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  otpInput: {
    fontSize: 28,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 10,
    textAlign: 'center',
    color: colors.text,
    padding: 0,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textMuted,
  },
  resendLink: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
  },
  hintBox: {
    backgroundColor: '#F8F6F3',
    padding: 12,
    borderRadius: borderRadius.md,
    marginBottom: 20,
  },
  hintText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  ctaBtn: {},
});
