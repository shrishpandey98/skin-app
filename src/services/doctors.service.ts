import { MOCK_DOCTORS, MOCK_CLINICS } from '../data/mockData';
import { Doctor } from '../types/doctor.types';
import { Review } from '../types/review.types';
import { MOCK_REVIEWS } from '../data/mockData';

export const doctorsService = {
  getDoctorBySlug: async (slug: string): Promise<Doctor | null> => {
    await new Promise((r) => setTimeout(r, 60));
    const doc = MOCK_DOCTORS.find((d) => d.slug === slug || d.id === slug);
    if (!doc) return null;
    return doc;
  },

  getReviewsForDoctor: async (doctorId: string): Promise<Review[]> => {
    return MOCK_REVIEWS.filter((r) => r.doctorId === doctorId);
  },
};
