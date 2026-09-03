import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { X, Bell, CheckCircle2, Calendar, Sparkles } from 'lucide-react-native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'booking',
    title: 'Consultation Confirmed',
    body: 'Your in-clinic booking with Dr. Ananya Sharma at Aesthetica Skin Clinic is confirmed for Sep 12, 03:30 PM.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 'notif_2',
    type: 'reminder',
    title: 'Treatment Reminder',
    body: 'Drink plenty of water before your Hydrafacial session for optimal results.',
    time: '1 day ago',
    isRead: true,
  },
  {
    id: 'notif_3',
    type: 'system',
    title: 'Welcome to Aura Aesthetics',
    body: 'Discover Chandigarh’s top verified aesthetic dermatologists and transparent procedure pricing.',
    time: '3 days ago',
    isRead: true,
  },
];

export const NotificationsModalScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.list}>
          {MOCK_NOTIFICATIONS.map((item) => (
            <View
              key={item.id}
              style={[
                styles.notifCard,
                !item.isRead ? styles.unreadCard : styles.readCard,
                shadows.subtle,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor:
                      item.type === 'booking'
                        ? '#EAF7EE'
                        : item.type === 'reminder'
                        ? colors.primaryLight
                        : colors.secondaryLight,
                  },
                ]}
              >
                {item.type === 'booking' ? (
                  <CheckCircle2 size={18} color="#2D8A4E" />
                ) : item.type === 'reminder' ? (
                  <Calendar size={18} color={colors.primaryDark} />
                ) : (
                  <Sparkles size={18} color={colors.secondary} />
                )}
              </View>

              <View style={styles.textCol}>
                <View style={styles.topRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!item.isRead ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.body}>{item.body}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
            </View>
          ))}
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
    padding: 18,
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: '#FFFDFD',
  },
  readCard: {
    borderColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  body: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
  },
});
