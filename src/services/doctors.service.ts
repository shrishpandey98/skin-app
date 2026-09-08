import { Doctor } from '../types/doctor.types';
import { Review } from '../types/review.types';
import { MOCK_REVIEWS } from '../data/mockData';
import { clinicsService } from './clinics.service';

export const doctorsService = {
  getDoctorBySlug: async (slug: string): Promise<Doctor | null> => {
    const clinics = await clinicsService.getAllClinics();
    for (const clinic of clinics) {
      const doc = clinic.doctors?.find((d) => d.slug === slug || d.id === slug);
      if (doc) return doc;
    }
    return null;
  },

  getReviewsForDoctor: async (doctorId: string): Promise<Review[]> => {
    return MOCK_REVIEWS.filter((r) => r.doctorId === doctorId);
  },
};

