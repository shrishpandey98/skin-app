import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, BookingPayload } from '../types/appointment.types';
import { MOCK_CLINICS, MOCK_DOCTORS, MOCK_PROCEDURES } from '../data/mockData';

interface AppointmentsState {
  appointments: Appointment[];
  createAppointment: (payload: BookingPayload) => Promise<Appointment>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<void>;
  getUpcomingAppointments: () => Appointment[];
  getPastAppointments: () => Appointment[];
  getCancelledAppointments: () => Appointment[];
  initializeAppointments: () => Promise<void>;
}

const STORAGE_KEY = '@aura_appointments';

const INITIAL_MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_sample_1',
    userId: 'usr_default',
    clinicId: 'clinic_aesthetica',
    doctorId: 'doc_ananya',
    procedureId: 'proc_hydrafacial',
    appointmentDate: '2026-09-12',
    appointmentTime: '03:30 PM',
    status: 'confirmed',
    patientName: 'Priya Sharma',
    patientPhone: '+91 98765 43210',
    notes: 'First time consultation for pre-wedding skin glow',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    clinic: MOCK_CLINICS[0],
    doctor: MOCK_DOCTORS[0],
    procedure: MOCK_PROCEDURES[2],
  },
  {
    id: 'apt_sample_2',
    userId: 'usr_default',
    clinicId: 'clinic_skin_studio',
    doctorId: 'doc_mehak',
    procedureId: 'proc_botox',
    appointmentDate: '2026-08-10',
    appointmentTime: '11:00 AM',
    status: 'completed',
    patientName: 'Priya Sharma',
    patientPhone: '+91 98765 43210',
    notes: 'Baby Botox for forehead lines',
    createdAt: '2026-08-05T09:30:00Z',
    updatedAt: '2026-08-10T12:00:00Z',
    clinic: MOCK_CLINICS[2],
    doctor: MOCK_DOCTORS[4],
    procedure: MOCK_PROCEDURES[0],
  },
];

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: INITIAL_MOCK_APPOINTMENTS,

  createAppointment: async (payload: BookingPayload) => {
    const clinic = MOCK_CLINICS.find((c) => c.id === payload.clinicId || c.slug === payload.clinicId) || MOCK_CLINICS[0];
    const doctor = payload.doctorId ? MOCK_DOCTORS.find((d) => d.id === payload.doctorId || d.slug === payload.doctorId) : undefined;
    const procedure = payload.procedureId ? MOCK_PROCEDURES.find((p) => p.id === payload.procedureId || p.slug === payload.procedureId) : undefined;

    const newAppointment: Appointment = {
      id: 'apt_' + Date.now(),
      userId: 'usr_default',
      clinicId: clinic.id,
      doctorId: doctor?.id,
      procedureId: procedure?.id,
      appointmentDate: payload.appointmentDate,
      appointmentTime: payload.appointmentTime,
      status: 'confirmed',
      patientName: payload.patientName,
      patientPhone: payload.patientPhone,
      patientEmail: payload.patientEmail,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clinic,
      doctor,
      procedure,
    };

    const updated = [newAppointment, ...get().appointments];
    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save appointments', e);
    }

    return newAppointment;
  },

  cancelAppointment: async (appointmentId: string) => {
    const updated = get().appointments.map((apt) =>
      apt.id === appointmentId ? { ...apt, status: 'cancelled' as const, updatedAt: new Date().toISOString() } : apt
    );
    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update appointments', e);
    }
  },

  rescheduleAppointment: async (appointmentId: string, newDate: string, newTime: string) => {
    const updated = get().appointments.map((apt) =>
      apt.id === appointmentId
        ? {
            ...apt,
            appointmentDate: newDate,
            appointmentTime: newTime,
            status: 'rescheduled' as const,
            updatedAt: new Date().toISOString(),
          }
        : apt
    );
    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update appointments', e);
    }
  },

  getUpcomingAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'rescheduled');
  },

  getPastAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'completed');
  },

  getCancelledAppointments: () => {
    return get().appointments.filter((apt) => apt.status === 'cancelled');
  },

  initializeAppointments: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ appointments: JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('Failed to load appointments', e);
    }
  },
}));
