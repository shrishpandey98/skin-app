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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X, Sparkles, Phone, Mail, ShieldCheck } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const WelcomeAuthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { returnScreen, returnParams } = route.params || {};

  const [inputVal, setInputVal] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);

  const handleSendOTP = () => {
    if (!inputVal.trim()) return;

    navigation.navigate('OtpVerification', {
      phoneOrEmail: inputVal.trim(),
      isEmail: isEmailMode,
      returnScreen,
      returnParams,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Branding */}
          <View style={styles.heroBox}>
            <View style={styles.brandPill}>
              <Sparkles size={14} color={colors.primaryDark} />
              <Text style={styles.brandPillText}>AURA AESTHETICS</Text>
            </View>
            <Text style={styles.title}>Your journey to confident you ✨</Text>
            <Text style={styles.subtitle}>
              Sign in to book in-clinic appointments, save clinics and access your treatment history.
            </Text>
          </View>

          {/* Form Input */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>
              {isEmailMode ? 'Email Address' : 'Mobile Number'}
            </Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              {isEmailMode ? (
                <Mail size={18} color={colors.primary} />
              ) : (
                <View style={styles.phonePrefixBox}>
                  <Phone size={16} color={colors.primary} />
                  <Text style={styles.prefixText}>+91</Text>
                </View>
              )}
              <TextInput
                style={styles.textInput}
                value={inputVal}
                onChangeText={setInputVal}
                placeholder={isEmailMode ? 'name@example.com' : '98765 43210'}
                placeholderTextColor={colors.textMuted}
                keyboardType={isEmailMode ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoFocus
              />
            </View>

            {/* Switch Mode Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setIsEmailMode(!isEmailMode);
                setInputVal('');
              }}
              style={styles.switchModeBtn}
            >
              <Text style={styles.switchModeText}>
                {isEmailMode ? 'Use Mobile Number (SMS OTP) instead' : 'Use Email Address instead'}
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Get One-Time Password (OTP)"
              onPress={handleSendOTP}
              disabled={!inputVal.trim()}
              style={styles.ctaBtn}
            />
          </View>

          {/* Trust Guarantee */}
          <View style={styles.trustFooter}>
            <ShieldCheck size={16} color="#2D8A4E" />
            <Text style={styles.trustFooterText}>
              We never spam. Your contact details are used strictly for appointment confirmations and clinic reminders.
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
  placeholder: {
    width: 32,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  heroBox: {
    marginBottom: 28,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  brandPillText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: typography.fontSizes.hero - 2,
    lineHeight: typography.lineHeights.hero - 2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSizes.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  phonePrefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingRight: 10,
    marginRight: 10,
  },
  prefixText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.bodyLarge,
    color: colors.text,
    padding: 0,
  },
  switchModeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
  },
  switchModeText: {
    fontSize: typography.fontSizes.caption,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  ctaBtn: {
    marginTop: 14,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF7EE',
    padding: 14,
    borderRadius: borderRadius.md,
    gap: 10,
  },
  trustFooterText: {
    flex: 1,
    fontSize: typography.fontSizes.caption - 1,
    color: '#226D3C',
    lineHeight: 16,
  },
});
