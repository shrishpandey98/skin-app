import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, BookingPayload } from '../types/appointment.types';
import { clinicsService } from '../services/clinics.service';
import { procedureKnowledgeBaseService } from '../services/procedureKnowledgeBase.service';

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

const STORAGE_KEY = '@aura_appointments_clean';

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],

  createAppointment: async (payload: BookingPayload) => {
    let clinic = await clinicsService.getClinicBySlug(payload.clinicId);
    if (!clinic) {
      clinic = {
        id: payload.clinicId || 'clinic_default',
        name: 'Aesthetic Clinic',
        slug: payload.clinicId || 'clinic-default',
        address: 'Chandigarh',
        phone: '+91 98765 43210',
      } as any;
    }

    const doctor = payload.doctorId && clinic?.doctors
      ? clinic.doctors.find((d) => d.id === payload.doctorId || d.slug === payload.doctorId)
      : undefined;

    const procedure = payload.procedureId
      ? await procedureKnowledgeBaseService.getProcedureBySlug(payload.procedureId)
      : undefined;

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
      } else {
        set({ appointments: [] });
      }
    } catch (e) {
      console.warn('Failed to load appointments', e);
    }
  },
}));
