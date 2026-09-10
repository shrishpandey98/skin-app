import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_CLINICS, MOCK_DOCTORS, MOCK_REVIEWS } from '../data/mockData';
import { Clinic, ClinicProcedure } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { Review } from '../types/review.types';
import { procedureKnowledgeBaseService } from './procedureKnowledgeBase.service';
import { supabase } from './supabase';

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

const DUMMY_CLINIC_IDS = new Set([
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
]);
const DUMMY_CLINIC_SLUGS = new Set([
  'dr-purvas-skin-and-laser-clinic',
  'aesthetica-skin-and-laser-clinic',
]);

const ALL_ACCOUNT_KEYS = [
  '@aura_clinic_registered_accounts_v3',
  '@aura_clinic_registered_accounts_v2',
  '@aura_clinic_registered_accounts_v1',
  '@aura_clinic_registered_accounts',
];

function deduplicateClinicProcedures(procs: any[], clinicId?: string): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];
  for (const p of procs || []) {
    // Exclude procedures created by another clinic
    const procOwnerClinic = p.procedures?.addedByClinicId || p.procedures?.clinicProfileId || p.addedByClinicId;
    if (clinicId && procOwnerClinic && procOwnerClinic !== clinicId) {
      continue;
    }

    const key = (p.procedures?.slug || p.procedure?.slug || p.procedureId || p.id || '')
      .toLowerCase()
      .replace(/^cp_/, '')
      .replace(/^proc_/, '')
      .trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }
  return unique;
}

function attachClinicSpecificProcedures(clinic: Clinic): Clinic {
  const customProcs = procedureKnowledgeBaseService
    .getSynchronousList()
    .filter(
      (p) =>
        (p.addedByClinicId && (p.addedByClinicId === clinic.id || p.addedByClinicId === clinic.slug)) ||
        (p.clinicProfileId && (p.clinicProfileId === clinic.id || p.clinicProfileId === clinic.slug))
    );

  const customClinicProcs = customProcs.map((cp) => ({
    id: `cp_${cp.id}`,
    clinicId: clinic.id,
    procedureId: cp.id,
    priceFrom: 3500,
    priceUnit: cp.category === 'aesthetics' ? 'per unit / session' : 'per session',
    isAvailable: true,
    procedure: cp,
    procedures: cp,
  }));

  const merged = deduplicateClinicProcedures(
    [...(clinic.procedures || []), ...customClinicProcs],
    clinic.id
  );

  return {
    ...clinic,
    procedures: merged,
  };
}

