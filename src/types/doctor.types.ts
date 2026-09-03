export interface Doctor {
  id: string;
  name: string;
  slug: string;
  photoUrl: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  rating: number;
  reviewCount: number;
  clinicId?: string;
  clinicName?: string;
  clinicAddress?: string;
  proceduresOffered?: string[];
  isActive: boolean;
  createdAt?: string;
}
