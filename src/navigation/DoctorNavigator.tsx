import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Calendar, ListOrdered, Sparkles, Users, Settings } from 'lucide-react-native';
import { DoctorScheduleScreen } from '../screens/doctor/DoctorScheduleScreen';
import { DoctorAppointmentsScreen } from '../screens/doctor/DoctorAppointmentsScreen';
import { DoctorAppointmentDetailScreen } from '../screens/doctor/DoctorAppointmentDetailScreen';
import { DoctorProceduresScreen } from '../screens/doctor/DoctorProceduresScreen';
import { DoctorPatientsScreen } from '../screens/doctor/DoctorPatientsScreen';
import { DoctorSettingsScreen } from '../screens/doctor/DoctorSettingsScreen';
import { colors, typography } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DoctorScheduleStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorScheduleMain" component={DoctorScheduleScreen} />
    <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetailScreen} />
    <Stack.Screen name="DoctorProcedures" component={DoctorProceduresScreen} />
  </Stack.Navigator>
);

const DoctorAppointmentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorAppointmentsMain" component={DoctorAppointmentsScreen} />
    <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetailScreen} />
  </Stack.Navigator>
);

const DoctorProceduresStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorProceduresMain" component={DoctorProceduresScreen} />
  </Stack.Navigator>
);

const DoctorPatientsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorPatientsMain" component={DoctorPatientsScreen} />
  </Stack.Navigator>
);

const DoctorSettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DoctorSettingsMain" component={DoctorSettingsScreen} />
    <Stack.Screen name="DoctorProcedures" component={DoctorProceduresScreen} />
  </Stack.Navigator>
);

export const DoctorNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSizes.micro,
          fontWeight: typography.fontWeights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="DoctorScheduleTab"
        component={DoctorScheduleStack}
        options={{
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="DoctorAppointmentsTab"
        component={DoctorAppointmentsStack}
        options={{
          tabBarLabel: 'Queue',
          tabBarIcon: ({ color, size }) => <ListOrdered size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="DoctorProceduresTab"
        component={DoctorProceduresStack}
        options={{
          tabBarLabel: 'Knowledge Base',
          tabBarIcon: ({ color, size }) => <Sparkles size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="DoctorPatientsTab"
        component={DoctorPatientsStack}
        options={{
          tabBarLabel: 'Patients',
          tabBarIcon: ({ color, size }) => <Users size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="DoctorSettingsTab"
        component={DoctorSettingsStack}
        options={{
          tabBarLabel: 'Clinic',
          tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
