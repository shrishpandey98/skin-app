import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Calendar, Sparkles, Building2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DoctorAuthScreen } from '../screens/doctor/DoctorAuthScreen';
import { DoctorScheduleScreen } from '../screens/doctor/DoctorScheduleScreen';
import { DoctorAppointmentDetailScreen } from '../screens/doctor/DoctorAppointmentDetailScreen';
import { DoctorProceduresScreen } from '../screens/doctor/DoctorProceduresScreen';
import { DoctorSettingsScreen } from '../screens/doctor/DoctorSettingsScreen';
import { useDoctorStore } from '../stores/doctor.store';
import { colors, typography, shadows } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const DoctorRootStack = createNativeStackNavigator();

const QueueStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorQueueMain" component={DoctorScheduleScreen} />
    <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetailScreen} />
    <Stack.Screen name="DoctorProcedures" component={DoctorProceduresScreen} />
  </Stack.Navigator>
);

const ProceduresStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorProceduresMain" component={DoctorProceduresScreen} />
  </Stack.Navigator>
);

const ClinicStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorClinicMain" component={DoctorSettingsScreen} />
    <Stack.Screen name="DoctorProcedures" component={DoctorProceduresScreen} />
  </Stack.Navigator>
);

const DoctorTabs: React.FC = () => {
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
          borderTopColor: colors.border,
          borderTopWidth: 1,
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
        name="QueueTab"
        component={QueueStack}
        options={{
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ color, focused }) => (
            <Calendar size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="ProceduresTab"
        component={ProceduresStack}
        options={{
          tabBarLabel: 'Procedures',
          tabBarIcon: ({ color, focused }) => (
            <Sparkles size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="ClinicTab"
        component={ClinicStack}
        options={{
          tabBarLabel: 'Clinic',
          tabBarIcon: ({ color, focused }) => (
            <Building2 size={22} color={color} strokeWidth={focused ? 2.3 : 1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const DoctorNavigator: React.FC = () => {
  const { isDoctorAuthenticated, initializeDoctorAuth } = useDoctorStore();

  useEffect(() => {
    initializeDoctorAuth();
  }, [initializeDoctorAuth]);

  return (
    <DoctorRootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isDoctorAuthenticated ? (
        <DoctorRootStack.Screen
          name="DoctorAuth"
          component={DoctorAuthScreen}
          options={{ animation: 'fade' }}
        />
      ) : (
        <DoctorRootStack.Screen
          name="DoctorMain"
          component={DoctorTabs}
          options={{ animation: 'fade' }}
        />
      )}
    </DoctorRootStack.Navigator>
  );
};
