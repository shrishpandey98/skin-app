import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STORAGE_KEY_ACCOUNTS_MAP = '@aura_clinic_registered_accounts_v3';
const STORAGE_KEY_CLINIC_PROFILE = '@aura_clinic_custom_profile';
const STORAGE_KEY_PUBLISHED = '@aura_clinic_published_state';
const STORAGE_KEY_DOCTORS_LIST = '@aura_clinic_doctors_list';
const STORAGE_KEY_CLINIC_PROCEDURES = '@aura_clinic_procedures_list';

async function syncPublishedClinicsFromStorage(): Promise<Clinic[]> {
  try {
    const publishedClinicsMap = new Map<string, Clinic>();

    // 1. Check Accounts Map (All registered clinic accounts)
    const rawAccounts = await AsyncStorage.getItem(STORAGE_KEY_ACCOUNTS_MAP);
    if (rawAccounts) {
      try {
        const accounts: Record<string, any> = JSON.parse(rawAccounts);
        for (const email of Object.keys(accounts)) {
          const acc = accounts[email];
          if (acc && (acc.isClinicPublished === true || acc.activeClinic?.isActive === true)) {
            const clinic = acc.activeClinic;
            if (clinic && (clinic.name || clinic.slug)) {
              const fullClinic: Clinic = {
                ...clinic,
                isActive: true,
                doctors: acc.clinicDoctors || clinic.doctors || [],
                procedures: acc.clinicProcedures || clinic.procedures || [],
                slug:
                  clinic.slug ||
                  clinic.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
                  'aura-clinic',
              };
              publishedClinicsMap.set(fullClinic.id || fullClinic.slug, fullClinic);
            }
          }
        }
      } catch (e) {}
    }

    // 2. Check Single Custom Profile & Published State
    const [rawPublished, rawProfile, rawDoctors, rawProcedures] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_PUBLISHED),
      AsyncStorage.getItem(STORAGE_KEY_CLINIC_PROFILE),
      AsyncStorage.getItem(STORAGE_KEY_DOCTORS_LIST),
      AsyncStorage.getItem(STORAGE_KEY_CLINIC_PROCEDURES),
    ]);

    if (rawPublished === 'true' && rawProfile) {
      try {
        const clinic: Clinic = JSON.parse(rawProfile);
        const doctors: Doctor[] = rawDoctors ? JSON.parse(rawDoctors) : [];
        const procedures = rawProcedures ? JSON.parse(rawProcedures) : [];

        if (clinic && (clinic.name || clinic.slug)) {
          const fullClinic: Clinic = {
            ...clinic,
            isActive: true,
            doctors: doctors.length > 0 ? doctors : clinic.doctors || [],
            procedures: procedures.length > 0 ? procedures : clinic.procedures || [],
            slug:
              clinic.slug ||
              clinic.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
              'aura-clinic',
          };
          publishedClinicsMap.set(fullClinic.id || fullClinic.slug, fullClinic);
        }
      } catch (e) {}
    }

    // 3. Include any existing MOCK_CLINICS in memory
    for (const c of MOCK_CLINICS) {
      if (c && c.isActive !== false && (c.name || c.slug)) {
        publishedClinicsMap.set(c.id || c.slug, c);
      }
    }

    const allPublished = Array.from(publishedClinicsMap.values());

    // 4. Sync memory arrays so other parts of the app find doctors & clinics
    allPublished.forEach((clinic) => {
      const idx = MOCK_CLINICS.findIndex((c) => c.id === clinic.id || c.slug === clinic.slug);
      if (idx >= 0) {
        MOCK_CLINICS[idx] = clinic;
      } else {
        MOCK_CLINICS.push(clinic);
      }

      if (clinic.doctors) {
        clinic.doctors.forEach((d) => {
          const docIdx = MOCK_DOCTORS.findIndex((md) => md.id === d.id);
          if (docIdx >= 0) {
            MOCK_DOCTORS[docIdx] = d;
          } else {
            MOCK_DOCTORS.push(d);
          }
        });
      }
    });

    return allPublished;
  } catch (e) {
    console.warn('Error loading published clinics from storage:', e);
    return MOCK_CLINICS.filter((c) => c.isActive !== false);
  }
}

export const clinicsService = {
  getAllClinics: async (filters?: ClinicFilters): Promise<Clinic[]> => {
    const published = await syncPublishedClinicsFromStorage();
    let results = [...published].filter((c) => c.isActive !== false);

    if (filters?.area) {
      results = results.filter((c) => c.area?.toLowerCase().includes(filters.area!.toLowerCase()));
    }

    if (filters?.verifiedOnly) {
      results = results.filter((c) => c.verificationStatus === 'verified');
    }

    if (filters?.minRating) {
      results = results.filter((c) => (c.rating ?? 5) >= filters.minRating!);
    }

    if (filters?.procedureSlug) {
      results = results.filter((c) =>
        c.procedures?.some(
          (cp) =>
            cp.procedureId?.includes(filters.procedureSlug!) ||
            cp.procedure?.slug === filters.procedureSlug
        )
      );
    }

    // Deterministic Sorting:
    // Recommended: Verified first, then highest rating
    if (filters?.sortBy === 'rating') {
      results.sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));
    } else if (filters?.sortBy === 'reviews') {
      results.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    } else {
      // Default: Recommended
      results.sort((a, b) => {
        if (a.verificationStatus === 'verified' && b.verificationStatus !== 'verified') return -1;
        if (b.verificationStatus === 'verified' && a.verificationStatus !== 'verified') return 1;
        return (b.rating ?? 5) - (a.rating ?? 5);
      });
    }

    return results;
  },

  getClinicBySlug: async (slug: string): Promise<Clinic | null> => {
    const clinics = await syncPublishedClinicsFromStorage();
    const clinic = clinics.find((c) => c.slug === slug || c.id === slug);
    if (!clinic) return null;

    // Attach clinic doctors
    const doctors = clinic.doctors && clinic.doctors.length > 0
      ? clinic.doctors
      : MOCK_DOCTORS.filter((d) => d.clinicId === clinic.id);

    return {
      ...clinic,
      doctors,
    };
  },

  getDoctorsForClinic: async (clinicSlug: string): Promise<Doctor[]> => {
    const clinic = await clinicsService.getClinicBySlug(clinicSlug);
    if (!clinic) return [];
    if (clinic.doctors && clinic.doctors.length > 0) return clinic.doctors;
    return MOCK_DOCTORS.filter((d) => d.clinicId === clinic.id);
  },

  getReviewsForClinic: async (clinicId: string): Promise<Review[]> => {
    return MOCK_REVIEWS.filter((r) => r.clinicId === clinicId);
  },

  refreshPublishedClinics: async (): Promise<Clinic[]> => {
    return syncPublishedClinicsFromStorage();
  },
};
