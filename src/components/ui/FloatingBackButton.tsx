import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { colors, borderRadius, shadows } from '../../constants/theme';

interface FloatingBackButtonProps {
  fallbackScreen?: string;
  onPress?: () => void;
  style?: ViewStyle;
  position?: 'top-left' | 'bottom-left' | 'bottom-right';
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  fallbackScreen = 'MainTabs',
  onPress,
  style,
  position = 'top-left',
}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (fallbackScreen) {
      navigation.navigate(fallbackScreen);
    }
  };

  const positionStyle =
    position === 'bottom-left'
      ? styles.bottomLeft
      : position === 'bottom-right'
      ? styles.bottomRight
      : styles.topLeft;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[styles.floatingBtn, positionStyle, shadows.card, style]}
    >
      <ArrowLeft size={20} color={colors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    zIndex: 999,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(222, 196, 129, 0.4)', // subtle champagne border
  },
  topLeft: {
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
  },
  bottomLeft: {
    bottom: 24,
    left: 20,
  },
  bottomRight: {
    bottom: 24,
    right: 20,
  },
});
