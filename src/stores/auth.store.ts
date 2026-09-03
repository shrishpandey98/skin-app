import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types/user.types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  savedClinics: string[];
  savedProcedures: string[];
  login: (phoneOrEmail: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleSaveClinic: (clinicSlug: string) => void;
  toggleSaveProcedure: (procedureSlug: string) => void;
  isClinicSaved: (clinicSlug: string) => boolean;
  isProcedureSaved: (procedureSlug: string) => boolean;
  updateProfile: (updated: Partial<UserProfile>) => void;
  initializeAuth: () => Promise<void>;
}

const STORAGE_KEY_USER = '@aura_user_session';
const STORAGE_KEY_SAVED_CLINICS = '@aura_saved_clinics';
const STORAGE_KEY_SAVED_PROCEDURES = '@aura_saved_procedures';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  savedClinics: ['aesthetica-skin-and-laser-clinic'],
  savedProcedures: ['botox', 'hydrafacial'],

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

    set({ isAuthenticated: true, user: newUser });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to persist auth session', e);
    }
  },

  logout: async () => {
    set({ isAuthenticated: false, user: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
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
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
      const storedClinics = await AsyncStorage.getItem(STORAGE_KEY_SAVED_CLINICS);
      const storedProcedures = await AsyncStorage.getItem(STORAGE_KEY_SAVED_PROCEDURES);

      if (storedUser) {
        set({ isAuthenticated: true, user: JSON.parse(storedUser) });
      }
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
