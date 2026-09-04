import { Doctor } from './doctor.types';
import { Procedure } from './procedure.types';

export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface DayHours {
  open: string;
  close: string;
  isClosed?: boolean;
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  [key: string]: DayHours | undefined;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicOfferingProcedure {
  clinic: Clinic;
  pricing: ClinicProcedurePricing;
}
