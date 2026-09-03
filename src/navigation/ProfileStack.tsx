import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MyAppointmentsScreen } from '../screens/profile/MyAppointmentsScreen';
import { AppointmentDetailScreen } from '../screens/profile/AppointmentDetailScreen';
import { SavedItemsScreen } from '../screens/profile/SavedItemsScreen';
import { PersonalDetailsScreen } from '../screens/profile/PersonalDetailsScreen';
import { ProfileStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
    </Stack.Navigator>
  );
};
