export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  profileImageUrl?: string;
  city: string;
  savedClinics?: string[]; // clinic IDs
  savedProcedures?: string[]; // procedure IDs
  createdAt?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'booking_rescheduled' | 'general';
  title: string;
  body: string;
  isRead: boolean;
  appointmentId?: string;
  createdAt: string;
}
