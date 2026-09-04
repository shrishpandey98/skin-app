import { NavigatorScreenParams } from '@react-navigation/native';
import { Procedure } from './procedure.types';
import { Clinic } from './clinic.types';
import { Doctor } from './doctor.types';
import { Appointment } from './appointment.types';

// Tab Navigator Types
export type MainTabParamList = {
  HomeTab: undefined;
  ProceduresTab: { initialCategory?: string } | undefined;
  ClinicsTab: { initialProcedureSlug?: string; initialArea?: string } | undefined;
};

// Home Stack Types
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProcedureDetail: { procedureSlug: string; procedureName?: string };
  ClinicDetail: { clinicSlug: string; clinicName?: string };
  DoctorProfile: { doctorSlug: string; doctorName?: string; clinicSlug?: string };
  SearchResults: { initialQuery?: string };
  CitySelector: undefined;
  Notifications: undefined;
};

// Procedures Stack Types
export type ProceduresStackParamList = {
  ProceduresScreen: { initialCategory?: string } | undefined;
  ProcedureDetail: { procedureSlug: string; procedureName?: string };
  ClinicDetail: { clinicSlug: string; clinicName?: string };
};

// Clinics Stack Types
export type ClinicsStackParamList = {
  ClinicsScreen: { initialProcedureSlug?: string; initialArea?: string } | undefined;
  ClinicDetail: { clinicSlug: string; clinicName?: string };
  DoctorProfile: { doctorSlug: string; doctorName?: string; clinicSlug?: string };
  ProcedureDetail: { procedureSlug: string; procedureName?: string };
};

// Not Sure Flow Stack Types
export type NotSureStackParamList = {
  ConcernSelect: undefined;
  ConcernQuestions: { concernId: string; concernLabel: string };
  ConcernResults: {
    concernId: string;
    concernLabel: string;
    selectedOptions: string[];
    matchingProcedureSlugs: string[];
  };
};

// Booking Flow Stack Types
export type BookingStackParamList = {
  SelectDoctor: {
    clinicSlug: string;
    preSelectedDoctorSlug?: string;
    preSelectedProcedureSlug?: string;
  };
  SelectProcedure: {
    clinicSlug: string;
    doctorSlug?: string;
    preSelectedProcedureSlug?: string;
  };
  SelectDateTime: {
    clinicSlug: string;
    doctorSlug?: string;
    procedureSlug?: string;
  };
  ConfirmDetails: {
    clinicSlug: string;
    doctorSlug?: string;
    procedureSlug?: string;
    appointmentDate: string;
    appointmentTime: string;
  };
  ReviewBooking: {
    clinicSlug: string;
    doctorSlug?: string;
    procedureSlug?: string;
    appointmentDate: string;
    appointmentTime: string;
    patientName: string;
    patientPhone: string;
    notes?: string;
  };
  BookingSuccess: {
    appointmentId: string;
    appointment: Appointment;
  };
};

// Profile Stack Types
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  MyAppointments: { initialTab?: 'upcoming' | 'past' | 'cancelled' } | undefined;
  AppointmentDetail: { appointmentId: string };
  SavedItems: { initialTab?: 'clinics' | 'procedures' } | undefined;
  PersonalDetails: undefined;
  HelpSupport: undefined;
  Settings: undefined;
};

// Auth Stack Types
export type AuthStackParamList = {
  WelcomeAuth: { returnScreen?: string; returnParams?: any };
  OtpVerification: { phoneOrEmail: string; isEmail?: boolean; returnScreen?: string; returnParams?: any };
};

export type RootStackParamList = {
  AuthScreen: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  ProceduresStack: NavigatorScreenParams<ProceduresStackParamList>;
  ClinicsStack: NavigatorScreenParams<ClinicsStackParamList>;
  
  // Modals & Overlays
  ProcedureDetailModal: { procedureSlug: string };
  ClinicDetailModal: { clinicSlug: string };
  DoctorProfileModal: { doctorSlug: string; clinicSlug?: string };
  SearchResultsModal: { initialQuery?: string };
  NotificationsModal: undefined;
  CitySelectorModal: undefined;
  
  // Feature Flow Stacks
  NotSureFlow: NavigatorScreenParams<NotSureStackParamList>;
  BookingFlow: NavigatorScreenParams<BookingStackParamList>;
  ProfileFlow: NavigatorScreenParams<ProfileStackParamList>;
  AuthFlow: NavigatorScreenParams<AuthStackParamList>;
};
