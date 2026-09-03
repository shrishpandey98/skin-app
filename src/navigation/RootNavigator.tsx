import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ProcedureDetailScreen } from '../screens/procedures/ProcedureDetailScreen';
import { ClinicDetailScreen } from '../screens/clinics/ClinicDetailScreen';
import { DoctorProfileScreen } from '../screens/clinics/DoctorProfileScreen';
import { SearchResultsScreen } from '../screens/search/SearchResultsScreen';
import { NotificationsModalScreen } from '../screens/profile/NotificationsModalScreen';
import { CitySelectorModalScreen } from '../screens/profile/CitySelectorModalScreen';
import { BookingStack } from './BookingStack';
import { NotSureStack } from './NotSureStack';
import { ProfileStack } from './ProfileStack';
import { AuthStack } from './AuthStack';
import { RootStackParamList } from '../types/navigation.types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {/* 3-Tab Core App */}
      <RootStack.Screen name="MainTabs" component={TabNavigator} />

      {/* Shared Discovery Screens */}
      <RootStack.Screen
        name="ProcedureDetailModal"
        component={ProcedureDetailScreen as any}
        options={{ animation: 'slide_from_right' }}
      />
      <RootStack.Screen
        name="ClinicDetailModal"
        component={ClinicDetailScreen as any}
        options={{ animation: 'slide_from_right' }}
      />
      <RootStack.Screen
        name="DoctorProfileModal"
        component={DoctorProfileScreen as any}
        options={{ animation: 'slide_from_right' }}
      />
      <RootStack.Screen
        name="SearchResultsModal"
        component={SearchResultsScreen}
        options={{ animation: 'fade' }}
      />

      {/* Modal Dialogs */}
      <RootStack.Screen
        name="NotificationsModal"
        component={NotificationsModalScreen}
        options={{ presentation: 'modal' }}
      />
      <RootStack.Screen
        name="CitySelectorModal"
        component={CitySelectorModalScreen}
        options={{ presentation: 'modal' }}
      />

      {/* Feature Flow Stacks */}
      <RootStack.Screen
        name="BookingFlow"
        component={BookingStack as any}
        options={{ presentation: 'fullScreenModal' }}
      />
      <RootStack.Screen
        name="NotSureFlow"
        component={NotSureStack as any}
        options={{ presentation: 'fullScreenModal' }}
      />
      <RootStack.Screen
        name="ProfileFlow"
        component={ProfileStack as any}
        options={{ presentation: 'modal' }}
      />
      <RootStack.Screen
        name="AuthFlow"
        component={AuthStack as any}
        options={{ presentation: 'modal' }}
      />
    </RootStack.Navigator>
  );
};
