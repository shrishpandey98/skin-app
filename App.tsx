import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/auth.store';
import { useAppointmentsStore } from './src/stores/appointments.store';
import { colors } from './src/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  const { initializeAuth } = useAuthStore();
  const { initializeAppointments } = useAppointmentsStore();

  useEffect(() => {
    initializeAuth();
    initializeAppointments();
  }, []);

  const content = (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuterContainer}>
        <View style={styles.webMobileFrame}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#ECE7DD',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    maxHeight: '100dvh' as any,
    overflow: 'hidden',
  },
  webMobileFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    maxHeight: '100dvh' as any,
    backgroundColor: colors.background,
    shadowColor: '#2B261D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
});
