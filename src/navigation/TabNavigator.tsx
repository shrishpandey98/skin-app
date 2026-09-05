import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Sparkles, Stethoscope, Building2 } from 'lucide-react-native';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProceduresScreen } from '../screens/procedures/ProceduresScreen';
import { ClinicsScreen } from '../screens/clinics/ClinicsScreen';
import { MainTabParamList } from '../types/navigation.types';
import { colors, typography, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Sparkles size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProceduresTab"
        component={ProceduresScreen}
        options={{
          tabBarLabel: 'Procedures',
          tabBarIcon: ({ color, size, focused }) => (
            <Stethoscope size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ClinicsTab"
        component={ClinicsScreen}
        options={{
          tabBarLabel: 'Clinics',
          tabBarIcon: ({ color, size, focused }) => (
            <Building2 size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...shadows.card,
  },
  tabBarLabel: {
    fontSize: typography.fontSizes.micro + 0.5,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: 2,
  },
});
