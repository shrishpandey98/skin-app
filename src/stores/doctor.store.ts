import { create } from 'zustand';
import { Appointment, AppointmentStatus } from '../types/appointment.types';
import { Procedure } from '../types/procedure.types';
import { ClinicProcedure, Clinic } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { MOCK_CLINICS, MOCK_DOCTORS, MOCK_PROCEDURES } from '../data/mockData';
import { procedureKnowledgeBaseService } from '../services/procedureKnowledgeBase.service';
import {
  doctorService,
  DoctorStats,
  PatientSummary,
  NewProcedurePayload,
  NewDoctorPayload,
} from '../services/doctor.service';
import { useAppointmentsStore } from './appointments.store';

export interface ClinicUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  clinicName: string;
}

interface DoctorState {
  activeClinic: Clinic;
  activeDoctor: Doctor;
  clinicDoctors: Doctor[];
  selectedDoctorFilter: string | null;
  knowledgeBaseProcedures: Procedure[];
  clinicProcedures: ClinicProcedure[];
  stats: DoctorStats;
  patients: PatientSummary[];
  isDoctorMode: boolean;
  isDoctorAuthenticated: boolean;
  isClinicPublished: boolean;
  doctorUser: ClinicUserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  initializeDoctorPortal: () => Promise<void>;
  initializeDoctorAuth: () => Promise<void>;
  toggleClinicPublish: (publish: boolean) => Promise<void>;
  loginDoctorWithCredentials: (
    email: string,
    password: string,
    doctorName?: string,
    clinicName?: string,
    authMode?: 'signin' | 'register'
  ) => Promise<void>;
  loginDoctorWithGoogle: () => Promise<void>;
  doctorLogout: () => Promise<void>;
  setDoctorMode: (active: boolean) => void;
  setSelectedDoctorFilter: (doctorSlugOrId: string | null) => void;
  addDoctorToClinic: (payload: NewDoctorPayload) => Promise<Doctor>;
  removeDoctor: (doctorId: string) => Promise<void>;
  updateDoctor: (doctorId: string, updates: Partial<Doctor>) => Promise<void>;
  toggleDoctorActive: (doctorId: string) => Promise<void>;
  updateClinicProfile: (updates: Partial<Clinic>) => Promise<void>;
  updateUserProfile: (updates: { name: string; email: string; phone?: string }) => Promise<void>;
  updateOperatingHours: (hours: Clinic['openingHours']) => Promise<void>;
  updateAppointmentStatus: (
    appointmentId: string,
    status: AppointmentStatus,
    doctorNotes?: string
  ) => Promise<void>;
  updateProcedurePricing: (
    procedureId: string,
    updates: { priceFrom?: number; priceTo?: number; priceUnit?: string; isAvailable?: boolean }
  ) => Promise<void>;
  addNewProcedureToKnowledgeBase: (payload: NewProcedurePayload) => Promise<void>;
  toggleProcedureOffering: (procedure: Procedure, isOffered: boolean) => Promise<void>;
  refreshStats: () => void;
}

const STORAGE_KEY_DOCTOR = '@aura_doctor_session';
const STORAGE_KEY_PUBLISHED = '@aura_clinic_published_state';
const STORAGE_KEY_CLINIC_PROFILE = '@aura_clinic_custom_profile';
const STORAGE_KEY_DOCTORS_LIST = '@aura_clinic_doctors_list';
const STORAGE_KEY_CLINIC_PROCEDURES = '@aura_clinic_procedures_list';
const STORAGE_KEY_ACCOUNTS_MAP = '@aura_clinic_registered_accounts_v3';

const ALL_ACCOUNT_STORAGE_KEYS = [
  '@aura_clinic_registered_accounts_v3',
  '@aura_clinic_registered_accounts_v2',
  '@aura_clinic_registered_accounts_v1',
  '@aura_clinic_registered_accounts',
];

async function loadAllStoredDoctorAccounts(): Promise<Record<string, any>> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const merged: Record<string, any> = {};
  for (const key of ALL_ACCOUNT_STORAGE_KEYS) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        Object.assign(merged, parsed);
      }
    } catch (e) {}
  }
  return merged;
}

