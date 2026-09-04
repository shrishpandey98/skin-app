import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Calendar, Sparkles, Building2 } from 'lucide-react-native';
import { DoctorAuthScreen } from '../screens/doctor/DoctorAuthScreen';
import { DoctorScheduleScreen } from '../screens/doctor/DoctorScheduleScreen';
import { DoctorAppointmentDetailScreen } from '../screens/doctor/DoctorAppointmentDetailScreen';
import { DoctorProceduresScreen } from '../screens/doctor/DoctorProceduresScreen';
import { DoctorSettingsScreen } from '../screens/doctor/DoctorSettingsScreen';
import { useDoctorStore } from '../stores/doctor.store';
import { colors, typography } from '../constants/theme';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSizes.micro + 0.5,
          fontWeight: typography.fontWeights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="QueueTab"
        component={QueueStack}
        options={{
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ color, size }) => <Calendar size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProceduresTab"
        component={ProceduresStack}
        options={{
          tabBarLabel: 'Procedures',
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="ClinicTab"
        component={ClinicStack}
        options={{
          tabBarLabel: 'Clinic',
          tabBarIcon: ({ color, size }) => <Building2 size={size - 2} color={color} />,
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
