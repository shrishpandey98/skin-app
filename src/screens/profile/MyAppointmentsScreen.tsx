import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Calendar, RefreshCw } from 'lucide-react-native';
import { BookingCard } from '../../components/cards/BookingCard';
import { EmptyState } from '../../components/states/EmptyState';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { Appointment } from '../../types/appointment.types';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const MyAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>(
    route.params?.initialTab || 'upcoming'
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    getUpcomingAppointments,
    getPastAppointments,
    getCancelledAppointments,
    cancelAppointment,
    rescheduleAppointment,
    initializeAppointments,
  } = useAppointmentsStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeAppointments();
    setRefreshing(false);
  };

  const appointments =
    activeTab === 'upcoming'
      ? getUpcomingAppointments()
      : activeTab === 'past'
      ? getPastAppointments()
      : getCancelledAppointments();

  const handleCardPress = (apt: Appointment) => {
    navigation.navigate('AppointmentDetail', { appointmentId: apt.id });
  };

  const handleCancelPress = (apt: Appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${apt.clinic?.name || 'the clinic'} on ${apt.appointmentDate}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelAppointment(apt.id),
        },
      ]
    );
  };

  const handleReschedulePress = (apt: Appointment) => {
    Alert.alert(
      'Reschedule Appointment',
      'Select a new slot for your in-clinic consultation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change Slot',
          onPress: () => {
            // Re-open booking date/time selector
            navigation.navigate('BookingFlow', {
              screen: 'SelectDateTime',
              params: {
                clinicSlug: apt.clinic?.slug || apt.clinicId,
                doctorSlug: apt.doctor?.slug || apt.doctorId,
                procedureSlug: apt.procedure?.slug || apt.procedureId,
              },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRefresh}
          disabled={refreshing}
          style={styles.refreshBtn}
        >
          <RefreshCw size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('upcoming')}
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
        >
          <Text
            style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('past')}
          style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
        >
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}
          >
            Past
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('cancelled')}
          style={[styles.tabBtn, activeTab === 'cancelled' && styles.tabBtnActive]}
        >
          <Text
            style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}
          >
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <BookingCard
            appointment={item}
            onPress={() => handleCardPress(item)}
            onCancel={activeTab === 'upcoming' ? () => handleCancelPress(item) : undefined}
            onReschedule={activeTab === 'upcoming' ? () => handleReschedulePress(item) : undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Calendar size={32} color={colors.primary} />}
            title={
              activeTab === 'upcoming'
                ? 'No upcoming appointments'
                : activeTab === 'past'
                ? 'No past appointments'
                : 'No cancelled appointments'
            }
            description={
              activeTab === 'upcoming'
                ? 'You have no scheduled appointments. Explore clinics to book your consultation.'
                : 'Your appointment history will appear here.'
            }
            actionText="Explore Clinics"
            onActionPress={() => navigation.navigate('MainTabs', { screen: 'ClinicsTab' })}
          />
        }
      />
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
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 6,
    marginHorizontal: 18,
    marginVertical: 14,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.pill,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textInverse,
    fontWeight: typography.fontWeights.bold,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
});
