import { create } from 'zustand';
import { Appointment, AppointmentStatus } from '../types/appointment.types';
import { Procedure } from '../types/procedure.types';
import { ClinicProcedure, Clinic } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { MOCK_CLINICS, MOCK_DOCTORS } from '../data/mockData';
import {
  doctorService,
  DoctorStats,
  PatientSummary,
  NewProcedurePayload,
  NewDoctorPayload,
} from '../services/doctor.service';
import { useAppointmentsStore } from './appointments.store';

interface ClinicUserProfile {
  id: string;
  name: string;
  email: string;
  clinicName: string;
  role: 'clinic_admin' | 'doctor';
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
    clinicName?: string
  ) => Promise<void>;
  loginDoctorWithGoogle: () => Promise<void>;
  doctorLogout: () => Promise<void>;
  setDoctorMode: (active: boolean) => void;
  setSelectedDoctorFilter: (doctorSlugOrId: string | null) => void;
  addDoctorToClinic: (payload: NewDoctorPayload) => Promise<Doctor>;
  toggleDoctorActive: (doctorId: string) => Promise<void>;
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

const DEFAULT_CLINIC: Clinic = {
  id: 'clinic_aura_partner',
  name: "Dr. Purva's Skin & Laser Clinic",
  slug: 'dr-purvas-skin-and-laser-clinic',
  description: 'Specialist aesthetic dermatology, laser center & hair restoration.',
  logoUrl: 'https://drpurvaskinclinic.com/media/uploads/site_setting/117503311.png',
  coverImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop',
  phone: '+91 94176 96148',
  email: 'drpurvapande@gmail.com',
  address: 'Plot No. 1187, Sector 11, Panchkula (Chandigarh Tricity)',
  area: 'Sector 11 (Panchkula)',
  city: 'Chandigarh / Panchkula',
  state: 'Haryana',
  latitude: 30.6890,
  longitude: 76.8534,
  openingHours: {
    monday: { open: '10:00 AM', close: '07:00 PM' },
    tuesday: { open: '10:00 AM', close: '07:00 PM' },
    wednesday: { open: '10:00 AM', close: '07:00 PM' },
    thursday: { open: '10:00 AM', close: '07:00 PM' },
    friday: { open: '10:00 AM', close: '07:00 PM' },
    saturday: { open: '10:00 AM', close: '06:30 PM' },
    sunday: { open: 'Closed', close: 'Closed', isClosed: true },
  },
  verificationStatus: 'verified',
  rating: 4.9,
  reviewCount: 310,
  specialties: ['Laser Hair Removal', 'Hydrafacial MD', 'Botox & Fillers', 'Acne Scars', 'PRP Hair Therapy'],
  galleryImages: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
  ],
  isActive: false, // Default: OFF
  procedures: [],
  doctors: [],
};

const DEFAULT_DOCTOR: Doctor = {
  id: 'doc_lead',
  name: 'Dr. Purva Pande',
  slug: 'dr-purva-pande',
  photoUrl: 'https://images.unsplash.com/photo-1594824813686-21a4413158c3?q=80&w=600&auto=format&fit=crop',
  qualification: 'MBBS, MD (Dermatology), DNB, MNAMS (Ex. GMCH-32, Harvard USA)',
  specialization: 'Chief Dermatologist & Laser Specialist',
  experienceYears: 15,
  bio: 'Dr. Purva is a board-certified senior dermatologist in Chandigarh Tricity specializing in lasers, anti-ageing, and clinical aesthetics.',
  rating: 4.9,
  reviewCount: 310,
  isActive: true,
  proceduresOffered: [],
};