const DEFAULT_CLINIC: Clinic = {
  id: 'clinic_default_aura',
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  coverImageUrl: '',
  phone: '',
  email: '',
  address: '',
  area: '',
  city: '',
  state: '',
  latitude: 0,
  longitude: 0,
  openingHours: {
    monday: { open: '', close: '' },
    tuesday: { open: '', close: '' },
    wednesday: { open: '', close: '' },
    thursday: { open: '', close: '' },
    friday: { open: '', close: '' },
    saturday: { open: '', close: '' },
    sunday: { open: '', close: '', isClosed: true },
  },
  verificationStatus: 'verified',
  rating: 5.0,
  reviewCount: 0,
  specialties: [],
  galleryImages: [],
  isActive: false, // Default: OFF
  procedures: [],
  doctors: [],
};

// Persistence Helper
const persistClinicData = async (data: {
  doctorUser?: ClinicUserProfile | null;
  activeClinic?: Clinic;
  clinicDoctors?: Doctor[];
  clinicProcedures?: ClinicProcedure[];
  isClinicPublished?: boolean;
  userEmailForAccountMap?: string;
}) => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const promises: Promise<any>[] = [];

    if (data.doctorUser !== undefined) {
      if (data.doctorUser) {
        promises.push(AsyncStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(data.doctorUser)));
      } else {
        promises.push(AsyncStorage.removeItem(STORAGE_KEY_DOCTOR));
      }
    }
    if (data.activeClinic !== undefined) {
      promises.push(AsyncStorage.setItem(STORAGE_KEY_CLINIC_PROFILE, JSON.stringify(data.activeClinic)));
    }
    if (data.clinicDoctors !== undefined) {
      promises.push(AsyncStorage.setItem(STORAGE_KEY_DOCTORS_LIST, JSON.stringify(data.clinicDoctors)));
    }
    if (data.clinicProcedures !== undefined) {
      promises.push(AsyncStorage.setItem(STORAGE_KEY_CLINIC_PROCEDURES, JSON.stringify(data.clinicProcedures)));
    }
    if (data.isClinicPublished !== undefined) {
      promises.push(AsyncStorage.setItem(STORAGE_KEY_PUBLISHED, data.isClinicPublished ? 'true' : 'false'));
    }

    // Persist to Accounts DB keyed by normalized email
    const emailKey = (
      data.userEmailForAccountMap ||
      data.doctorUser?.email ||
      data.activeClinic?.email ||
      ''
    ).toLowerCase().trim();

    if (emailKey) {
      const accounts = await loadAllStoredDoctorAccounts();
      const prevAccount = accounts[emailKey] || {};

      // Keep doctorUser profile object in accounts map even if logging out
      const savedDoctorUser = data.doctorUser !== undefined
        ? (data.doctorUser || prevAccount.doctorUser || null)
        : (prevAccount.doctorUser || null);

      accounts[emailKey] = {
        password: prevAccount.password || '',
        doctorUser: savedDoctorUser,
        activeClinic: data.activeClinic || prevAccount.activeClinic,
        clinicDoctors: data.clinicDoctors || prevAccount.clinicDoctors,
        clinicProcedures: data.clinicProcedures || prevAccount.clinicProcedures,
        isClinicPublished:
          data.isClinicPublished !== undefined
            ? data.isClinicPublished
            : (prevAccount.isClinicPublished !== undefined ? prevAccount.isClinicPublished : false),
      };
      promises.push(AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS_MAP, JSON.stringify(accounts)));
    }

    await Promise.all(promises);

    // Sync to Supabase Cloud DB in background
    const currentClinic = data.activeClinic;
    if (currentClinic && (currentClinic.name || currentClinic.slug)) {
      doctorService
        .syncClinicToSupabase({
          clinic: currentClinic,
          doctors: data.clinicDoctors || [],
          procedures: data.clinicProcedures || [],
          isPublished: data.isClinicPublished !== undefined ? data.isClinicPublished : true,
        })
        .catch(console.warn);
    }
  } catch (e) {
    console.warn('Failed to persist clinic data', e);
  }
};

