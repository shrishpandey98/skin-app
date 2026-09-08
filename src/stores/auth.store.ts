import { create } from 'zustand';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/user.types';
import { supabase } from '../services/supabase';

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  hasCompletedAuth: boolean;
  user: UserProfile | null;
  savedClinics: string[];
  savedProcedures: string[];
  login: (phoneOrEmail: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (
    usernameOrEmail: string,
    password: string,
    name?: string,
    mode?: 'signin' | 'signup'
  ) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  toggleSaveClinic: (clinicSlug: string) => void;
  toggleSaveProcedure: (procedureSlug: string) => void;
  isClinicSaved: (clinicSlug: string) => boolean;
  isProcedureSaved: (procedureSlug: string) => boolean;
  updateProfile: (updated: Partial<UserProfile>) => void;
  initializeAuth: () => Promise<void>;
}

const STORAGE_KEY_USER = '@aura_user_session';
const STORAGE_KEY_GUEST = '@aura_guest_session';
const STORAGE_KEY_SAVED_CLINICS = '@aura_saved_clinics';
const STORAGE_KEY_SAVED_PROCEDURES = '@aura_saved_procedures';
const STORAGE_KEY_CUSTOMERS_MAP = '@aura_customer_registered_accounts_v1';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isGuest: false,
  hasCompletedAuth: false,
  user: null,
  savedClinics: [],
  savedProcedures: [],

  login: async (phoneOrEmail: string, name = 'Priya Sharma') => {
    const isEmail = phoneOrEmail.includes('@');
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      name: name,
      phone: isEmail ? '+91 98765 43210' : phoneOrEmail,
      email: isEmail ? phoneOrEmail : 'priya.sharma@example.com',
      city: 'Chandigarh',
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    };

    set({ isAuthenticated: true, isGuest: false, hasCompletedAuth: true, user: newUser });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      await AsyncStorage.removeItem(STORAGE_KEY_GUEST);
    } catch (e) {
      console.warn('Failed to persist auth session', e);
    }
  },

  loginWithGoogle: async () => {
    try {
      const redirectUrl =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? window.location.origin
          : 'skinapp://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
          queryParams: {
            prompt: 'select_account', // Forces Google to show the account picker
          },
        },
      });

      if (error) {
        throw error;
      }

      if (Platform.OS !== 'web' && data?.url) {
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      console.warn('Google OAuth error:', e);
      throw e;
    }
  },

  loginWithCredentials: async (
    usernameOrEmail: string,
    password: string,
    name?: string,
    mode: 'signin' | 'signup' = 'signin'
  ) => {
    const isEmail = usernameOrEmail.includes('@');
    const normalizedKey = usernameOrEmail.toLowerCase().trim();

    // 1. Read registered customers DB across all storage keys
    const ALL_CUSTOMER_KEYS = [
      '@aura_customer_registered_accounts_v1',
      '@aura_customer_registered_accounts',
    ];
    const customersMap: Record<string, { password: string; user: UserProfile }> = {};
    for (const key of ALL_CUSTOMER_KEYS) {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          Object.assign(customersMap, JSON.parse(raw));
        }
      } catch (e) {}
    }

    // 2. Pre-seed default demo users if not present
    const demoUsers: Record<string, { password: string; user: UserProfile }> = {
      'ananya.sharma@gmail.com': {
        password: 'customer123',
        user: {
          id: 'usr_ananya_demo',
          name: 'Ananya Sharma',
          email: 'ananya.sharma@gmail.com',
          phone: '+91 98765 43210',
          city: 'Chandigarh',
          profileImageUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        },
      },
      'priya@example.com': {
        password: 'password123',
        user: {
          id: 'usr_priya_demo',
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 98765 43210',
          city: 'Chandigarh',
          profileImageUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        },
      },
    };

    Object.entries(demoUsers).forEach(([emailKey, data]) => {
      if (!customersMap[emailKey]) {
        customersMap[emailKey] = data;
      }
    });
    if (!customersMap['priyasharma']) {
      customersMap['priyasharma'] = demoUsers['priya@example.com'];
    }

    const existingRecord = customersMap[normalizedKey];

    let userToLogin: UserProfile;

    if (mode === 'signin') {
      if (!existingRecord) {
        throw new Error('No user account found with this username/email. Please sign up first.');
      }
      if (existingRecord.password && existingRecord.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials.');
      }
      userToLogin = existingRecord.user;
    } else {
      // mode === 'signup'
      if (existingRecord) {
        throw new Error('An account with this email/username is already registered. Please sign in.');
      }
      const userName = name || (isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail);
      const capitalized = userName.charAt(0).toUpperCase() + userName.slice(1);

      userToLogin = {
        id: 'usr_' + Date.now(),
        name: capitalized,
        email: isEmail ? usernameOrEmail : `${usernameOrEmail}@aura.app`,
        phone: '+91 98765 43210',
        city: 'Chandigarh',
        profileImageUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      };

      customersMap[normalizedKey] = {
        password: password,
        user: userToLogin,
      };
      await AsyncStorage.setItem(STORAGE_KEY_CUSTOMERS_MAP, JSON.stringify(customersMap));
    }

    set({ isAuthenticated: true, isGuest: false, hasCompletedAuth: true, user: userToLogin });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userToLogin));
      await AsyncStorage.removeItem(STORAGE_KEY_GUEST);
    } catch (e) {
      console.warn('Failed to persist credential session', e);
    }
  },

  continueAsGuest: () => {
    set({ isAuthenticated: false, isGuest: true, hasCompletedAuth: true, user: null });
    AsyncStorage.setItem(STORAGE_KEY_GUEST, 'true').catch(console.warn);
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    set({ isAuthenticated: false, isGuest: false, hasCompletedAuth: false, user: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
      await AsyncStorage.removeItem(STORAGE_KEY_GUEST);
    } catch (e) {
      console.warn('Failed to clear auth session', e);
    }
  },

  toggleSaveClinic: (clinicSlug: string) => {
    const { savedClinics } = get();
    const exists = savedClinics.includes(clinicSlug);
    const updated = exists
      ? savedClinics.filter((slug) => slug !== clinicSlug)
      : [...savedClinics, clinicSlug];

    set({ savedClinics: updated });
    AsyncStorage.setItem(STORAGE_KEY_SAVED_CLINICS, JSON.stringify(updated)).catch(console.warn);
  },

  toggleSaveProcedure: (procedureSlug: string) => {
    const { savedProcedures } = get();
    const exists = savedProcedures.includes(procedureSlug);
    const updated = exists
      ? savedProcedures.filter((slug) => slug !== procedureSlug)
      : [...savedProcedures, procedureSlug];

    set({ savedProcedures: updated });
    AsyncStorage.setItem(STORAGE_KEY_SAVED_PROCEDURES, JSON.stringify(updated)).catch(console.warn);
  },

  isClinicSaved: (clinicSlug: string) => {
    return get().savedClinics.includes(clinicSlug);
  },

  isProcedureSaved: (procedureSlug: string) => {
    return get().savedProcedures.includes(procedureSlug);
  },

  updateProfile: (updated: Partial<UserProfile>) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...updated };
    set({ user: merged });
    AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged)).catch(console.warn);
  },

  initializeAuth: async () => {
    try {
      // 1. Helper function to process OAuth tokens or authorization code from deep links
      const handleAuthDeepLink = async (url: string) => {
        if (!url || !url.startsWith('skinapp://')) return;
        try {
          // Check for PKCE authorization code in query params: skinapp://auth/callback?code=xxx
          if (url.includes('code=')) {
            const parsedUrl = new URL(url);
            const code = parsedUrl.searchParams.get('code');
            if (code) {
              const { data, error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) console.warn('Error exchanging code for session:', error);
              return;
            }
          }

          // Check for implicit token hash in URL: skinapp://auth/callback#access_token=xxx&refresh_token=yyy
          if (url.includes('#')) {
            const hashIndex = url.indexOf('#');
            const hash = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (error) console.warn('Error setting session from URL hash:', error);
              return;
            }
          }
        } catch (e) {
          console.warn('Error handling OAuth callback deep link:', e);
        }
      };

      // 2. Set up deep link listeners on mobile platforms
      if (Platform.OS !== 'web') {
        Linking.getInitialURL().then((url) => {
          if (url) handleAuthDeepLink(url);
        }).catch(console.warn);

        Linking.addEventListener('url', ({ url }) => {
          if (url) handleAuthDeepLink(url);
        });
      }

      // 3. Check active Supabase session (e.g. from Google OAuth callback)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const sbUser = sessionData.session.user;
        const profile: UserProfile = {
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
          email: sbUser.email || '',
          phone: sbUser.phone || '+91 98765 43210',
          city: 'Chandigarh',
          profileImageUrl:
            sbUser.user_metadata?.avatar_url ||
            sbUser.user_metadata?.picture ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        };
        set({ isAuthenticated: true, isGuest: false, hasCompletedAuth: true, user: profile });
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
      } else {
        // 4. Check local stored storage
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        const isGuest = await AsyncStorage.getItem(STORAGE_KEY_GUEST);

        if (storedUser) {
          set({ isAuthenticated: true, isGuest: false, hasCompletedAuth: true, user: JSON.parse(storedUser) });
        } else if (isGuest === 'true') {
          set({ isAuthenticated: false, isGuest: true, hasCompletedAuth: true, user: null });
        }
      }

      // 5. Listen to auth state changes (e.g. Google OAuth redirect on web / native)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const sbUser = session.user;
          const profile: UserProfile = {
            id: sbUser.id,
            name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            email: sbUser.email || '',
            phone: sbUser.phone || '+91 98765 43210',
            city: 'Chandigarh',
            profileImageUrl:
              sbUser.user_metadata?.avatar_url ||
              sbUser.user_metadata?.picture ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
          };
          set({ isAuthenticated: true, isGuest: false, hasCompletedAuth: true, user: profile });
          await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
        }
      });

      const storedClinics = await AsyncStorage.getItem(STORAGE_KEY_SAVED_CLINICS);
      const storedProcedures = await AsyncStorage.getItem(STORAGE_KEY_SAVED_PROCEDURES);

      if (storedClinics) {
        set({ savedClinics: JSON.parse(storedClinics) });
      }
      if (storedProcedures) {
        set({ savedProcedures: JSON.parse(storedProcedures) });
      }
    } catch (e) {
      console.warn('Failed to load initial auth storage', e);
    }
  },
}));