async function syncPublishedClinicsFromStorage(): Promise<Clinic[]> {
  try {
    const publishedClinicsMap = new Map<string, Clinic>();
    const unpublishedSlugs = new Set<string>();

    // 1. Fetch live active clinics from Supabase Cloud DB
    try {
      const { data: dbClinics, error } = await supabase
        .from('clinics')
        .select(`
          *,
          clinic_doctors (
            doctors (*)
          )
        `)
        .eq('is_active', true);

      if (!error && dbClinics && dbClinics.length > 0) {
        for (const data of dbClinics) {
          // Ignore legacy template dummy clinics in DB
          if (DUMMY_CLINIC_IDS.has(data.id) || DUMMY_CLINIC_SLUGS.has(data.slug)) {
            continue;
          }

          const doctors: Doctor[] = (data.clinic_doctors || []).map((cd: any) => ({
            id: cd.doctors?.id || `doc_${Date.now()}`,
            name: cd.doctors?.name || 'Doctor',
            slug: cd.doctors?.slug || 'doctor',
            photoUrl: cd.doctors?.photo_url || '',
            qualification: cd.doctors?.qualification || '',
            specialization: cd.doctors?.specialization || 'Dermatology',
            experienceYears: cd.doctors?.experience_years || 5,
            bio: cd.doctors?.bio || '',
            rating: cd.doctors?.rating || 5.0,
            reviewCount: cd.doctors?.review_count || 0,
            clinicId: data.id,
            clinicName: data.name,
            clinicAddress: data.address,
            isActive: cd.doctors?.is_active !== false,
          }));

          const clinic: Clinic = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description || '',
            logoUrl: data.logo_url || '',
            coverImageUrl: data.cover_image_url || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            area: data.area || 'Chandigarh',
            city: data.city || 'Chandigarh',
            state: data.state || 'Chandigarh',
            latitude: Number(data.latitude) || 30.7333,
            longitude: Number(data.longitude) || 76.7794,
            openingHours: data.opening_hours || {},
            verificationStatus: data.verification_status || 'verified',
            rating: Number(data.rating) || 5.0,
            reviewCount: Number(data.review_count) || 0,
            specialties: data.specialties || [],
            galleryImages: data.gallery_images || [],
            isActive: true,
            doctors: doctors,
          };
          publishedClinicsMap.set(clinic.slug, clinic);
        }
      }
    } catch (e) {
      // Offline / Supabase connection notice
    }

    // 2. Check Accounts Map (All registered clinic accounts across all storage versions)
    for (const key of ALL_ACCOUNT_KEYS) {
      const rawAccounts = await AsyncStorage.getItem(key);
      if (rawAccounts) {
        try {
          const accounts: Record<string, any> = JSON.parse(rawAccounts);
          for (const email of Object.keys(accounts)) {
            const acc = accounts[email];
            const clinic = acc?.activeClinic;
            const slug = clinic?.slug || clinic?.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (acc && (acc.isClinicPublished === true || acc.activeClinic?.isActive === true)) {
              if (clinic && (clinic.name || clinic.slug)) {
                const fullClinic: Clinic = {
                  ...clinic,
                  id: clinic.id || `clinic_${Date.now()}`,
                  name: clinic.name || 'Aesthetic Clinic',
                  slug: slug || `clinic-${Date.now()}`,
                  isActive: true,
                  doctors: acc.clinicDoctors || clinic.doctors || [],
                  procedures: deduplicateClinicProcedures(acc.clinicProcedures || clinic.procedures || []),
                };
                publishedClinicsMap.set(fullClinic.slug, fullClinic);
              }
            } else if (acc && acc.isClinicPublished === false && slug) {
              unpublishedSlugs.add(slug);
            }
          }
        } catch (e) {}
      }
    }

    // 3. Check Single Custom Profile & Published State
    const [rawPublished, rawProfile, rawDoctors, rawProcedures] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_PUBLISHED),
      AsyncStorage.getItem(STORAGE_KEY_CLINIC_PROFILE),
      AsyncStorage.getItem(STORAGE_KEY_DOCTORS_LIST),
      AsyncStorage.getItem(STORAGE_KEY_CLINIC_PROCEDURES),
    ]);

    if (rawProfile) {
      try {
        const clinic: Clinic = JSON.parse(rawProfile);
        const slug = clinic.slug || clinic.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (rawPublished === 'true') {
          const doctors: Doctor[] = rawDoctors ? JSON.parse(rawDoctors) : [];
          const procedures = rawProcedures ? JSON.parse(rawProcedures) : [];

          if (clinic && (clinic.name || clinic.slug)) {
            const fullClinic: Clinic = {
              ...clinic,
              isActive: true,
              doctors: doctors.length > 0 ? doctors : clinic.doctors || [],
              procedures: deduplicateClinicProcedures(procedures.length > 0 ? procedures : clinic.procedures || []),
              slug: slug || 'aura-clinic',
            };
            publishedClinicsMap.set(fullClinic.slug, fullClinic);
          }
        } else if (rawPublished === 'false' && slug) {
          unpublishedSlugs.add(slug);
        }
      } catch (e) {}
    }

    // Remove any clinics explicitly unpublished
    unpublishedSlugs.forEach((slug) => {
      publishedClinicsMap.delete(slug);
    });

    const allPublished = Array.from(publishedClinicsMap.values()).map(attachClinicSpecificProcedures);

    // Sync memory arrays so other parts of the app find doctors & clinics
    allPublished.forEach((clinic) => {
      const idx = MOCK_CLINICS.findIndex((c) => c.slug === clinic.slug || c.id === clinic.id);
      if (idx >= 0) {
        MOCK_CLINICS[idx] = clinic;
      } else {
        MOCK_CLINICS.push(clinic);
      }

      if (clinic.doctors) {
        clinic.doctors.forEach((d) => {
          const docIdx = MOCK_DOCTORS.findIndex((md) => md.id === d.id || md.slug === d.slug);
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
    console.warn('Error loading published clinics:', e);
    return [];
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
    let clinic = clinics.find((c) => c.slug === slug || c.id === slug);
    if (!clinic) {
      clinic = MOCK_CLINICS.find((c) => c.slug === slug || c.id === slug);
    }
    if (!clinic) return null;

    return attachClinicSpecificProcedures(clinic);
  },

  getDoctorsForClinic: async (clinicSlug: string): Promise<Doctor[]> => {
    const clinic = await clinicsService.getClinicBySlug(clinicSlug);
    if (!clinic) return [];
    return clinic.doctors || [];
  },

  getReviewsForClinic: async (clinicId: string): Promise<Review[]> => {
    return MOCK_REVIEWS.filter((r) => r.clinicId === clinicId);
  },

  refreshPublishedClinics: async (): Promise<Clinic[]> => {
    return syncPublishedClinicsFromStorage();
  },
};
