import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  UserPlus,
  X,
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const DoctorSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {
    activeClinic,
    clinicDoctors,
    doctorUser,
    isClinicPublished,
    toggleClinicPublish,
    doctorLogout,
    addDoctorToClinic,
    removeDoctor,
    updateDoctor,
    toggleDoctorActive,
    updateClinicProfile,
    updateUserProfile,
    updateOperatingHours,
  } = useDoctorStore();

  // 1. Add Doctor Modal State
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docQualification, setDocQualification] = useState('');
  const [docExpYears, setDocExpYears] = useState('');
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [addDoctorError, setAddDoctorError] = useState('');

  // 2. Edit User Profile Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // 3. Edit Clinic Profile Modal State
  const [isEditClinicModalOpen, setIsEditClinicModalOpen] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [clinicDescription, setClinicDescription] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicCity, setClinicCity] = useState('');
  const [savingClinic, setSavingClinic] = useState(false);

  // 4. Edit Operating Hours Modal State
  const [isEditHoursModalOpen, setIsEditHoursModalOpen] = useState(false);
  const [weekdayHours, setWeekdayHours] = useState('');
  const [saturdayHours, setSaturdayHours] = useState('');
  const [sundayHours, setSundayHours] = useState('');
  const [savingHours, setSavingHours] = useState(false);

  // 5. Edit Doctor Modal State
  const [isEditDoctorModalOpen, setIsEditDoctorModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [editDocName, setEditDocName] = useState('');
  const [editDocSpecialization, setEditDocSpecialization] = useState('');
  const [editDocQualification, setEditDocQualification] = useState('');
  const [editDocExpYears, setEditDocExpYears] = useState('');
  const [savingEditDoctor, setSavingEditDoctor] = useState(false);

  // In-app Confirmation Modal States (100% web & mobile reliable)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pendingPublishVal, setPendingPublishVal] = useState(false);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<{ id: string; name: string } | null>(null);

  const handleTogglePublish = (nextVal: boolean) => {
    setPendingPublishVal(nextVal);
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    setIsPublishModalOpen(false);
    await toggleClinicPublish(pendingPublishVal);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('portal');
        url.searchParams.delete('mode');
        window.history.replaceState({}, '', url.pathname);
      } catch (e) {}
    }
    await doctorLogout();
  };

  // Open Edit User Modal
  const handleOpenEditUser = () => {
    setUserName(doctorUser?.name || '');
    setUserEmail(doctorUser?.email || '');
    setUserPhone(doctorUser?.phone || '');
    setIsEditUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userName.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    setSavingUser(true);
    try {
      await updateUserProfile({
        name: userName.trim(),
        email: userEmail.trim(),
        phone: userPhone.trim(),
      });
      setIsEditUserModalOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update user profile');
    } finally {
      setSavingUser(false);
    }
  };

  // Open Edit Clinic Modal
  const handleOpenEditClinic = () => {
    setClinicName(activeClinic.name || '');
    setClinicDescription(activeClinic.description || '');
    setClinicPhone(activeClinic.phone || '');
    setClinicEmail(activeClinic.email || '');
    setClinicAddress(activeClinic.address || '');
    setClinicCity(activeClinic.city || '');
    setIsEditClinicModalOpen(true);
  };

  const handleSaveClinic = async () => {
    if (!clinicName.trim()) {
      Alert.alert('Required', 'Please enter clinic name');
      return;
    }
    setSavingClinic(true);
    try {
      const slug = clinicName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await updateClinicProfile({
        name: clinicName.trim(),
        slug,
        description: clinicDescription.trim(),
        phone: clinicPhone.trim(),
        email: clinicEmail.trim(),
        address: clinicAddress.trim(),
        city: clinicCity.trim(),
      });
      setIsEditClinicModalOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update clinic profile');
    } finally {
      setSavingClinic(false);
    }
  };

  // Open Edit Hours Modal
  const handleOpenEditHours = () => {
    setWeekdayHours(activeClinic.openingHours?.monday?.open ? `${activeClinic.openingHours.monday.open} – ${activeClinic.openingHours.monday.close}` : '');
    setSaturdayHours(activeClinic.openingHours?.saturday?.open ? `${activeClinic.openingHours.saturday.open} – ${activeClinic.openingHours.saturday.close}` : '');
    setSundayHours(activeClinic.openingHours?.sunday?.isClosed ? 'Closed' : (activeClinic.openingHours?.sunday?.open ? `${activeClinic.openingHours.sunday.open} – ${activeClinic.openingHours.sunday.close}` : ''));
    setIsEditHoursModalOpen(true);
  };

  const handleSaveHours = async () => {
    setSavingHours(true);
    try {
      const [wOpen, wClose] = weekdayHours.includes('–') ? weekdayHours.split('–').map(s => s.trim()) : ['10:00 AM', '07:00 PM'];
      const [sOpen, sClose] = saturdayHours.includes('–') ? saturdayHours.split('–').map(s => s.trim()) : ['10:00 AM', '06:30 PM'];
      const isSunClosed = sundayHours.trim().toLowerCase() === 'closed';
      const [sunOpen, sunClose] = (!isSunClosed && sundayHours.includes('–')) ? sundayHours.split('–').map(s => s.trim()) : ['Closed', 'Closed'];

      const newHours = {
        monday: { open: wOpen || '10:00 AM', close: wClose || '07:00 PM' },
        tuesday: { open: wOpen || '10:00 AM', close: wClose || '07:00 PM' },
        wednesday: { open: wOpen || '10:00 AM', close: wClose || '07:00 PM' },
        thursday: { open: wOpen || '10:00 AM', close: wClose || '07:00 PM' },
        friday: { open: wOpen || '10:00 AM', close: wClose || '07:00 PM' },
        saturday: { open: sOpen || '10:00 AM', close: sClose || '06:30 PM' },
        sunday: { open: sunOpen || 'Closed', close: sunClose || 'Closed', isClosed: isSunClosed },
      };

      await updateOperatingHours(newHours);
      setIsEditHoursModalOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update hours');
    } finally {
      setSavingHours(false);
    }
  };

  // Add Doctor
  const handleSaveDoctor = async () => {
    if (!docName.trim()) {
      setAddDoctorError('Please enter doctor name');
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
        experienceYears: parseInt(docExpYears) || 0,
      });
      setIsAddDoctorModalOpen(false);
      setDocName('');
      setDocSpecialization('');
      setDocQualification('');
      setDocExpYears('');
    } catch (e: any) {
      setAddDoctorError(e?.message || 'Failed to add doctor');
    } finally {
      setSavingDoctor(false);
    }
  };

  // Open Edit Doctor Modal
  const handleOpenEditDoctor = (doc: any) => {
    setEditingDoctorId(doc.id);
    setEditDocName(doc.name);
    setEditDocSpecialization(doc.specialization || '');
    setEditDocQualification(doc.qualification || '');
    setEditDocExpYears(doc.experienceYears ? String(doc.experienceYears) : '');
    setIsEditDoctorModalOpen(true);
  };

  const handleSaveEditDoctor = async () => {
    if (!editingDoctorId || !editDocName.trim()) {
      Alert.alert('Required', 'Please enter doctor name');
      return;
    }
    setSavingEditDoctor(true);
    try {
      await updateDoctor(editingDoctorId, {
        name: editDocName.trim(),
        specialization: editDocSpecialization.trim() || 'Dermatology & Aesthetic Specialist',
        qualification: editDocQualification.trim() || 'MBBS, MD',
        experienceYears: parseInt(editDocExpYears, 10) || 5,
      });
      setIsEditDoctorModalOpen(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update doctor details');
    } finally {
      setSavingEditDoctor(false);
    }
  };

  // Remove Doctor
  const handleRemoveDoctor = (docId: string, doctorName: string) => {
    setDeleteConfirmDoc({ id: docId, name: doctorName });
  };

  const handleConfirmRemoveDoctor = async () => {
    if (deleteConfirmDoc) {
      const docId = deleteConfirmDoc.id;
      setDeleteConfirmDoc(null);
      await removeDoctor(docId);
    }
  };

  const getDayRows = () => {
    const hours = activeClinic.openingHours;
    if (!hours || !hours.monday || !hours.monday.open) {
      return [
        { day: 'Monday – Friday', hours: 'Not configured yet' },
        { day: 'Saturday', hours: 'Not configured yet' },
        { day: 'Sunday', hours: 'Not configured yet' },
      ];
    }

    return [
      {
        day: 'Monday – Friday',
        hours: `${hours.monday.open} – ${hours.monday.close}`,
      },
      {
        day: 'Saturday',
        hours: hours.saturday?.open ? `${hours.saturday.open} – ${hours.saturday.close}` : 'Not configured yet',
      },
      {
        day: 'Sunday',
        hours: hours.sunday?.isClosed ? 'Closed' : (hours.sunday?.open ? `${hours.sunday.open} – ${hours.sunday.close}` : 'Closed'),
      },
    ];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Clinic Profile & Settings</Text>
          <Text style={styles.headerSubtitle}>{activeClinic.name || 'Manage Your Clinic'}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLogout}
          style={styles.headerLogoutBtn}
        >
          <LogOut size={15} color="#D32F2F" />
          <Text style={styles.headerLogoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Marketplace Discovery Toggle Card */}
        <View
          style={[
            styles.publishCard,
            isClinicPublished ? styles.publishCardActive : styles.publishCardInactive,
            shadows.card,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTogglePublish(!isClinicPublished)}
            style={styles.publishHeaderRow}
          >
            <View style={styles.publishLeftCol}>
              <View style={styles.publishTitleRow}>
                <View
                  style={[
                    styles.statusDot,
                    isClinicPublished ? styles.statusDotLive : styles.statusDotOff,
                  ]}
                />
                <Text style={styles.publishTitle}>Show on Customer App</Text>
                <View
                  style={[
                    styles.publishStatusPill,
                    isClinicPublished ? styles.pillLive : styles.pillOff,
                  ]}
                >
                  <Text
                    style={[
                      styles.publishStatusText,
                      isClinicPublished ? styles.textLive : styles.textOff,
                    ]}
                  >
                    {isClinicPublished ? 'LIVE' : 'OFF (DRAFT)'}
                  </Text>
                </View>
              </View>
              <Text style={styles.publishSubtitle}>
                {isClinicPublished
                  ? 'Your clinic is discoverable to customers across Chandigarh.'
                  : 'Your clinic is hidden from customer marketplace.'}
              </Text>
            </View>

            <View
              style={[
                styles.customSwitchTrack,
                isClinicPublished ? styles.switchTrackOn : styles.switchTrackOff,
              ]}
            >
              <View
                style={[
                  styles.customSwitchThumb,
                  isClinicPublished ? styles.switchThumbOn : styles.switchThumbOff,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Verification Note */}
          <View
            style={[
              styles.publishNoteBox,
              isClinicPublished ? styles.publishNoteBoxLive : styles.publishNoteBoxWarn,
            ]}
          >
            <AlertTriangle
              size={15}
              color={isClinicPublished ? '#2E7D32' : '#D97706'}
              style={styles.publishNoteIcon}
            />
            <Text
              style={[
                styles.publishNoteText,
                isClinicPublished ? styles.publishNoteTextLive : styles.publishNoteTextWarn,
              ]}
            >
              {isClinicPublished
                ? 'Your clinic profile, doctors, and procedure pricing are live on the customer marketplace.'
                : 'Please configure your Clinic Profile, Operating Hours, Doctors, and Procedure Pricing before making your clinic discoverable to customers.'}
            </Text>
          </View>
        </View>

        {/* 1. User Profile Section */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.cardHeader}>
              <User size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>User Profile</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleOpenEditUser}
              style={styles.editBtn}
            >
              <Pencil size={13} color={colors.primaryDark} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfoBox}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {doctorUser?.name ? doctorUser.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>{doctorUser?.name || 'Clinic User'}</Text>
              <Text style={styles.profileEmail}>{doctorUser?.email || 'user@clinic.app'}</Text>
              {doctorUser?.phone ? (
                <Text style={styles.profilePhone}>{doctorUser.phone}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* 2. Clinic Profile Section */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.cardHeader}>
              <Building2 size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Clinic Profile</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleOpenEditClinic}
              style={styles.editBtn}
            >
              <Pencil size={13} color={colors.primaryDark} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {activeClinic.name ? (
            <>
              <Text style={styles.clinicName}>{activeClinic.name}</Text>
              {activeClinic.description ? (
                <Text style={styles.clinicDesc}>{activeClinic.description}</Text>
              ) : (
                <Text style={styles.placeholderDesc}>No description added yet.</Text>
              )}

              <View style={styles.detailRow}>
                <MapPin size={15} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {activeClinic.address || 'Address not set'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Phone size={15} color={colors.textSecondary} />
                <Text style={styles.detailText}>{activeClinic.phone || 'Phone not set'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Mail size={15} color={colors.textSecondary} />
                <Text style={styles.detailText}>{activeClinic.email || 'Email not set'}</Text>
              </View>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenEditClinic}
              style={styles.emptyPromptBox}
            >
              <Text style={styles.emptyPromptTitle}>Clinic Details Not Configured</Text>
              <Text style={styles.emptyPromptSub}>Tap Edit to add your clinic name, address, contact and bio.</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. Operating Hours */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.cardHeader}>
              <Clock size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Operating Hours</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleOpenEditHours}
              style={styles.editBtn}
            >
              <Pencil size={13} color={colors.primaryDark} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {getDayRows().map((d, idx) => (
            <View key={idx} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{d.day}</Text>
              <Text style={[styles.dayHours, d.hours === 'Closed' && styles.closedText]}>
                {d.hours}
              </Text>
            </View>
          ))}
        </View>

        {/* 4. Clinic Doctors Section */}
        <View style={[styles.sectionCard, shadows.subtle]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.cardHeader}>
              <User size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>Clinic Doctors ({clinicDoctors.length})</Text>
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

          <Text style={styles.doctorSubtext}>
            Doctors listed here are available for customer booking and schedule assignment.
          </Text>

          {clinicDoctors.length === 0 ? (
            <View style={styles.emptyDoctorsBox}>
              <Text style={styles.emptyDoctorsText}>No doctors added yet.</Text>
              <Text style={styles.emptyDoctorsSub}>Tap '+ Add Doctor' to add practitioners to your clinic.</Text>
            </View>
          ) : (
            <View style={styles.docCardsList}>
              {clinicDoctors.map((doc) => (
                <View key={doc.id} style={styles.doctorItemCard}>
                  <View style={styles.docAvatar}>
                    <Text style={styles.docAvatarInitial}>
                      {doc.name.charAt(0).toUpperCase() || 'D'}
                    </Text>
                  </View>
                  <View style={styles.docTextCol}>
                    <View style={styles.docNameRow}>
                      <Text style={styles.docNameTitle}>{doc.name}</Text>
                      <View style={styles.docActionRow}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => toggleDoctorActive(doc.id)}
                          style={[
                            styles.activeTogglePill,
                            doc.isActive ? styles.pillActive : styles.pillInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.activeToggleText,
                              doc.isActive ? styles.textActive : styles.textInactive,
                            ]}
                          >
                            {doc.isActive ? 'Active' : 'On Leave'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleOpenEditDoctor(doc)}
                          style={styles.editDocBtn}
                        >
                          <Pencil size={15} color={colors.primaryDark} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleRemoveDoctor(doc.id, doc.name)}
                          style={styles.removeDocBtn}
                        >
                          <Trash2 size={15} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.docSpecText}>{doc.specialization}</Text>
                    <Text style={styles.docQualText}>
                      {doc.qualification}
                      {doc.experienceYears ? ` • ${doc.experienceYears} yrs exp` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── MODAL 1: Edit User Profile ── */}
      <Modal
        visible={isEditUserModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditUserModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit User Profile</Text>
                <Text style={styles.modalSubtitle}>Update your contact and account details</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditUserModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Your Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Dr. Purva Pande / Clinic Manager"
                  placeholderTextColor={colors.textMuted}
                  value={userName}
                  onChangeText={setUserName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. contact@clinic.com"
                  placeholderTextColor={colors.textMuted}
                  value={userEmail}
                  onChangeText={setUserEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone / WhatsApp</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. +91 94176 96148"
                  placeholderTextColor={colors.textMuted}
                  value={userPhone}
                  onChangeText={setUserPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveUser}
                disabled={savingUser}
                style={[styles.savePrimaryBtn, shadows.subtle]}
              >
                {savingUser ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Check size={18} color={colors.textInverse} />
                    <Text style={styles.savePrimaryBtnText}>Save User Profile</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── MODAL 2: Edit Clinic Profile ── */}
      <Modal
        visible={isEditClinicModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditClinicModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Clinic Profile</Text>
                <Text style={styles.modalSubtitle}>Details shown to customers on marketplace</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditClinicModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinic Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Skin & Laser Aesthetic Clinic"
                  placeholderTextColor={colors.textMuted}
                  value={clinicName}
                  onChangeText={setClinicName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>About Clinic / Bio</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Brief description of clinical expertise, specialized procedures, and equipment..."
                  placeholderTextColor={colors.textMuted}
                  value={clinicDescription}
                  onChangeText={setClinicDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinic Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. +91 94176 96148"
                  placeholderTextColor={colors.textMuted}
                  value={clinicPhone}
                  onChangeText={setClinicPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Clinic Email</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. info@skinclinic.com"
                  placeholderTextColor={colors.textMuted}
                  value={clinicEmail}
                  onChangeText={setClinicEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Address (Plot / Sector / Landmark)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Plot No. 1187, Sector 11, Panchkula"
                  placeholderTextColor={colors.textMuted}
                  value={clinicAddress}
                  onChangeText={setClinicAddress}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>City / Region</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Chandigarh / Panchkula"
                  placeholderTextColor={colors.textMuted}
                  value={clinicCity}
                  onChangeText={setClinicCity}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveClinic}
                disabled={savingClinic}
                style={[styles.savePrimaryBtn, shadows.subtle]}
              >
                {savingClinic ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Check size={18} color={colors.textInverse} />
                    <Text style={styles.savePrimaryBtnText}>Save Clinic Profile</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── MODAL 3: Edit Operating Hours ── */}
      <Modal
        visible={isEditHoursModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditHoursModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Operating Hours</Text>
                <Text style={styles.modalSubtitle}>Configure appointment availability</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditHoursModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Monday – Friday Hours</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 10:00 AM – 07:00 PM"
                  placeholderTextColor={colors.textMuted}
                  value={weekdayHours}
                  onChangeText={setWeekdayHours}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Saturday Hours</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 10:00 AM – 06:30 PM (or Closed)"
                  placeholderTextColor={colors.textMuted}
                  value={saturdayHours}
                  onChangeText={setSaturdayHours}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Sunday Hours</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Closed (or 11:00 AM – 04:00 PM)"
                  placeholderTextColor={colors.textMuted}
                  value={sundayHours}
                  onChangeText={setSundayHours}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveHours}
                disabled={savingHours}
                style={[styles.savePrimaryBtn, shadows.subtle]}
              >
                {savingHours ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Check size={18} color={colors.textInverse} />
                    <Text style={styles.savePrimaryBtnText}>Save Operating Hours</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── MODAL 4: Add Doctor (No Dr. prefix requirement) ── */}
      <Modal
        visible={isAddDoctorModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddDoctorModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Doctor</Text>
                <Text style={styles.modalSubtitle}>Added to clinic roster for patient bookings</Text>
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
                  placeholder="e.g. Sunita Kapoor"
                  placeholderTextColor={colors.textMuted}
                  value={docName}
                  onChangeText={setDocName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Specialization *</Text>
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

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveDoctor}
                disabled={savingDoctor}
                style={[styles.savePrimaryBtn, shadows.subtle]}
              >
                {savingDoctor ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Plus size={18} color={colors.textInverse} />
                    <Text style={styles.savePrimaryBtnText}>Add Doctor</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* ── MODAL 5: Edit Doctor Details ── */}
      <Modal
        visible={isEditDoctorModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditDoctorModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, shadows.card]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Doctor Details</Text>
                <Text style={styles.modalSubtitle}>Update practitioner info and qualifications</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditDoctorModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Doctor Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Purva Pande"
                  placeholderTextColor={colors.textMuted}
                  value={editDocName}
                  onChangeText={setEditDocName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Specialization *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Aesthetic Cosmetologist & Trichologist"
                  placeholderTextColor={colors.textMuted}
                  value={editDocSpecialization}
                  onChangeText={setEditDocSpecialization}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Qualifications</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. MBBS, MD (Dermatology)"
                  placeholderTextColor={colors.textMuted}
                  value={editDocQualification}
                  onChangeText={setEditDocQualification}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Years of Experience</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 7"
                  placeholderTextColor={colors.textMuted}
                  value={editDocExpYears}
                  onChangeText={setEditDocExpYears}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveEditDoctor}
                disabled={savingEditDoctor}
                style={[styles.savePrimaryBtn, shadows.subtle]}
              >
                {savingEditDoctor ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <Check size={18} color={colors.textInverse} />
                    <Text style={styles.savePrimaryBtnText}>Save Doctor Details</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* ── MODAL 6: In-App Sign Out Confirmation ── */}
      <Modal
        visible={isLogoutModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalOpen(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={[styles.confirmModalCard, shadows.card]}>
            <View style={styles.confirmIconBadge}>
              <LogOut size={26} color="#DC2626" />
            </View>
            <Text style={styles.confirmModalTitle}>Sign Out of Clinic Portal</Text>
            <Text style={styles.confirmModalSubtitle}>
              Are you sure you want to sign out from the clinic management dashboard?
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsLogoutModalOpen(false)}
                style={styles.confirmCancelBtn}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirmLogout}
                style={styles.confirmDangerBtn}
              >
                <Text style={styles.confirmDangerText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 7: In-App Publish / Offline Confirmation ── */}
      <Modal
        visible={isPublishModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPublishModalOpen(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={[styles.confirmModalCard, shadows.card]}>
            <View
              style={[
                styles.confirmIconBadge,
                pendingPublishVal ? styles.badgeSuccess : styles.badgeWarn,
              ]}
            >
              <Building2
                size={26}
                color={pendingPublishVal ? '#15803D' : '#D97706'}
              />
            </View>
            <Text style={styles.confirmModalTitle}>
              {pendingPublishVal ? 'Publish Clinic to Customer App?' : 'Take Clinic Offline?'}
            </Text>
            <Text style={styles.confirmModalSubtitle}>
              {pendingPublishVal
                ? 'Your clinic profile, doctors, and procedure pricing will become immediately live and discoverable for customer bookings.'
                : 'Your clinic will be hidden from customer search, directory, and procedure listings. Existing appointments will remain unaffected.'}
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsPublishModalOpen(false)}
                style={styles.confirmCancelBtn}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirmPublish}
                style={[
                  styles.confirmDangerBtn,
                  pendingPublishVal && styles.confirmSuccessBtn,
                ]}
              >
                <Text style={styles.confirmDangerText}>
                  {pendingPublishVal ? 'Publish & Make Live' : 'Take Offline'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 8: In-App Remove Doctor Confirmation ── */}
      <Modal
        visible={!!deleteConfirmDoc}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmDoc(null)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={[styles.confirmModalCard, shadows.card]}>
            <View style={styles.confirmIconBadge}>
              <Trash2 size={26} color="#DC2626" />
            </View>
            <Text style={styles.confirmModalTitle}>Remove Doctor</Text>
            <Text style={styles.confirmModalSubtitle}>
              Are you sure you want to remove{' '}
              <Text style={{ fontWeight: 'bold' }}>{deleteConfirmDoc?.name}</Text> from your clinic
              roster?
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDeleteConfirmDoc(null)}
                style={styles.confirmCancelBtn}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirmRemoveDoctor}
                style={styles.confirmDangerBtn}
              >
                <Text style={styles.confirmDangerText}>Remove Doctor</Text>
              </TouchableOpacity>
            </View>
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

  // Publish Toggle Card
  publishCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1.5,
  },
  publishCardActive: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  publishCardInactive: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  publishHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    cursor: 'pointer' as any,
  },
  customSwitchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#16A34A',
  },
  switchTrackOff: {
    backgroundColor: '#D1D5DB',
  },
  customSwitchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...shadows.subtle,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  publishLeftCol: {
    flex: 1,
  },
  publishTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotLive: {
    backgroundColor: '#16A34A',
  },
  statusDotOff: {
    backgroundColor: '#9CA3AF',
  },
  publishTitle: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  publishStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  pillLive: {
    backgroundColor: '#DCFCE7',
  },
  pillOff: {
    backgroundColor: '#F3F4F6',
  },
  publishStatusText: {
    fontSize: 9,
    fontWeight: typography.fontWeights.heavy,
    letterSpacing: 0.5,
  },
  textLive: {
    color: '#15803D',
  },
  textOff: {
    color: colors.textMuted,
  },
  publishSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  publishNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: borderRadius.md,
    marginTop: 12,
    borderWidth: 1,
  },
  publishNoteBoxLive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  publishNoteBoxWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  publishNoteIcon: {
    marginTop: 1,
  },
  publishNoteText: {
    flex: 1,
    fontSize: typography.fontSizes.micro + 0.5,
    lineHeight: 16,
  },
  publishNoteTextLive: {
    color: '#14532D',
  },
  publishNoteTextWarn: {
    color: '#92400E',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF6EE',
    borderWidth: 1,
    borderColor: '#E8D29F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  editBtnText: {
    fontSize: typography.fontSizes.caption - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },

  // User Profile
  profileInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: typography.fontWeights.heavy,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  profileEmail: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.primaryDark,
    marginTop: 2,
  },

  // Clinic Profile
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
  placeholderDesc: {
    fontSize: typography.fontSizes.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
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
  emptyPromptBox: {
    padding: 16,
    borderRadius: borderRadius.md,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E8D29F',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyPromptTitle: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  emptyPromptSub: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    textAlign: 'center',
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

  // Doctors
  doctorSubtext: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginBottom: 12,
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
  emptyDoctorsBox: {
    padding: 16,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyDoctorsText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  emptyDoctorsSub: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
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
  docActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  removeDocBtn: {
    padding: 4,
    borderRadius: borderRadius.xs,
  },
  editDocBtn: {
    padding: 4,
    borderRadius: borderRadius.xs,
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
    maxHeight: '90%',
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
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  savePrimaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savePrimaryBtnText: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.textInverse,
  },

  // Confirmation Modals (Web & Mobile Reliable)
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 24,
    alignItems: 'center',
  },
  confirmIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgeWarn: {
    backgroundColor: '#FEF3C7',
  },
  confirmModalTitle: {
    fontSize: typography.fontSizes.h3 - 2,
    fontWeight: typography.fontWeights.heavy,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmModalSubtitle: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  confirmDangerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.pill,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSuccessBtn: {
    backgroundColor: colors.primary,
  },
  confirmDangerText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: '#FFFFFF',
  },
});
