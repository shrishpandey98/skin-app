import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, ChevronDown, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';
import { useLocationStore } from '../../stores/location.store';
import { useAuthStore } from '../../stores/auth.store';

interface TopBarProps {
  showLocation?: boolean;
  title?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ showLocation = true, title }) => {
  const navigation = useNavigation<any>();
  const { selectedCity } = useLocationStore();
  const { isAuthenticated } = useAuthStore();

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
      {showLocation ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLocationPress}
          style={styles.locationButton}
        >
          <View style={styles.pinIconWrapper}>
            <MapPin size={14} color={colors.primary} />
          </View>
          <View style={styles.locationTextWrapper}>
            <Text style={styles.locationLabel}>Location</Text>
            <View style={styles.cityNameRow}>
              <Text style={styles.cityName}>{selectedCity}</Text>
              <ChevronDown size={14} color={colors.text} style={styles.chevron} />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <Text style={styles.screenTitle}>{title}</Text>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleNotificationsPress}
          style={[styles.iconButton, shadows.subtle]}
        >
          <Bell size={19} color={colors.text} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleProfilePress}
          style={[styles.iconButton, styles.profileBtn, shadows.subtle]}
        >
          <User size={19} color={colors.primaryDark} />
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
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationTextWrapper: {
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: typography.fontSizes.micro,
    color: colors.textMuted,
    fontWeight: typography.fontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityName: {
    fontSize: typography.fontSizes.body,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  chevron: {
    marginLeft: 4,
  },
  screenTitle: {
    fontSize: typography.fontSizes.h2,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
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
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