export const useDoctorStore = create<DoctorState>((set, get) => ({
  activeClinic: DEFAULT_CLINIC,
  activeDoctor: {} as Doctor,
  clinicDoctors: [],
  selectedDoctorFilter: null,
  knowledgeBaseProcedures: [],
  clinicProcedures: [],
  stats: {
    todayAppointmentsCount: 0,
    pendingCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    totalPatientsCount: 0,
  },
  patients: [],
  isDoctorMode: false,
  isDoctorAuthenticated: false,
  isClinicPublished: false, // Default OFF
  doctorUser: null,
  loading: false,
  error: null,

  initializeDoctorAuth: async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const storedDoctor = await AsyncStorage.getItem(STORAGE_KEY_DOCTOR);

      if (storedDoctor) {
        const user: ClinicUserProfile = JSON.parse(storedDoctor);
        const normalizedEmail = (user.email || '').toLowerCase().trim();

        const accounts = await loadAllStoredDoctorAccounts();
        let savedAccount = normalizedEmail ? accounts[normalizedEmail] : null;

        // If not in local accounts, try fetching from Supabase Cloud DB
        if (!savedAccount && normalizedEmail) {
          const cloudClinic = await doctorService.fetchClinicFromSupabase(normalizedEmail);
          if (cloudClinic) {
            savedAccount = {
              doctorUser: user,
              activeClinic: cloudClinic,
              clinicDoctors: cloudClinic.doctors || [],
              clinicProcedures: cloudClinic.procedures || [],
              isClinicPublished: cloudClinic.isActive,
            };
          }
        }

        if (savedAccount) {
          const clinic: Clinic = savedAccount.activeClinic || {
            ...DEFAULT_CLINIC,
            id: 'clinic_' + Date.now(),
            name: user.clinicName || '',
            email: normalizedEmail,
          };
          const doctors: Doctor[] = savedAccount.clinicDoctors || [];
          const procs: ClinicProcedure[] = savedAccount.clinicProcedures || [];
          const published = !!savedAccount.isClinicPublished;

          set({
            isDoctorAuthenticated: true,
            doctorUser: savedAccount.doctorUser || user,
            activeClinic: clinic,
            clinicDoctors: doctors,
            activeDoctor: doctors[0] || ({} as Doctor),
            clinicProcedures: procs,
            isClinicPublished: published,
          });

          doctorService.setClinicDoctors(doctors);
          doctorService.setClinicProcedures(procs);

          if (published) {
            const clinicIdx = MOCK_CLINICS.findIndex((c) => c.id === clinic.id || c.slug === clinic.slug);
            if (clinicIdx >= 0) {
              MOCK_CLINICS[clinicIdx] = { ...clinic, isActive: true, doctors, procedures: procs };
            } else {
              MOCK_CLINICS.push({ ...clinic, isActive: true, doctors, procedures: procs });
            }
            doctors.forEach((d) => {
              if (!MOCK_DOCTORS.some((md) => md.id === d.id)) {
                MOCK_DOCTORS.push(d);
              }
            });
          }
        } else {
          set({
            isDoctorAuthenticated: true,
            doctorUser: user,
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load doctor auth session', e);
    }
  },

  toggleClinicPublish: async (publish: boolean) => {
    const clinic = get().activeClinic;
    const doctors = get().clinicDoctors;
    const procedures = get().clinicProcedures;

    const updatedClinic: Clinic = {
      ...clinic,
      isActive: publish,
      doctors,
      procedures,
    };

    set({ isClinicPublished: publish, activeClinic: updatedClinic });

    // Sync to MOCK_CLINICS for customer view
    const clinicIdx = MOCK_CLINICS.findIndex((c) => c.id === updatedClinic.id || c.slug === updatedClinic.slug);
    if (publish) {
      if (clinicIdx >= 0) {
        MOCK_CLINICS[clinicIdx] = updatedClinic;
      } else {
        MOCK_CLINICS.push(updatedClinic);
      }
      doctors.forEach((d) => {
        if (!MOCK_DOCTORS.some((md) => md.id === d.id)) {
          MOCK_DOCTORS.push(d);
        }
      });
    } else {
      if (clinicIdx >= 0) {
        MOCK_CLINICS.splice(clinicIdx, 1);
      }
      doctors.forEach((d) => {
        const docIdx = MOCK_DOCTORS.findIndex((md) => md.id === d.id);
        if (docIdx >= 0) {
          MOCK_DOCTORS.splice(docIdx, 1);
        }
      });
    }

    await persistClinicData({
      isClinicPublished: publish,
      activeClinic: updatedClinic,
      clinicDoctors: doctors,
      clinicProcedures: procedures,
      doctorUser: get().doctorUser,
    });
  },

  loginDoctorWithCredentials: async (
    email: string,
    password: string,
    doctorName?: string,
    clinicName?: string,
    authMode: 'signin' | 'register' = 'signin'
  ) => {
    const isEmail = email.includes('@');
    const normalizedEmail = email.toLowerCase().trim();
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    // Look up saved account across all versions
    const accounts = await loadAllStoredDoctorAccounts();
    let existingAccount = accounts[normalizedEmail];

    // If not found in local accounts map, check Supabase Cloud DB
    if (!existingAccount && authMode === 'signin') {
      const cloudClinic = await doctorService.fetchClinicFromSupabase(normalizedEmail);
      if (cloudClinic) {
        existingAccount = {
          doctorUser: {
            id: 'doc_' + Date.now(),
            name: doctorName || cloudClinic.name || email.split('@')[0],
            email: normalizedEmail,
            clinicName: cloudClinic.name,
          },
          activeClinic: cloudClinic,
          clinicDoctors: cloudClinic.doctors || [],
          clinicProcedures: cloudClinic.procedures || [],
          isClinicPublished: cloudClinic.isActive,
        };
      }
    }

    if (authMode === 'signin') {
      if (!existingAccount) {
        throw new Error('No clinic account found with this email. Please register your clinic first.');
      }
      if (existingAccount.password && existingAccount.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials.');
      }
      if (!existingAccount.password) {
        existingAccount.password = password;
      }
    } else if (authMode === 'register') {
      if (existingAccount && existingAccount.password && existingAccount.password !== password) {
        throw new Error('An account with this email is already registered. Please sign in with your password.');
      }
    }

    let clinic: Clinic;
    let doctors: Doctor[];
    let userProfile: ClinicUserProfile;
    let procedures: ClinicProcedure[];
    let isPublished = false;

    if (existingAccount && authMode === 'signin') {
      // 1. Restore exact saved account
      userProfile = existingAccount.doctorUser || {
        id: 'doc_' + Date.now(),
        name: doctorName || existingAccount.activeClinic?.name || email.split('@')[0],
        email: email,
        clinicName: existingAccount.activeClinic?.name || clinicName || '',
      };
      clinic = existingAccount.activeClinic || DEFAULT_CLINIC;
      doctors = (existingAccount.clinicDoctors && existingAccount.clinicDoctors.length > 0)
        ? existingAccount.clinicDoctors
        : [];
      procedures = (existingAccount.clinicProcedures && existingAccount.clinicProcedures.length > 0)
        ? existingAccount.clinicProcedures
        : [];
      isPublished = !!existingAccount.isClinicPublished;

      if (clinicName) {
        clinic = { ...clinic, name: clinicName };
      }
    } else {
      // 2. New Registration - Only save lead doctor name, do NOT pre-fill clinic details or procedures
      const name = doctorName ? doctorName.trim() : (isEmail ? email.split('@')[0] : email);
      const cName = clinicName ? clinicName.trim() : '';
      const clinicId = 'clinic_' + Date.now();
      const clinicSlug = cName ? cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `clinic-${Date.now()}`;

      clinic = {
        id: clinicId,
        name: cName,
        slug: clinicSlug,
        description: '',
        logoUrl: '',
        coverImageUrl: '',
        phone: '',
        email: normalizedEmail,
        address: '',
        area: '',
        city: '',
        state: '',
        latitude: 0,
        longitude: 0,
        openingHours: {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '', isClosed: true },
        },
        verificationStatus: 'verified',
        rating: 5.0,
        reviewCount: 0,
        specialties: [],
        galleryImages: [],
        isActive: false,
        procedures: [],
        doctors: [],
      };

      userProfile = {
        id: 'doc_' + Date.now(),
        name,
        email: normalizedEmail,
        clinicName: cName,
      };

      const leadDoc: Doctor = {
        id: 'doc_' + Date.now(),
        name: name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        photoUrl: '',
        bio: '',
        specialization: '',
        qualification: '',
        experienceYears: 0,
        isActive: true,
        proceduresOffered: [],
        rating: 5.0,
        reviewCount: 0,
        clinicId: clinicId,
        clinicName: cName,
      };
      doctors = [leadDoc];

      // No procedure selected by default
      procedures = [];
    }

    doctorService.setClinicDoctors(doctors);
    doctorService.setClinicProcedures(procedures);

    set({
      isDoctorAuthenticated: true,
      doctorUser: userProfile,
      activeClinic: clinic,
      clinicDoctors: doctors,
      activeDoctor: doctors[0] || ({} as Doctor),
      clinicProcedures: procedures,
      isClinicPublished: isPublished,
    });

    // Save into accounts dictionary with password
    accounts[normalizedEmail] = {
      password: password,
      doctorUser: userProfile,
      activeClinic: clinic,
      clinicDoctors: doctors,
      clinicProcedures: procedures,
      isClinicPublished: isPublished,
    };
    await AsyncStorage.setItem(STORAGE_KEY_ACCOUNTS_MAP, JSON.stringify(accounts));

    await persistClinicData({
      userEmailForAccountMap: normalizedEmail,
      doctorUser: userProfile,
      activeClinic: clinic,
      clinicDoctors: doctors,
      clinicProcedures: procedures,
      isClinicPublished: isPublished,
    });

    await get().initializeDoctorPortal();
  },

  loginDoctorWithGoogle: async () => {
    const doctorProfile: ClinicUserProfile = {
      id: 'doc_google_' + Date.now(),
      name: "Clinic Manager",
      email: 'clinic@skinandlaser.in',
      clinicName: get().activeClinic.name || "Aura Skin Clinic",
    };

    set({ isDoctorAuthenticated: true, doctorUser: doctorProfile });
    await persistClinicData({
      doctorUser: doctorProfile,
      activeClinic: get().activeClinic,
      clinicDoctors: get().clinicDoctors,
      clinicProcedures: get().clinicProcedures,
      isClinicPublished: get().isClinicPublished,
    });

    await get().initializeDoctorPortal();
  },

  doctorLogout: async () => {
    // Keep all clinic profile, doctors, and procedures saved in account registry
    const current = get();
    const userEmail = (current.doctorUser?.email || current.activeClinic?.email || '').toLowerCase().trim();
    if (userEmail) {
      await persistClinicData({
        userEmailForAccountMap: userEmail,
        doctorUser: null, // clear active token
        activeClinic: current.activeClinic,
        clinicDoctors: current.clinicDoctors,
        clinicProcedures: current.clinicProcedures,
        isClinicPublished: current.isClinicPublished,
      });
    } else {
      await persistClinicData({ doctorUser: null });
    }

    set({
      isDoctorAuthenticated: false,
      doctorUser: null,
      activeClinic: DEFAULT_CLINIC,
      clinicDoctors: [],
      clinicProcedures: [],
      isClinicPublished: false,
    });
  },

  setSelectedDoctorFilter: (doctorSlugOrId: string | null) => {
    set({ selectedDoctorFilter: doctorSlugOrId });
  },

  addDoctorToClinic: async (payload: NewDoctorPayload) => {
    set({ loading: true });
    try {
      const newDoc = await doctorService.addDoctorToClinic(get().activeClinic.id, payload);
      const filtered = get().clinicDoctors.filter(
        (d) => d.id !== newDoc.id && d.slug !== newDoc.slug && d.name.toLowerCase().trim() !== newDoc.name.toLowerCase().trim()
      );
      const updatedDocs = [...filtered, newDoc];
      set({
        clinicDoctors: updatedDocs,
        loading: false,
      });
      await persistClinicData({
        clinicDoctors: updatedDocs,
        doctorUser: get().doctorUser,
        activeClinic: get().activeClinic,
      });
      return newDoc;
    } catch (e: any) {
      set({ error: e?.message || 'Failed to add doctor', loading: false });
      throw e;
    }
  },

  removeDoctor: async (doctorId: string) => {
    await doctorService.removeDoctor(doctorId);
    const updatedDocs = get().clinicDoctors.filter((d) => d.id !== doctorId);
    set({ clinicDoctors: updatedDocs });
    await persistClinicData({
      clinicDoctors: updatedDocs,
      doctorUser: get().doctorUser,
      activeClinic: get().activeClinic,
    });
  },

  updateDoctor: async (doctorId: string, updates: Partial<Doctor>) => {
    await doctorService.updateDoctor(doctorId, updates);
    const updatedDocs = get().clinicDoctors.map((d) => (d.id === doctorId ? { ...d, ...updates } : d));
    const activeDoc = get().activeDoctor?.id === doctorId ? { ...get().activeDoctor, ...updates } : get().activeDoctor;
    set({ clinicDoctors: updatedDocs, activeDoctor: activeDoc });
    await persistClinicData({
      clinicDoctors: updatedDocs,
      doctorUser: get().doctorUser,
      activeClinic: get().activeClinic,
    });
  },

  toggleDoctorActive: async (doctorId: string) => {
    const currentDocs = get().clinicDoctors;
    const target = currentDocs.find((d) => d.id === doctorId);
    if (target) {
      const nextActive = !target.isActive;
      await doctorService.toggleDoctorActive(doctorId, nextActive);
      const updated = currentDocs.map((d) => (d.id === doctorId ? { ...d, isActive: nextActive } : d));
      set({ clinicDoctors: updated });
      await persistClinicData({
        clinicDoctors: updated,
        doctorUser: get().doctorUser,
        activeClinic: get().activeClinic,
      });
    }
  },

  updateClinicProfile: async (updates: Partial<Clinic>) => {
    const current = get().activeClinic;
    const updated: Clinic = { ...current, ...updates };
    set({ activeClinic: updated });
    await doctorService.updateClinicProfile(current.id, updates);
    await persistClinicData({
      activeClinic: updated,
      doctorUser: get().doctorUser,
    });
  },

  updateUserProfile: async (updates: { name: string; email: string; phone?: string }) => {
    const current = get().doctorUser || {
      id: 'doc_' + Date.now(),
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      clinicName: get().activeClinic.name,
    };
    const updated: ClinicUserProfile = {
      ...current,
      ...updates,
    };
    set({ doctorUser: updated });
    await persistClinicData({
      doctorUser: updated,
      activeClinic: get().activeClinic,
    });
  },

  updateOperatingHours: async (hours: Clinic['openingHours']) => {
    const current = get().activeClinic;
    const updated: Clinic = { ...current, openingHours: hours };
    set({ activeClinic: updated });
    await doctorService.updateClinicProfile(current.id, { openingHours: hours });
    await persistClinicData({
      activeClinic: updated,
      doctorUser: get().doctorUser,
    });
  },

  initializeDoctorPortal: async () => {
    set({ loading: true, error: null });
    try {
      const clinicId = get().activeClinic.id;
      // Ingest latest updates from live Google Sheets ("Main" + "New procedures")
      await procedureKnowledgeBaseService.fetchLiveSheet(true);
      const kbProcedures = await doctorService.getKnowledgeBaseProcedures(clinicId);
      const clinicProcs =
        get().clinicProcedures.length > 0
          ? get().clinicProcedures
          : await doctorService.getClinicProcedures(clinicId);
      const clinicDocs =
        get().clinicDoctors.length > 0
          ? get().clinicDoctors
          : await doctorService.getClinicDoctors(clinicId);
      const allAppointments = useAppointmentsStore.getState().appointments;
      const patients = doctorService.getPatientDirectory(allAppointments);
      const stats = doctorService.calculateStats(allAppointments);

      set({
        knowledgeBaseProcedures: kbProcedures,
        clinicProcedures: clinicProcs,
        clinicDoctors: clinicDocs,
        patients,
        stats,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to initialize Clinic Portal', loading: false });
    }
  },

  setDoctorMode: (active: boolean) => {
    set({ isDoctorMode: active });
    if (active) {
      get().initializeDoctorAuth().then(() => {
        if (get().isDoctorAuthenticated) {
          get().initializeDoctorPortal();
        }
      });
    }
  },

  updateAppointmentStatus: async (
    appointmentId: string,
    status: AppointmentStatus,
    doctorNotes?: string
  ) => {
    // 1. Update in customer-facing shared appointments store
    const appointmentsStore = useAppointmentsStore.getState();
    const currentApts = appointmentsStore.appointments;
    const targetApt = currentApts.find((a) => a.id === appointmentId);

    if (targetApt) {
      if (status === 'cancelled') {
        await appointmentsStore.cancelAppointment(appointmentId);
      } else {
        // Direct status transition (e.g. pending -> confirmed, confirmed -> completed)
        const updatedApts = currentApts.map((apt) =>
          apt.id === appointmentId
            ? {
                ...apt,
                status,
                notes: doctorNotes ? `${apt.notes || ''} [Doctor: ${doctorNotes}]`.trim() : apt.notes,
                updatedAt: new Date().toISOString(),
              }
            : apt
        );
        useAppointmentsStore.setState({ appointments: updatedApts });
      }
    }

    // 2. Re-calculate metrics & patients list
    get().refreshStats();
  },

  updateProcedurePricing: async (procedureId, updates) => {
    const updated = await doctorService.updateClinicProcedure(procedureId, updates);
    if (updated) {
      const currentProcs = get().clinicProcedures.map((cp) =>
        cp.procedureId === procedureId || cp.id === procedureId ? { ...cp, ...updates } : cp
      );
      set({ clinicProcedures: currentProcs });
      await persistClinicData({
        clinicProcedures: currentProcs,
        doctorUser: get().doctorUser,
        activeClinic: get().activeClinic,
      });
    }
  },

  addNewProcedureToKnowledgeBase: async (payload: NewProcedurePayload) => {
    set({ loading: true });
    try {
      const { procedure, clinicProcedure } = await doctorService.addProcedureToKnowledgeBase(
        get().activeClinic.id,
        payload
      );
      const updatedKB = [procedure, ...get().knowledgeBaseProcedures];
      const updatedProcs = [clinicProcedure, ...get().clinicProcedures];
      set({
        knowledgeBaseProcedures: updatedKB,
        clinicProcedures: updatedProcs,
        loading: false,
      });
      await persistClinicData({
        clinicProcedures: updatedProcs,
        doctorUser: get().doctorUser,
        activeClinic: get().activeClinic,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to add procedure', loading: false });
    }
  },

  toggleProcedureOffering: async (procedure: Procedure, isOffered: boolean) => {
    await doctorService.toggleProcedureOffering(get().activeClinic.id, procedure, isOffered);
    const updatedProcs = await doctorService.getClinicProcedures(get().activeClinic.id);
    set({ clinicProcedures: [...updatedProcs] });
    await persistClinicData({
      clinicProcedures: updatedProcs,
      doctorUser: get().doctorUser,
      activeClinic: get().activeClinic,
    });
  },

  refreshStats: () => {
    const allAppointments = useAppointmentsStore.getState().appointments;
    const patients = doctorService.getPatientDirectory(allAppointments);
    const stats = doctorService.calculateStats(allAppointments);
    set({ stats, patients });
  },
}));

// Reactive Google Sheet Auto-Ingestion listener for Doctor App
procedureKnowledgeBaseService.subscribe((allProcs) => {
  const state = useDoctorStore.getState();
  if (state.activeClinic?.id) {
    const filtered = allProcs.filter(
      (p) => !p.addedByClinicId || p.addedByClinicId === state.activeClinic.id || p.isGloballyEnabled
    );
    useDoctorStore.setState({ knowledgeBaseProcedures: filtered });
  } else {
    useDoctorStore.setState({ knowledgeBaseProcedures: allProcs });
  }
});

