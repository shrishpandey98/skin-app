import { Clinic } from './clinic.types';
import { Doctor } from './doctor.types';
import { Procedure } from './procedure.types';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  userId: string;
  clinicId: string;
  doctorId?: string;
  procedureId?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "11:30 AM" or "11:30"
  status: AppointmentStatus;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Joined/populated objects
  clinic?: Clinic;
  doctor?: Doctor;
  procedure?: Procedure;
}

export interface BookingPayload {
  clinicId: string;
  doctorId?: string;
  procedureId?: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  notes?: string;
}
