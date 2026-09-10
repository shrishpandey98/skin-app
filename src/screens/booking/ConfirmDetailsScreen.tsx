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
import { ArrowLeft, User, Phone, Mail, FileText, Lock } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuthStore } from '../../stores/auth.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const ConfirmDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    clinicSlug,
    doctorSlug,
    procedureSlug,
    appointmentDate,
    appointmentTime,
  } = route.params || {};

  const { user, isAuthenticated } = useAuthStore();

  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');

  const handleContinue = () => {
    if (!patientName.trim() || !patientPhone.trim()) return;

    navigation.navigate('ReviewBooking', {
      clinicSlug,
      doctorSlug,
      procedureSlug,
      appointmentDate,
      appointmentTime,
      patientName,
      patientPhone,
      patientEmail,
      notes,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepBox}>
          <Text style={styles.stepBadge}>
            {procedureSlug ? 'STEP 2 OF 3' : 'STEP 3 OF 4'}
          </Text>
          <Text style={styles.title}>Who is this booking for?</Text>
          <Text style={styles.subtitle}>
            Enter patient contact information for appointment verification & reminders.
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Patient Name *</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <User size={18} color={colors.primary} />
              <TextInput
                style={styles.textInput}
                value={patientName}
                onChangeText={setPatientName}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <Phone size={18} color={colors.primary} />
              <TextInput
                style={styles.textInput}
                value={patientPhone}
                onChangeText={setPatientPhone}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <Mail size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={patientEmail}
                onChangeText={setPatientEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Consultation Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes for the Doctor (Optional)</Text>
            <View style={[styles.textAreaContainer, shadows.subtle]}>
              <FileText size={18} color={colors.textSecondary} style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any specific concerns, skin history, or questions..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Lock size={14} color="#2D8A4E" />
          <Text style={styles.privacyText}>
            Your phone number is shared only with the selected clinic for appointment confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, shadows.card]}>
        <PrimaryButton
          title="Review & Confirm Booking"
          onPress={handleContinue}
          disabled={!patientName.trim() || !patientPhone.trim()}
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
    marginBottom: 20,
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
  formSection: {
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.text,
    marginLeft: 10,
    padding: 0,
  },
  textAreaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.text,
    marginLeft: 10,
    padding: 0,
    textAlignVertical: 'top',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EE',
    padding: 12,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  privacyText: {
    flex: 1,
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
