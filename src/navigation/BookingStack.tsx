import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SelectDoctorScreen } from '../screens/booking/SelectDoctorScreen';
import { SelectProcedureScreen } from '../screens/booking/SelectProcedureScreen';
import { SelectDateTimeScreen } from '../screens/booking/SelectDateTimeScreen';
import { ConfirmDetailsScreen } from '../screens/booking/ConfirmDetailsScreen';
import { ReviewBookingScreen } from '../screens/booking/ReviewBookingScreen';
import { BookingSuccessScreen } from '../screens/booking/BookingSuccessScreen';
import { BookingStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<BookingStackParamList>();

export const BookingStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SelectProcedure"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="SelectProcedure" component={SelectProcedureScreen} />
      <Stack.Screen name="SelectDateTime" component={SelectDateTimeScreen} />
      <Stack.Screen name="ConfirmDetails" component={ConfirmDetailsScreen} />
      <Stack.Screen name="ReviewBooking" component={ReviewBookingScreen} />
      <Stack.Screen name="SelectDoctor" component={SelectProcedureScreen} />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};
