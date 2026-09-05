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
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  ArrowRight,
  UserCheck,
  Clock,
  X,
} from 'lucide-react-native';
import { useDoctorStore } from '../../stores/doctor.store';
import { PatientSummary } from '../../services/doctor.service';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const DoctorPatientsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { patients, activeClinic, initializeDoctorPortal, loading } = useDoctorStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeDoctorPortal();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient Directory (CRM)</Text>
        <Text style={styles.headerSubtitle}>
          {patients.length} Total Registered Patients • {activeClinic.name}
        </Text>
      </View>

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchBox, shadows.subtle]}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, phone or email..."
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

        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={initializeDoctorPortal} />
          }
        >
          {filteredPatients.length === 0 ? (
            <View style={[styles.emptyBox, shadows.subtle]}>
              <Users size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Patients Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No patient matches your search.'
                  : 'Patients who book appointments will be indexed here automatically.'}
              </Text>
            </View>
          ) : (
            <View style={styles.patientList}>
              {filteredPatients.map((patient) => (
                <View key={patient.id} style={[styles.patientCard, shadows.subtle]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {patient.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.headerTextCol}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientContact}>{patient.phone}</Text>
                    </View>
                    <View style={styles.visitsBadge}>
                      <Text style={styles.visitsBadgeText}>
                        {patient.totalVisits} {patient.totalVisits === 1 ? 'Visit' : 'Visits'}
                      </Text>
                    </View>
                  </View>

                  {/* Procedure History Summary */}
                  <View style={styles.historyRow}>
                    <Calendar size={13} color={colors.textSecondary} />
                    <Text style={styles.historyText}>
                      Last Visit: {patient.lastVisitDate || 'Recent'} •{' '}
                      <Text style={styles.historyProcedure}>
                        {patient.lastProcedureName || 'Consultation'}
                      </Text>
                    </Text>
                  </View>

                  {/* Direct Contact Actions */}
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        openWhatsAppChat(
                          patient.phone,
                          `Hello ${patient.name}, ${activeClinic.name || 'our clinic'} reaching out to check on your post-procedure care.`
                        )
                      }
                      style={styles.actionBtn}
                    >
                      <MessageSquare size={14} color="#25D366" />
                      <Text style={styles.actionBtnText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
    paddingVertical: 12,
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
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  patientList: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.heavy,
    color: colors.primaryDark,
  },
  headerTextCol: {
    flex: 1,
  },
  patientName: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  patientContact: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  visitsBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  visitsBadgeText: {
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: 8,
    borderRadius: borderRadius.sm,
    gap: 6,
    marginBottom: 10,
  },
  historyText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
  },
  historyProcedure: {
    fontWeight: typography.fontWeights.semibold,
    color: colors.primaryDark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F9EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  actionBtnText: {
    fontSize: typography.fontSizes.micro + 1,
    fontWeight: typography.fontWeights.bold,
    color: '#1E7E34',
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
