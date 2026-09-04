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
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock3,
  ArrowRight,
  MessageSquare,
  Phone,
  X,
} from 'lucide-react-native';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { useDoctorStore } from '../../stores/doctor.store';
import { Appointment, AppointmentStatus } from '../../types/appointment.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const DoctorAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { appointments } = useAppointmentsStore();
  const { activeClinic, updateAppointmentStatus, initializeDoctorPortal, loading } = useDoctorStore();

  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    const matchesTab = activeTab === 'all' || apt.status === activeTab;
    const matchesQuery =
      (apt.patientName && apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (apt.patientPhone && apt.patientPhone.includes(searchQuery)) ||
      (apt.procedure?.name && apt.procedure.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesQuery;
  });

  const handleOpenDetail = (apt: Appointment) => {
    navigation.navigate('DoctorAppointmentDetail', { appointment: apt });
  };

  const handleQuickConfirm = async (aptId: string, apt: Appointment) => {
    await updateAppointmentStatus(aptId, 'confirmed');
    if (apt.patientPhone) {
      openWhatsAppChat(
        apt.patientPhone,
        `Hello ${apt.patientName}, your appointment for ${apt.procedure?.name || 'Consultation'} on ${apt.appointmentDate} at ${apt.appointmentTime} is CONFIRMED at ${activeClinic.name}.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments Queue</Text>
        <Text style={styles.headerSubtitle}>
          {appointments.length} Total Bookings • {activeClinic.name}
        </Text>
      </View>

      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBox, shadows.subtle]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by patient name, phone, or treatment..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {filterTabs.map((tab) => {
              const count =
                tab.id === 'all'
                  ? appointments.length
                  : appointments.filter((a) => a.status === tab.id).length;

              return (
                <TouchableOpacity
                  key={tab.id}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.tabPill,
                    activeTab === tab.id && styles.tabPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabPillText,
                      activeTab === tab.id && styles.tabPillTextActive,
                    ]}
                  >
                    {tab.label} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={initializeDoctorPortal} />
          }
        >
          {filteredAppointments.length === 0 ? (
            <View style={[styles.emptyBox, shadows.subtle]}>
              <Calendar size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Appointments Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No results match your search query.'
                  : `No appointments under the "${activeTab}" filter.`}
              </Text>
            </View>
          ) : (
            <View style={styles.appointmentList}>
              {filteredAppointments.map((apt) => {
                const isPending = apt.status === 'pending';
                const isConfirmed = apt.status === 'confirmed';
                const isCompleted = apt.status === 'completed';
                const isCancelled = apt.status === 'cancelled';

                return (
                  <TouchableOpacity
                    key={apt.id}
                    activeOpacity={0.88}
                    onPress={() => handleOpenDetail(apt)}
                    style={[styles.card, shadows.subtle]}
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.dateTag}>
                        <Calendar size={13} color={colors.primaryDark} />
                        <Text style={styles.dateText}>
                          {apt.appointmentDate} at {apt.appointmentTime}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          isPending && styles.statusBadgePending,
                          isConfirmed && styles.statusBadgeConfirmed,
                          isCompleted && styles.statusBadgeCompleted,
                          isCancelled && styles.statusBadgeCancelled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isPending && styles.statusBadgeTextPending,
                            isConfirmed && styles.statusBadgeTextConfirmed,
                            isCompleted && styles.statusBadgeTextCompleted,
                            isCancelled && styles.statusBadgeTextCancelled,
                          ]}
                        >
                          {apt.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.patientName}>{apt.patientName}</Text>
                    <Text style={styles.patientPhone}>{apt.patientPhone}</Text>
                    <Text style={styles.procedureName}>
                      {apt.procedure?.name || 'General Consultation'}
                    </Text>

                    {apt.notes ? (
                      <Text style={styles.notesText} numberOfLines={2}>
                        "{apt.notes}"
                      </Text>
                    ) : null}

                    {/* Action Bar */}
                    <View style={styles.cardActions}>
                      {apt.patientPhone && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() =>
                            openWhatsAppChat(
                              apt.patientPhone!,
                              `Hello ${apt.patientName}, checking in regarding your visit at ${activeClinic.name}.`
                            )
                          }
                          style={styles.chatBtn}
                        >
                          <MessageSquare size={14} color="#25D366" />
                          <Text style={styles.chatBtnText}>Chat</Text>
                        </TouchableOpacity>
                      )}

                      {isPending && (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => handleQuickConfirm(apt.id, apt)}
                          style={styles.confirmBtn}
                        >
                          <CheckCircle2 size={14} color="#FFFFFF" />
                          <Text style={styles.confirmBtnText}>Confirm</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenDetail(apt)}
                        style={styles.openBtn}
                      >
                        <Text style={styles.openBtnText}>Manage</Text>
                        <ArrowRight size={13} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.body - 1,
    color: colors.text,
    padding: 0,
  },
  tabsWrapper: {
    paddingBottom: 10,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
  },
  tabPillText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  tabPillTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  appointmentList: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  dateText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: colors.primaryDark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  statusBadgePending: {
    backgroundColor: '#FFF4E5',
  },
  statusBadgeConfirmed: {
    backgroundColor: '#EAF7EE',
  },
  statusBadgeCompleted: {
    backgroundColor: '#EEF2FF',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FDF2F2',
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
  },
  statusBadgeTextPending: {
    color: '#B26A00',
  },
  statusBadgeTextConfirmed: {
    color: '#2D8A4E',
  },
  statusBadgeTextCompleted: {
    color: '#4F46E5',
  },
  statusBadgeTextCancelled: {
    color: '#D32F2F',
  },
  patientName: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  patientPhone: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  procedureName: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: 6,
  },
  notesText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.text,
    fontStyle: 'italic',
    backgroundColor: colors.surfaceSubtle,
    padding: 8,
    borderRadius: borderRadius.sm,
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 10,
    gap: 10,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  chatBtnText: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
    color: '#1E7E34',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D8A4E',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.bold,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  openBtnText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
