import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MapPin, ChevronDown, Bell, User, Sparkles, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useLocationStore } from '../../stores/location.store';
import { useAppointmentsStore } from '../../stores/appointments.store';
import { proceduresService } from '../../services/procedures.service';
import { useDoctorStore } from '../../stores/doctor.store';

interface TopBarProps {
  showLocation?: boolean;
  title?: string;
  onRefresh?: () => Promise<void> | void;
}

export const TopBar: React.FC<TopBarProps> = ({ showLocation = true, title, onRefresh }) => {
  const navigation = useNavigation<any>();
  const { selectedCity } = useLocationStore();
  const { initializeAppointments } = useAppointmentsStore();
  const { initializeDoctorPortal } = useDoctorStore();

  const [refreshing, setRefreshing] = useState(false);
  const spinValue = React.useRef(new Animated.Value(0)).current;

  const handleManualRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);

    Animated.timing(spinValue, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start(() => spinValue.setValue(0));

    try {
      await Promise.allSettled([
        proceduresService.refreshLiveProcedures(),
        initializeAppointments(),
        initializeDoctorPortal(),
        onRefresh ? onRefresh() : Promise.resolve(),
      ]);
    } catch (e) {
      console.warn('Manual refresh error:', e);
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleHomePress = () => {
    navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  const handleLocationPress = () => {
    navigation.navigate('CitySelectorModal');
  };

  const handleNotificationsPress = () => {
    navigation.navigate('NotificationsModal');
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfileFlow');
  };

  return (
    <View style={styles.container}>
      {/* Brand Logo & Location */}
      <View style={styles.leftSection}>
        {/* Clickable Brand Logo Button that always navigates Home */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleHomePress}
          style={styles.logoBtn}
        >
          <View style={styles.logoIconCircle}>
            <Sparkles size={16} color={colors.primary} />
          </View>
          <Text style={styles.logoBrandText}>AURA</Text>
        </TouchableOpacity>

        <View style={styles.brandDivider} />

        {/* Location Dropdown */}
        {showLocation ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLocationPress}
            style={styles.locationButton}
          >
            <MapPin size={13} color={colors.primary} />
            <Text style={styles.cityName} numberOfLines={1}>
              {selectedCity}
            </Text>
            <ChevronDown size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.screenTitle}>{title}</Text>
        )}
      </View>

      {/* Right Action Icons (Refresh, Notifications & Profile) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleManualRefresh}
          disabled={refreshing}
          style={[styles.iconButton, shadows.subtle]}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <RefreshCw size={16} color={refreshing ? colors.primary : colors.text} />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleNotificationsPress}
          style={[styles.iconButton, shadows.subtle]}
        >
          <Bell size={18} color={colors.text} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleProfilePress}
          style={[styles.iconButton, styles.profileBtn, shadows.subtle]}
        >
          <User size={18} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 8,
  },
  logoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBrandText: {
    fontSize: typography.fontSizes.bodyLarge - 1,
    fontWeight: typography.fontWeights.heavy,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  brandDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    maxWidth: 160,
  },
  cityName: {
    fontSize: typography.fontSizes.caption,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  screenTitle: {
    fontSize: typography.fontSizes.bodyLarge,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileBtn: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.surface,
  },
});
