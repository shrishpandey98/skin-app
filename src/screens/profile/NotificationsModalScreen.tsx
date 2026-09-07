import React, { useEffect } from 'react';
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
import { X, Bell, CheckCircle2, Calendar, Sparkles, Trash2, CheckCheck } from 'lucide-react-native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useNotificationsStore } from '../../stores/notifications.store';
import { EmptyState } from '../../components/states/EmptyState';

export const NotificationsModalScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { notifications, loadNotifications, clearAllNotifications, markAllAsRead, isLoaded } =
    useNotificationsStore();

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={clearAllNotifications}
            style={styles.clearBtn}
          >
            <Trash2 size={16} color={colors.textSecondary} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyIconCircle}>
              <Bell size={28} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySubtitle}>
              You have no active notifications. Important consultation reminders and updates will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((item) => (
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
        )}
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.body - 1,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
