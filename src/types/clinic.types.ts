import { Doctor } from './doctor.types';
import { Procedure } from './procedure.types';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
  hasBreak?: boolean;
  breakStart?: string; // e.g. "01:30 PM"
  breakEnd?: string;   // e.g. "02:30 PM"
}

export interface BlockedTimeSlot {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  startTime?: string; // "03:00 PM"
  endTime?: string;   // "05:00 PM"
  isFullDay?: boolean;
  reason?: string;    // "Surgery / O.T.", "Emergency", "Break", "Personal", etc.
  createdAt?: string;
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  slotDurationMinutes?: number; // e.g. 15, 30, 45, 60
  dailyBreak?: {
    enabled: boolean;
    start: string; // "01:30 PM"
    end: string;   // "02:30 PM"
  };
  blockedSlots?: BlockedTimeSlot[];
  [key: string]: any;
}

export interface ClinicProcedurePricing {
  id: string;
  clinicId: string;
  procedureId: string;
  priceFrom: number;
  priceTo?: number;
  priceUnit: string; // e.g. "per unit", "per session", "package"
  description?: string;
  isAvailable: boolean;
  procedure?: Procedure;
  procedures?: Procedure;
}

export type ClinicProcedure = ClinicProcedurePricing;

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  openingHours: OpeningHours;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  specialties: string[];
  galleryImages: string[];
  isActive: boolean;
  procedures?: ClinicProcedurePricing[];
  doctors?: Doctor[];
  blockedSlots?: BlockedTimeSlot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicOfferingProcedure {
  clinic: Clinic;
  pricing: ClinicProcedurePricing;
}
