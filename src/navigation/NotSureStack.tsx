import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConcernSelectScreen } from '../screens/notsure/ConcernSelectScreen';
import { ConcernQuestionsScreen } from '../screens/notsure/ConcernQuestionsScreen';
import { ConcernResultsScreen } from '../screens/notsure/ConcernResultsScreen';
import { NotSureStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<NotSureStackParamList>();

export const NotSureStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="ConcernSelect" component={ConcernSelectScreen} />
      <Stack.Screen name="ConcernQuestions" component={ConcernQuestionsScreen} />
      <Stack.Screen name="ConcernResults" component={ConcernResultsScreen} />
    </Stack.Navigator>
  );
};