export const useDoctorStore = create<DoctorState>((set, get) => ({
  activeClinic: MOCK_CLINICS[0] || DEFAULT_CLINIC,
  activeDoctor: MOCK_DOCTORS[0] || DEFAULT_DOCTOR,
  clinicDoctors: MOCK_DOCTORS.length > 0 ? [...MOCK_DOCTORS] : [DEFAULT_DOCTOR],
  selectedDoctorFilter: null,
  knowledgeBaseProcedures: [],
  clinicProcedures: MOCK_CLINICS[0]?.procedures || [],
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
      const stored = await AsyncStorage.getItem(STORAGE_KEY_DOCTOR);
      const isPub = await AsyncStorage.getItem(STORAGE_KEY_PUBLISHED);
      if (stored) {
        const user = JSON.parse(stored);
        set({ isDoctorAuthenticated: true, doctorUser: user });
      }
      if (isPub === 'true') {
        set({ isClinicPublished: true });
        get().toggleClinicPublish(true);
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

    // Sync to MOCK_CLINICS
    const clinicIdx = MOCK_CLINICS.findIndex((c) => c.id === updatedClinic.id || c.slug === updatedClinic.slug);
    if (publish) {
      if (clinicIdx >= 0) {
        MOCK_CLINICS[clinicIdx] = updatedClinic;
      } else {
        MOCK_CLINICS.push(updatedClinic);
      }
      // Add doctors to MOCK_DOCTORS
      doctors.forEach((d) => {
        if (!MOCK_DOCTORS.some((md) => md.id === d.id)) {
          MOCK_DOCTORS.push(d);
        }
      });
    } else {
      if (clinicIdx >= 0) {
        MOCK_CLINICS.splice(clinicIdx, 1);
      }
      // Remove clinic doctors from MOCK_DOCTORS
      doctors.forEach((d) => {
        const docIdx = MOCK_DOCTORS.findIndex((md) => md.id === d.id);
        if (docIdx >= 0) {
          MOCK_DOCTORS.splice(docIdx, 1);
        }
      });
    }

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(STORAGE_KEY_PUBLISHED, publish ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to persist published state', e);
    }
  },

  loginDoctorWithCredentials: async (
    email: string,
    password: string,
    doctorName?: string,
    clinicName?: string
  ) => {
    const isEmail = email.includes('@');
    const name = doctorName || (isEmail ? email.split('@')[0] : email);
    const formattedName = name.startsWith('Dr.') ? name : `Dr. ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    const clinic = clinicName || get().activeClinic.name;

    const doctorProfile: ClinicUserProfile = {
      id: 'doc_' + Date.now(),
      name: formattedName,
      email: isEmail ? email : `${email}@clinic.aura.app`,
      clinicName: clinic,
      role: 'clinic_admin',
    };

    set({ isDoctorAuthenticated: true, doctorUser: doctorProfile });

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(doctorProfile));
    } catch (e) {
      console.warn('Failed to persist doctor session', e);
    }

    await get().initializeDoctorPortal();
  },

  loginDoctorWithGoogle: async () => {
    // In demo / staging or Supabase OAuth
    const doctorProfile: ClinicUserProfile = {
      id: 'doc_google_' + Date.now(),
      name: "Dr. Purva's Skin & Laser Clinic Admin",
      email: 'drpurva@skinandlaser.in',
      clinicName: "Dr. Purva's Skin & Laser Clinic",
      role: 'clinic_admin',
    };

    set({ isDoctorAuthenticated: true, doctorUser: doctorProfile });

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(doctorProfile));
    } catch (e) {
      console.warn('Failed to persist doctor session', e);
    }

    await get().initializeDoctorPortal();
  },

  doctorLogout: async () => {
    set({ isDoctorAuthenticated: false, doctorUser: null });
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem(STORAGE_KEY_DOCTOR);
    } catch (e) {
      console.warn('Failed to clear doctor session', e);
    }
  },

  setSelectedDoctorFilter: (doctorSlugOrId: string | null) => {
    set({ selectedDoctorFilter: doctorSlugOrId });
  },

  addDoctorToClinic: async (payload: NewDoctorPayload) => {
    set({ loading: true });
    try {
      const newDoc = await doctorService.addDoctorToClinic(get().activeClinic.id, payload);
      set({
        clinicDoctors: [...get().clinicDoctors, newDoc],
        loading: false,
      });
      return newDoc;
    } catch (e: any) {
      set({ error: e?.message || 'Failed to add doctor', loading: false });
      throw e;
    }
  },

  toggleDoctorActive: async (doctorId: string) => {
    const currentDocs = get().clinicDoctors;
    const target = currentDocs.find((d) => d.id === doctorId);
    if (target) {
      const nextActive = !target.isActive;
      await doctorService.toggleDoctorActive(doctorId, nextActive);
      const updated = currentDocs.map((d) => (d.id === doctorId ? { ...d, isActive: nextActive } : d));
      set({ clinicDoctors: updated });
    }
  },

  initializeDoctorPortal: async () => {
    set({ loading: true, error: null });
    try {
      const kbProcedures = await doctorService.getKnowledgeBaseProcedures();
      const clinicProcs = await doctorService.getClinicProcedures(get().activeClinic.id);
      const clinicDocs = await doctorService.getClinicDoctors(get().activeClinic.id);
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
    }
  },

  addNewProcedureToKnowledgeBase: async (payload: NewProcedurePayload) => {
    set({ loading: true });
    try {
      const { procedure, clinicProcedure } = await doctorService.addProcedureToKnowledgeBase(
        get().activeClinic.id,
        payload
      );
      set({
        knowledgeBaseProcedures: [procedure, ...get().knowledgeBaseProcedures],
        clinicProcedures: [clinicProcedure, ...get().clinicProcedures],
        loading: false,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to add procedure', loading: false });
    }
  },

  toggleProcedureOffering: async (procedure: Procedure, isOffered: boolean) => {
    await doctorService.toggleProcedureOffering(get().activeClinic.id, procedure, isOffered);
    const updatedProcs = await doctorService.getClinicProcedures(get().activeClinic.id);
    set({ clinicProcedures: [...updatedProcs] });
  },

  refreshStats: () => {
    const allAppointments = useAppointmentsStore.getState().appointments;
    const patients = doctorService.getPatientDirectory(allAppointments);
    const stats = doctorService.calculateStats(allAppointments);
    set({ stats, patients });
  },
}));
