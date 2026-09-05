import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/auth.store';
import { useAppointmentsStore } from './src/stores/appointments.store';
import { useDoctorStore } from './src/stores/doctor.store';
import { colors } from './src/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 30, // 30 minutes cache for catalog data (saves 90% network queries)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection
      refetchOnWindowFocus: false, // Prevents excessive refetching on app switch
      refetchOnReconnect: 'always',
    },
  },
});

export default function App() {
  const { initializeAuth } = useAuthStore();
  const { initializeAppointments } = useAppointmentsStore();
  const { setDoctorMode } = useDoctorStore();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const search = window.location.search || '';
      const pathname = window.location.pathname || '';
      const hash = window.location.hash || '';
      if (
        search.includes('doctor') ||
        search.includes('clinic') ||
        search.includes('portal') ||
        pathname.includes('doctor') ||
        pathname.includes('clinic') ||
        hash.includes('doctor') ||
        hash.includes('clinic')
      ) {
        setDoctorMode(true);
      }
    }
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
    width: '100%',
    height: '100%',
    minHeight: '100vh' as any,
  },
  webMobileFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    minHeight: '100vh' as any,
    backgroundColor: colors.background,
    shadowColor: '#2B261D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    display: 'flex',
    flexDirection: 'column',
  },
});
