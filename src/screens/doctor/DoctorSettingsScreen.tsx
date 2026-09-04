import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Globe,
  UserPlus,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react-native';
import { Modal, TextInput, ActivityIndicator } from 'react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const DoctorSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    activeClinic,
    clinicDoctors,
    doctorUser,
    doctorLogout,
    setDoctorMode,
    addDoctorToClinic,
    toggleDoctorActive,
  } = useDoctorStore();

  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docQualification, setDocQualification] = useState('');
  const [docExpYears, setDocExpYears] = useState('5');
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [addDoctorError, setAddDoctorError] = useState('');

  const handleSwitchToCustomer = () => {
    setDoctorMode(false);
    navigation.navigate('MainTabs');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out of Clinic Portal',
      'Are you sure you want to sign out from the clinic management portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await doctorLogout();
          },
        },
      ]
    );
  };

  const handleSaveDoctor = async () => {
    if (!docName.trim()) {
      setAddDoctorError('Please enter doctor full name');
      return;
    }
    if (!docSpecialization.trim()) {
      setAddDoctorError('Please enter specialization');
      return;
    }

    try {
      setSavingDoctor(true);
      setAddDoctorError('');
      await addDoctorToClinic({
        name: docName.trim(),
        specialization: docSpecialization.trim(),
        qualification: docQualification.trim() || 'MBBS, MD Dermatology',
        experienceYears: parseInt(docExpYears) || 5,
      });
      setIsAddDoctorModalOpen(false);
      setDocName('');
      setDocSpecialization('');
      setDocQualification('');
      setDocExpYears('5');
    } catch (e: any) {
      setAddDoctorError(e?.message || 'Failed to add doctor');
    } finally {
      setSavingDoctor(false);
    }
  };

  const days = [
    { day: 'Monday – Friday', hours: '10:00 AM – 07:00 PM' },
    { day: 'Saturday', hours: '10:00 AM – 06:30 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Clinic & Portal Settings</Text>
          <Text style={styles.headerSubtitle}>{activeClinic.name}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.headerLogoutBtn}
        >
          <LogOut size={16} color="#D32F2F" />
          <Text style={styles.headerLogoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logged in Account Banner */}
        {doctorUser ? (
          <View style={[styles.accountBanner, shadows.subtle]}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>
                {doctorUser.name ? doctorUser.name.replace('Dr. ', '').charAt(0) : 'C'}
              </Text>
            </View>
            <View style={styles.accountTextCol}>
              <View style={styles.accountNameRow}>
                <Text style={styles.accountName}>{doctorUser.name}</Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>Clinic Admin</Text>
                </View>
              </View>
              <Text style={styles.accountEmail}>{doctorUser.email}</Text>
            </View>
          </View>
        ) : null}

        {/* Switch Role Card */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleSwitchToCustomer}
          style={[styles.switchCard, shadows.card]}
        >
          <View style={styles.switchLeft}>
            <View style={styles.switchIcon}>
              <RotateCcw size={20} color={colors.primary} />
            </View>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Switch to Customer App</Text>
              <Text style={styles.switchSubtitle}>
                Browse marketplace treatments and view live customer experience.
              </Text>
            </View>
          </View>
          <ArrowRight size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Clinic Doctors Team Section */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.teamHeaderRow}>
            <View style={styles.cardHeader}>
              <User size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Clinic Doctors & Team ({clinicDoctors.length})</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAddDoctorModalOpen(true)}
              style={styles.addDocBtn}
            >
              <UserPlus size={14} color={colors.primaryDark} />
              <Text style={styles.addDocBtnText}>+ Add Doctor</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.teamSubtext}>
            Doctors listed here are available for customer booking and schedule assignment.
          </Text>

          <View style={styles.docCardsList}>
            {clinicDoctors.map((doc) => (
              <View key={doc.id} style={styles.doctorItemCard}>
                <View style={styles.docAvatar}>
                  <Text style={styles.docAvatarInitial}>
                    {doc.name.replace('Dr. ', '').charAt(0) || 'D'}
                  </Text>
                </View>
                <View style={styles.docTextCol}>
                  <View style={styles.docNameRow}>
                    <Text style={styles.docNameTitle}>{doc.name}</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleDoctorActive(doc.id)}
                      style={[styles.activeTogglePill, doc.isActive ? styles.pillActive : styles.pillInactive]}
                    >
                      <Text style={[styles.activeToggleText, doc.isActive ? styles.textActive : styles.textInactive]}>
                        {doc.isActive ? 'Active' : 'On Leave'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.docSpecText}>{doc.specialization}</Text>
                  <Text style={styles.docQualText}>
                    {doc.qualification} • {doc.experienceYears}+ yrs exp
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Clinic Info Section */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.cardHeader}>
            <Building2 size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Clinic Profile</Text>
          </View>

          <Text style={styles.clinicName}>{activeClinic.name}</Text>
          <Text style={styles.clinicDesc}>{activeClinic.description}</Text>

          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{activeClinic.address}</Text>
          </View>

          <View style={styles.detailRow}>
            <Phone size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{activeClinic.phone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{activeClinic.email}</Text>
          </View>
        </View>

        {/* Operating Hours */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.cardHeader}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Operating Hours</Text>
          </View>

          {days.map((d, idx) => (
            <View key={idx} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{d.day}</Text>
              <Text style={[styles.dayHours, d.hours === 'Closed' && styles.closedText]}>
                {d.hours}
              </Text>
            </View>
          ))}
        </View>

        {/* Knowledge Base Link */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('DoctorProcedures')}
          style={[styles.linkBtn, shadows.subtle]}
        >
          <View style={styles.linkBtnLeft}>
            <Sparkles size={18} color={colors.primaryDark} />
            <Text style={styles.linkBtnText}>Master Procedure Knowledge Base & Pricing</Text>
          </View>
          <ArrowRight size={16} color={colors.primaryDark} />
        </TouchableOpacity>
      </ScrollView>

      {/* Minimal Add Doctor Modal */}
      <Modal
        visible={isAddDoctorModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddDoctorModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, shadows.card]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Doctor to Clinic</Text>
                <Text style={styles.modalSubtitle}>Added to clinic roster & customer booking</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsAddDoctorModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {addDoctorError ? (
              <View style={styles.modalErrorBox}>
                <Text style={styles.modalErrorText}>{addDoctorError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Doctor Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Dr. Sunita Kapoor"
                  placeholderTextColor={colors.textMuted}
                  value={docName}
                  onChangeText={setDocName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Specialization / Role *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Aesthetic Cosmetologist & Trichologist"
                  placeholderTextColor={colors.textMuted}
                  value={docSpecialization}
                  onChangeText={setDocSpecialization}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Qualifications</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. MBBS, MD (Dermatology), FAM"
                  placeholderTextColor={colors.textMuted}
                  value={docQualification}
                  onChangeText={setDocQualification}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Years of Experience</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 7"
                  placeholderTextColor={colors.textMuted}
                  value={docExpYears}
                  onChangeText={setDocExpYears}
                  keyboardType="numeric"
                />
              </View>

              {/* Submit CTA */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveDoctor}
                disabled={savingDoctor}
                style={[styles.saveDoctorBtn, shadows.subtle]}
              >
                {savingDoctor ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.saveBtnRow}>
                    <Plus size={18} color={colors.textInverse} />
                    <Text style={styles.saveDoctorBtnText}>Add Doctor to Roster</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#FDF2F2',
  },
  headerLogoutText: {
    fontSize: typography.fontSizes.caption,
    color: '#D32F2F',
    fontWeight: typography.fontWeights.bold,
  },
  headerTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // Account Banner
  accountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: typography.fontWeights.heavy,
  },
  accountTextCol: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  rolePill: {
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#E8D29F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  rolePillText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  accountEmail: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Switch Role Card
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF6EE',
    borderWidth: 1.5,
    borderColor: '#E8D29F',
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  switchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  switchSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Doctors Team Section
  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#E8D29F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  addDocBtnText: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  teamSubtext: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  docCardsList: {
    gap: 10,
  },
  doctorItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarInitial: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  docTextCol: {
    flex: 1,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  docNameTitle: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  activeTogglePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  pillActive: {
    backgroundColor: '#E8F5E9',
  },
  pillInactive: {
    backgroundColor: '#FFEBEE',
  },
  activeToggleText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
  },
  textActive: {
    color: '#2E7D32',
  },
  textInactive: {
    color: '#D32F2F',
  },
  docSpecText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.medium,
  },
  docQualText: {
    fontSize: typography.fontSizes.micro,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  clinicName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  clinicDesc: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: typography.fontSizes.caption,
    color: colors.text,
  },

  // Operating Hours
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  dayLabel: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },
  dayHours: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  closedText: {
    color: '#D32F2F',
  },

  // Link Button
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkBtnText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalErrorBox: {
    backgroundColor: '#FDF2F2',
    padding: 10,
    borderRadius: borderRadius.md,
    marginBottom: 12,
  },
  modalErrorText: {
    fontSize: typography.fontSizes.caption,
    color: '#D32F2F',
  },
  modalForm: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: typography.fontSizes.body,
    color: colors.text,
  },
  saveDoctorBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveDoctorBtnText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },
});

