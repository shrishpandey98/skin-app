export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  clinicId?: string;
  doctorId?: string;
  rating: number;
  reviewText: string;
  treatmentName?: string;
  isVerifiedBooking?: boolean;
  createdAt: string;
}
