import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Text,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, borderRadius, typography, shadows } from '../../constants/theme';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  onPress?: () => void; // If read-only trigger for modal search
  isTouchableOnly?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChangeText,
  onClear,
  placeholder = 'Search procedures, clinics or concerns...',
  onPress,
  isTouchableOnly = false,
  autoFocus = false,
  style,
}) => {
  if (isTouchableOnly) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.container, styles.touchable, shadows.subtle, style]}
      >
        <Search size={18} color={colors.primary} />
        <Text style={styles.placeholderText} numberOfLines={1}>
          {placeholder}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, shadows.subtle, style]}>
      <Search size={18} color={colors.primary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onClear} style={styles.clearBtn}>
          <X size={15} color={colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  touchable: {
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.text,
    marginLeft: 10,
    padding: 0,
  },
  placeholderText: {
    flex: 1,
    fontSize: typography.fontSizes.body,
    color: colors.textMuted,
    marginLeft: 10,
  },
  clearBtn: {
    padding: 4,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.pill,
  },
});
