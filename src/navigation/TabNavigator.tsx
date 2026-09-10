import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Sparkles, Stethoscope, Building2, Bot } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProceduresScreen } from '../screens/procedures/ProceduresScreen';
import { ClinicsScreen } from '../screens/clinics/ClinicsScreen';
import { IraChatScreen } from '../screens/chat/IraChatScreen';
import { MainTabParamList } from '../types/navigation.types';
import { colors, typography, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);
  const tabHeight = 56 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: tabHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          ...shadows.subtle,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
          lineHeight: 14,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Sparkles size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="ProceduresTab"
        component={ProceduresScreen}
        options={{
          tabBarLabel: 'Treatments',
          tabBarIcon: ({ color, focused }) => (
            <Stethoscope size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="IraTab"
        component={IraChatScreen}
        options={{
          tabBarLabel: 'Ask Ira',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIraIconWrapper : undefined}>
              <Bot size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ClinicsTab"
        component={ClinicsScreen}
        options={{
          tabBarLabel: 'Clinics',
          tabBarIcon: ({ color, focused }) => (
            <Building2 size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIraIconWrapper: {
    transform: [{ scale: 1.05 }],
  },
});

