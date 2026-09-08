import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import {
  X,
  Calendar,
  Bookmark,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/auth.store';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated, isGuest, logout } = useAuthStore();
  const { getUpcomingAppointments } = useAppointmentsStore();

  const upcomingCount = getUpcomingAppointments().length;

  const handleLogout = async () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      await logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
  };

  const handleLoginPress = async () => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      await logout();
    } catch (e) {
      console.warn('Login navigation error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card (Authenticated vs Guest) */}
        {isAuthenticated && user ? (
          <View style={[styles.userCard, shadows.card]}>
            <Image
              source={{
                uri:
                  user.profileImageUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.userTextCol}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              <Text style={styles.userCity}>{user.city || 'Chandigarh'}, India</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.guestCard, shadows.card]}>
            <View style={styles.guestAvatarCircle}>
              <User size={28} color={colors.primary} />
            </View>
            <View style={styles.guestTextCol}>
              <Text style={styles.guestTitle}>Guest User</Text>
              <Text style={styles.guestSubtitle}>Sign in to save clinics & track bookings</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLoginPress}
              style={styles.guestLoginBtn}
            >
              <Text style={styles.guestLoginBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section 1: Appointments & Saves */}
        <View style={styles.menuGroup}>
          {/* My Appointments */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MyAppointments')}
            style={styles.menuItem}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
              <Calendar size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>My Appointments</Text>
              <Text style={styles.menuSubtitle}>Upcoming, past & cancelled</Text>
            </View>
            {upcomingCount > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{upcomingCount} Active</Text>
              </View>
            ) : null}
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Saved Items */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SavedItems')}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.secondaryLight }]}>
              <Bookmark size={18} color={colors.secondary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Saved Clinics & Treatments</Text>
              <Text style={styles.menuSubtitle}>Bookmarked procedures & centers</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 2: Account Settings */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalDetails')}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
          >
            <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
              <User size={18} color={colors.text} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Personal Details</Text>
              <Text style={styles.menuSubtitle}>Name, mobile, email, city</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout / Switch Account */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            shadows.subtle,
            !isAuthenticated && { backgroundColor: '#F4EFE6', borderColor: '#E5DDCB' },
          ]}
        >
          <LogOut size={16} color={isAuthenticated ? '#DC3545' : colors.primary} />
          <Text style={[styles.logoutText, !isAuthenticated && { color: colors.primaryDark }]}>
            {isAuthenticated ? 'Sign Out' : 'Sign In with Registered Account'}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Aura Aesthetics Marketplace v1.0.0 (Chandigarh Edition)</Text>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    padding: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#DEC481',
    marginBottom: 20,
  },
  guestAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guestTextCol: {
    flex: 1,
  },
  guestTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  guestSubtitle: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guestLoginBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
  },
  guestLoginBtnText: {
    color: colors.textInverse,
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceSubtle,
    marginRight: 16,
  },
  userTextCol: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSizes.h3,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  userPhone: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userCity: {
    fontSize: typography.fontSizes.caption,
    color: colors.primaryDark,
    fontWeight: typography.fontWeights.semibold,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  menuSubtitle: {
    fontSize: typography.fontSizes.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  countBadge: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    marginRight: 8,
  },
  countBadgeText: {
    fontSize: typography.fontSizes.micro,
    color: '#226D3C',
    fontWeight: typography.fontWeights.bold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginTop: 6,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: typography.fontSizes.body - 1,
    fontWeight: typography.fontWeights.bold,
    color: '#DC3545',
  },
  versionText: {
    fontSize: typography.fontSizes.caption - 1,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
