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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Phone, Mail, MapPin } from 'lucide-react-native';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { useAuthStore } from '../../stores/auth.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const PersonalDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'priya.sharma@example.com');
  const [city, setCity] = useState(user?.city || 'Chandigarh');

  const handleSave = () => {
    updateProfile({ name, phone, email, city });
    Alert.alert('Profile Updated', 'Your profile details have been successfully saved.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <User size={18} color={colors.primary} />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Phone</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <Phone size={18} color={colors.primary} />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <Mail size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City</Text>
            <View style={[styles.inputContainer, shadows.subtle]}>
              <MapPin size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>
        </View>

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          style={styles.saveBtn}
        />
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
    padding: 20,
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
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
  saveBtn: {
    marginTop: 10,
  },
});
