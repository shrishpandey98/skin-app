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
} from '../services/doctor.service';
import { useAppointmentsStore } from './appointments.store';

interface DoctorUserProfile {
  id: string;
  name: string;
  email: string;
  clinicName: string;
  role: 'doctor' | 'clinic_admin';
}

interface DoctorState {
  activeClinic: Clinic;
  activeDoctor: Doctor;
  knowledgeBaseProcedures: Procedure[];
  clinicProcedures: ClinicProcedure[];
  stats: DoctorStats;
  patients: PatientSummary[];
  isDoctorMode: boolean;
  isDoctorAuthenticated: boolean;
  doctorUser: DoctorUserProfile | null;
  loading: boolean;
  error: string | null;

  // Actions
  initializeDoctorPortal: () => Promise<void>;
  initializeDoctorAuth: () => Promise<void>;
  loginDoctorWithCredentials: (
    email: string,
    password: string,
    doctorName?: string,
    clinicName?: string
  ) => Promise<void>;
  loginDoctorWithGoogle: () => Promise<void>;
  doctorLogout: () => Promise<void>;
  setDoctorMode: (active: boolean) => void;
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

export const useDoctorStore = create<DoctorState>((set, get) => ({
  activeClinic: MOCK_CLINICS[0],
  activeDoctor: MOCK_DOCTORS[0],
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
  doctorUser: null,
  loading: false,
  error: null,

  initializeDoctorAuth: async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem(STORAGE_KEY_DOCTOR);
      if (stored) {
        const user = JSON.parse(stored);
        set({ isDoctorAuthenticated: true, doctorUser: user });
      }
    } catch (e) {
      console.warn('Failed to load doctor auth session', e);
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

    const doctorProfile: DoctorUserProfile = {
      id: 'doc_' + Date.now(),
      name: formattedName,
      email: isEmail ? email : `${email}@clinic.aura.app`,
      clinicName: clinic,
      role: 'doctor',
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
    const doctorProfile: DoctorUserProfile = {
      id: 'doc_google_' + Date.now(),
      name: 'Dr. Purva Pande',
      email: 'drpurva@skinandlaser.in',
      clinicName: "Dr. Purva's Skin & Laser Clinic",
      role: 'doctor',
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

  initializeDoctorPortal: async () => {
    set({ loading: true, error: null });
    try {
      const kbProcedures = await doctorService.getKnowledgeBaseProcedures();
      const clinicProcs = await doctorService.getClinicProcedures(get().activeClinic.id);
      const allAppointments = useAppointmentsStore.getState().appointments;
      const patients = doctorService.getPatientDirectory(allAppointments);
      const stats = doctorService.calculateStats(allAppointments);

      set({
        knowledgeBaseProcedures: kbProcedures,
        clinicProcedures: clinicProcs,
        patients,
        stats,
        loading: false,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to initialize Doctor Portal', loading: false });
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
