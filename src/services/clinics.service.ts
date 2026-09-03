import { MOCK_CLINICS, MOCK_DOCTORS, MOCK_REVIEWS } from '../data/mockData';
import { Clinic } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { Review } from '../types/review.types';

export interface ClinicFilters {
  area?: string | null;
  procedureSlug?: string | null;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: 'recommended' | 'rating' | 'reviews';
}

export const clinicsService = {
  getAllClinics: async (filters?: ClinicFilters): Promise<Clinic[]> => {
    await new Promise((r) => setTimeout(r, 100));
    let results = [...MOCK_CLINICS];

    if (filters?.area) {
      results = results.filter((c) => c.area.toLowerCase().includes(filters.area!.toLowerCase()));
    }

    if (filters?.verifiedOnly) {
      results = results.filter((c) => c.verificationStatus === 'verified');
    }

    if (filters?.minRating) {
      results = results.filter((c) => c.rating >= filters.minRating!);
    }

    if (filters?.procedureSlug) {
      results = results.filter((c) =>
        c.procedures?.some((cp) => cp.procedureId.includes(filters.procedureSlug!) || cp.procedure?.slug === filters.procedureSlug)
      );
    }

    // Deterministic Sorting:
    // Recommended: Verified first, then highest rating
    if (filters?.sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating);
    } else if (filters?.sortBy === 'reviews') {
      results.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // Default: Recommended
      results.sort((a, b) => {
        if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
        if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
        return b.rating - a.rating;
      });
    }

    return results;
  },

  getClinicBySlug: async (slug: string): Promise<Clinic | null> => {
    await new Promise((r) => setTimeout(r, 80));
    const clinic = MOCK_CLINICS.find((c) => c.slug === slug || c.id === slug);
    if (!clinic) return null;

    // Attach clinic doctors
    const doctors = MOCK_DOCTORS.filter((d) => d.clinicId === clinic.id);
    return {
      ...clinic,
      doctors,
    };
  },

  getDoctorsForClinic: async (clinicSlug: string): Promise<Doctor[]> => {
    const clinic = MOCK_CLINICS.find((c) => c.slug === clinicSlug || c.id === clinicSlug);
    if (!clinic) return [];
    return MOCK_DOCTORS.filter((d) => d.clinicId === clinic.id);
  },

  getReviewsForClinic: async (clinicId: string): Promise<Review[]> => {
    return MOCK_REVIEWS.filter((r) => r.clinicId === clinicId);
  },
};
