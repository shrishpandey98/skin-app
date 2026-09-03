import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeAuthScreen } from '../screens/auth/WelcomeAuthScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { AuthStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="WelcomeAuth" component={WelcomeAuthScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
};
