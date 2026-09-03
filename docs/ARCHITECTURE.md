# Architecture Document
## Aesthetic Clinics & Procedures Marketplace

**Version**: 1.0  
**Date**: September 2026  
**Status**: Approved for Implementation  

---

## 1. Guiding Principles

1. **One shared backend, multiple future clients.** Customer App and future Clinic App share the same database and auth. No separate DBs.
2. **Modular monolith over microservices.** Single Supabase backend, logically separated into modules. No distributed complexity.
3. **Simplest thing that works.** No over-engineering. MVP ships fast and is reliable.
4. **Data integrity over application logic.** Constraints, foreign keys, and RLS enforced at the database layer — not just in the app.
5. **Pricing always belongs to the clinic.** `clinic_procedures.price_from` is the single source of truth for pricing. Never `procedures.price`.
6. **Future-proof, not future-built.** Schema supports future Clinic App via RLS roles, but no clinic-facing code is written now.

---

## 2. System Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   CUSTOMER MOBILE APP                    │
│              React Native + Expo (TypeScript)            │
└────────────────────────┬─────────────────────────────────┘
                         │ Supabase JS SDK (REST + Realtime)
┌────────────────────────▼─────────────────────────────────┐
│                    SUPABASE PLATFORM                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Auth    │  │PostgreSQL│  │ Storage  │  │  Edge   │  │
│  │  (OTP)   │  │(primary) │  │(images)  │  │  Funcs  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│                   Row Level Security                     │
└──────────────────────────────────────────────────────────┘
                         │
              (same backend — future clients)
┌────────────────────────▼─────────────────────────────────┐
│   Future Clinic App │ Future Admin Panel │ Future Web     │
│   (not built now)   │ (not built now)    │ (not built now)│
└──────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Mobile framework | React Native + Expo SDK 51 | Cross-platform (iOS + Android), fast iteration with Expo Go |
| Language | TypeScript | Type safety across frontend + API boundaries |
| Navigation | React Navigation v6 | Industry standard, well-supported with Expo |
| Server state | TanStack Query (React Query) | Caching, pagination, background refresh |
| UI state | Zustand | Minimal boilerplate, simple stores |
| Backend | Supabase | Managed Postgres + Auth + Storage + RLS |
| Database | PostgreSQL (via Supabase) | Relational, mature, RLS support |
| Auth | Supabase Auth — Email OTP | No Twilio required; can upgrade to Phone OTP later |
| Storage | Supabase Storage | Clinic images, procedure images, doctor photos |
| Fonts | expo-google-fonts (Inter) | Clean, modern, free |
| Icons | @expo/vector-icons | Bundled with Expo |
| Date handling | date-fns | Lightweight, tree-shakeable |
| Analytics | Custom thin wrapper | No external dep for MVP; swap in Mixpanel later |

---

## 4. Frontend Architecture

### 4.1 Directory Structure

```
skin-app/
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
├── src/
│   ├── app/
│   │   └── index.ts              # Entry point
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # Root stack (auth gate)
│   │   ├── TabNavigator.tsx      # Bottom 3-tab navigator
│   │   ├── HomeStack.tsx         # Home tab stack
│   │   ├── ProceduresStack.tsx   # Procedures tab stack
│   │   ├── ClinicsStack.tsx      # Clinics tab stack
│   │   ├── ProfileStack.tsx      # Profile modal stack
│   │   ├── BookingStack.tsx      # Booking modal stack
│   │   └── types.ts              # Navigation type definitions
│   ├── screens/
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── procedures/
│   │   │   ├── ProceduresScreen.tsx
│   │   │   └── ProcedureDetailScreen.tsx
│   │   ├── clinics/
│   │   │   ├── ClinicsScreen.tsx
│   │   │   ├── ClinicDetailScreen.tsx
│   │   │   └── DoctorProfileScreen.tsx
│   │   ├── search/
│   │   │   └── SearchResultsScreen.tsx
│   │   ├── booking/
│   │   │   ├── SelectDoctorScreen.tsx
│   │   │   ├── SelectProcedureScreen.tsx
│   │   │   ├── SelectDateTimeScreen.tsx
│   │   │   ├── ConfirmDetailsScreen.tsx
│   │   │   ├── ReviewBookingScreen.tsx
│   │   │   └── BookingSuccessScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── MyAppointmentsScreen.tsx
│   │   │   ├── AppointmentDetailScreen.tsx
│   │   │   ├── SavedItemsScreen.tsx
│   │   │   └── PersonalDetailsScreen.tsx
│   │   ├── notsure/
│   │   │   ├── ConcernSelectScreen.tsx
│   │   │   ├── ConcernQuestionsScreen.tsx
│   │   │   └── ConcernResultsScreen.tsx
│   │   └── auth/
│   │       ├── WelcomeScreen.tsx
│   │       ├── LoginScreen.tsx
│   │       └── OTPVerifyScreen.tsx
│   ├── components/
│   │   ├── cards/
│   │   │   ├── ProcedureCard.tsx
│   │   │   ├── ClinicCard.tsx
│   │   │   ├── DoctorCard.tsx
│   │   │   ├── BookingCard.tsx
│   │   │   └── ReviewCard.tsx
│   │   ├── ui/
│   │   │   ├── PrimaryButton.tsx
│   │   │   ├── SecondaryButton.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterChip.tsx
│   │   │   ├── RatingBadge.tsx
│   │   │   ├── VerifiedBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── PriceTag.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   └── FAQItem.tsx
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── ScreenWrapper.tsx
│   │   │   └── BottomSheet.tsx
│   │   └── states/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingState.tsx
│   │       ├── SkeletonCard.tsx
│   │       └── ErrorState.tsx
│   ├── services/
│   │   ├── supabase.ts
│   │   ├── auth.service.ts
│   │   ├── procedures.service.ts
│   │   ├── clinics.service.ts
│   │   ├── doctors.service.ts
│   │   ├── appointments.service.ts
│   │   ├── favorites.service.ts
│   │   ├── reviews.service.ts
│   │   ├── search.service.ts
│   │   ├── notifications.service.ts
│   │   └── analytics.service.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── search.store.ts
│   │   ├── location.store.ts
│   │   └── notification.store.ts
│   ├── hooks/
│   │   ├── useProcedures.ts
│   │   ├── useClinics.ts
│   │   ├── useDoctors.ts
│   │   ├── useAppointments.ts
│   │   ├── useFavorites.ts
│   │   ├── useSearch.ts
│   │   └── useAuth.ts
│   ├── types/
│   │   ├── procedure.types.ts
│   │   ├── clinic.types.ts
│   │   ├── doctor.types.ts
│   │   ├── appointment.types.ts
│   │   ├── review.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   ├── constants/
│   │   ├── theme.ts              # Colors, typography, spacing, shadows
│   │   ├── categories.ts         # Procedure category definitions
│   │   └── config.ts             # App config, feature flags
│   └── utils/
│       ├── formatters.ts         # Price, date, rating formatters
│       ├── validators.ts
│       └── helpers.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── seed/
│   │   ├── procedures.sql
│   │   ├── clinics.sql
│   │   ├── doctors.sql
│   │   ├── clinic_procedures.sql
│   │   ├── clinic_doctors.sql
│   │   ├── reviews.sql
│   │   └── concern_questions.sql
│   └── policies/
│       └── rls_policies.sql
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── tsconfig.json
├── package.json
└── .env
```

### 4.2 Navigation Architecture

```
RootNavigator (Stack)
├── [Unauthenticated] AuthStack
│   ├── WelcomeScreen
│   ├── LoginScreen
│   └── OTPVerifyScreen
│
└── [Authenticated / Public] TabNavigator
    ├── Tab: HomeStack
    │   ├── HomeScreen
    │   ├── SearchResultsScreen (from search bar)
    │   └── [shared screens accessible from home]
    │
    ├── Tab: ProceduresStack
    │   ├── ProceduresScreen
    │   └── ProcedureDetailScreen
    │
    └── Tab: ClinicsStack
        ├── ClinicsScreen
        ├── ClinicDetailScreen
        └── DoctorProfileScreen

Modal Stacks (presented over tabs)
├── ProfileStack (from top-right icon)
│   ├── ProfileScreen
│   ├── MyAppointmentsScreen
│   ├── AppointmentDetailScreen
│   ├── SavedItemsScreen
│   └── PersonalDetailsScreen
│
├── BookingStack (from any "Book Appointment" CTA)
│   ├── SelectDoctorScreen
│   ├── SelectProcedureScreen
│   ├── SelectDateTimeScreen
│   ├── ConfirmDetailsScreen
│   ├── ReviewBookingScreen
│   └── BookingSuccessScreen
│
└── NotSureStack (from home action)
    ├── ConcernSelectScreen
    ├── ConcernQuestionsScreen
    └── ConcernResultsScreen

Shared Screens (reachable from multiple tabs via push)
├── ProcedureDetailScreen
├── ClinicDetailScreen
└── DoctorProfileScreen
```

### 4.3 State Management Strategy

```
Server State (TanStack Query)          UI / Session State (Zustand)
─────────────────────────────          ────────────────────────────
procedures list + detail               useAuthStore
  ↳ cache: 10 min                        └── session, user profile
clinics list + detail                  useLocationStore
  ↳ cache: 10 min                        └── selected city
doctors by clinic                      useSearchStore
  ↳ cache: 5 min                         └── query, filters, sort
appointments (own)                     useNotificationStore
  ↳ cache: 1 min, invalidated on          └── unread count
    booking/cancel/reschedule
reviews (clinic/doctor)
  ↳ cache: 10 min
```

---

## 5. Database Architecture

### 5.1 Complete Schema

```sql
-- ENUMS
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE favorite_entity_type AS ENUM ('clinic', 'procedure');
CREATE TYPE notification_type AS ENUM ('booking_confirmed', 'booking_cancelled', 'booking_reminder', 'booking_rescheduled', 'account');
CREATE TYPE procedure_category AS ENUM ('skin', 'hair', 'injectables', 'laser', 'anti_ageing', 'body');
CREATE TYPE user_role AS ENUM ('customer', 'clinic_admin', 'doctor', 'platform_admin');

-- USERS (mirrors auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  email TEXT,
  profile_image_url TEXT,
  city TEXT DEFAULT 'Chandigarh',
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLINICS
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Chandigarh',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_hours JSONB,     -- { mon: {open:"09:00", close:"19:00"}, ... }
  verification_status verification_status DEFAULT 'unverified',
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_verification ON clinics(verification_status);
CREATE INDEX idx_clinics_rating ON clinics(rating DESC);

-- PROCEDURES
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category procedure_category NOT NULL,
  short_description TEXT,
  description TEXT,
  hero_image_url TEXT,
  common_uses TEXT[],
  benefits TEXT[],
  what_to_expect TEXT,
  sessions_info TEXT,
  downtime TEXT,
  considerations TEXT[],
  faqs JSONB[],            -- [{ question: "", answer: "" }]
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_procedures_category ON procedures(category);
CREATE INDEX idx_procedures_active ON procedures(is_active);

-- DOCTORS
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  qualification TEXT,
  specialization TEXT,
  experience_years INTEGER,
  bio TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLINIC ↔ DOCTOR JUNCTION
CREATE TABLE clinic_doctors (
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (clinic_id, doctor_id)
);

-- CLINIC ↔ PROCEDURE JUNCTION + PRICING
CREATE TABLE clinic_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  price_from DECIMAL(10, 2),
  price_to DECIMAL(10, 2),
  price_unit TEXT,          -- "per unit", "per session", "onwards"
  description TEXT,         -- clinic-specific procedure notes
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinic_id, procedure_id)
);
CREATE INDEX idx_clinic_procedures_procedure ON clinic_procedures(procedure_id);
CREATE INDEX idx_clinic_procedures_clinic ON clinic_procedures(clinic_id);

-- APPOINTMENTS
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  doctor_id UUID REFERENCES doctors(id),
  procedure_id UUID REFERENCES procedures(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  doctor_id UUID REFERENCES doctors(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  status review_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT review_target CHECK (clinic_id IS NOT NULL OR doctor_id IS NOT NULL)
);
CREATE INDEX idx_reviews_clinic ON reviews(clinic_id);
CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);

-- FAVORITES
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type favorite_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- CLINIC IMAGES (gallery)
CREATE TABLE clinic_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONCERN QUESTIONS (Not Sure flow — config driven)
CREATE TABLE concern_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concern_category TEXT NOT NULL,  -- "skin", "hair", "anti_ageing", "acne"
  question TEXT NOT NULL,
  options JSONB NOT NULL,           -- [{ key: "dullness", label: "Dullness & lack of glow" }]
  sort_order INTEGER DEFAULT 0
);

-- CONCERN → PROCEDURE MAPPINGS
CREATE TABLE concern_procedure_mappings (
  concern_category TEXT NOT NULL,
  answer_key TEXT NOT NULL,
  procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 1,
  PRIMARY KEY (concern_category, answer_key, procedure_id)
);
```

### 5.2 Entity Relationship Diagram

```
users ──────────────────────────────────┐
  │                                     │
  ├──< appointments >─── clinics        │
  │         │                │          │
  │         ├── doctors      ├──< clinic_doctors >── doctors
  │         └── procedures   │
  │                          └──< clinic_procedures >── procedures
  │
  ├──< favorites (entity_type = clinic|procedure)
  ├──< reviews >─── clinics / doctors
  └──< notifications
```

### 5.3 Row Level Security Policies

```sql
-- CUSTOMERS
-- Can read all active clinics, procedures, doctors (public browse)
CREATE POLICY "public read clinics" ON clinics FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public read procedures" ON procedures FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public read doctors" ON doctors FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public read clinic_procedures" ON clinic_procedures FOR SELECT USING (TRUE);
CREATE POLICY "public read clinic_doctors" ON clinic_doctors FOR SELECT USING (TRUE);
CREATE POLICY "public read reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "public read clinic_images" ON clinic_images FOR SELECT USING (TRUE);

-- Own appointments only
CREATE POLICY "users own appointments" ON appointments
  FOR ALL USING (auth.uid() = user_id);

-- Own favorites only
CREATE POLICY "users own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Own notifications only
CREATE POLICY "users own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Own profile
CREATE POLICY "users own profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Users can create reviews (own only)
CREATE POLICY "users create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users read own reviews" ON reviews
  FOR SELECT USING (auth.uid() = user_id OR status = 'approved');

-- FUTURE CLINIC ADMIN POLICIES (placeholder, not active)
-- Will check: auth.jwt() ->> 'role' = 'clinic_admin'
-- AND clinic_id = (their clinic from clinic_admins table)

-- PLATFORM ADMIN (uses service role key — bypasses RLS)
```

---

## 6. Services Layer

Each service is a pure TypeScript module. No class-based services. Named exports.

### Pattern

```typescript
// All services follow this pattern:
export async function getClinicById(id: string): Promise<Clinic> {
  const { data, error } = await supabase
    .from('clinics')
    .select(`
      *,
      clinic_procedures(*, procedures(*)),
      clinic_doctors(*, doctors(*)),
      clinic_images(*),
      reviews(*)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw new ServiceError(error.message, error.code);
  return data;
}
```

### Service Responsibilities

| Service | Key Methods |
|---|---|
| `auth.service` | `signInWithEmail`, `verifyOTP`, `signOut`, `getSession`, `onAuthStateChange` |
| `procedures.service` | `getProcedures`, `getProcedureBySlug`, `getProceduresByCategory`, `searchProcedures` |
| `clinics.service` | `getClinics`, `getClinicBySlug`, `getClinicsByProcedure`, `searchClinics`, `filterClinics` |
| `doctors.service` | `getDoctorsByClinic`, `getDoctorBySlug` |
| `appointments.service` | `createAppointment`, `getUserAppointments`, `cancelAppointment`, `rescheduleAppointment` |
| `favorites.service` | `addFavorite`, `removeFavorite`, `getUserFavorites`, `isFavorited` |
| `reviews.service` | `getClinicReviews`, `getDoctorReviews`, `createReview` |
| `search.service` | `globalSearch` (procedures + clinics + concerns, debounced) |
| `notifications.service` | `getNotifications`, `markAsRead`, `markAllRead` |
| `analytics.service` | `track(event, properties)` — thin wrapper, console in dev |

---

## 7. Data Flow

### 7.1 Procedure Discovery Flow

```
ProceduresScreen
  → useProcedures(category?)
      → procedures.service.getProcedures
          → Supabase: SELECT * FROM procedures WHERE category = ? AND is_active
              → [ProcedureCard] → navigate('ProcedureDetail', { slug })

ProcedureDetailScreen
  → useProcedureDetail(slug)
      → procedures.service.getProcedureBySlug
          → Supabase: SELECT * FROM procedures WHERE slug = ?
  → useClinicsForProcedure(procedureId)
      → clinics.service.getClinicsByProcedure
          → Supabase: SELECT clinics.*, cp.price_from, cp.price_unit
                      FROM clinics
                      JOIN clinic_procedures cp ON cp.clinic_id = clinics.id
                      WHERE cp.procedure_id = ? AND cp.is_available AND clinics.is_active
```

### 7.2 Booking Flow

```
BookingStack opens with { clinicId }
  1. SelectDoctorScreen
       → getDoctorsByClinic(clinicId)
       → user selects doctor (or skips)
  2. SelectProcedureScreen
       → getClinicProcedures(clinicId)
       → user selects procedure (or skips)
  3. SelectDateTimeScreen
       → user picks date from calendar
       → user picks time from available slots
  4. ConfirmDetailsScreen
       → pre-filled from auth user profile
       → user can add notes
  5. ReviewBookingScreen
       → summary: clinic + doctor + procedure + date + time + name
       → [Confirm Booking]
  6. appointments.service.createAppointment(bookingData)
       → Supabase: INSERT INTO appointments
       → trigger notification creation (DB trigger or edge function)
       → analytics.track('booking_completed', {...})
  7. BookingSuccessScreen
       → show confirmation
       → TanStack Query invalidates appointments cache
```

### 7.3 Search Flow

```
SearchBar (any screen)
  → onChange → debounce(300ms)
      → search.service.globalSearch(query)
          → Parallel queries:
              Supabase: SELECT id, name, slug FROM procedures WHERE name ILIKE '%?%' LIMIT 5
              Supabase: SELECT id, name, slug, city FROM clinics WHERE name ILIKE '%?%' LIMIT 5
              Local: match query against concern categories
          → Return: { procedures[], clinics[], concerns[] }
  → navigate('SearchResults', { query, results })
```

---

## 8. API Contract (Data Types)

```typescript
// Key TypeScript types — used across services, hooks, and screens

export interface Procedure {
  id: string;
  name: string;
  slug: string;
  category: ProcedureCategory;
  short_description: string;
  description: string;
  hero_image_url: string;
  common_uses: string[];
  benefits: string[];
  what_to_expect: string;
  sessions_info?: string;
  downtime: string;
  considerations: string[];
  faqs: FAQ[];
  is_active: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  phone: string;
  address: string;
  city: string;
  opening_hours: OpeningHours;
  verification_status: VerificationStatus;
  rating: number;
  review_count: number;
  clinic_procedures?: ClinicProcedure[];
  clinic_doctors?: ClinicDoctor[];
  clinic_images?: ClinicImage[];
}

export interface ClinicProcedure {
  id: string;
  clinic_id: string;
  procedure_id: string;
  price_from: number;
  price_to?: number;
  price_unit: string;
  is_available: boolean;
  procedures?: Procedure;   // joined
  clinics?: Clinic;         // joined
}

export interface Doctor {
  id: string;
  name: string;
  slug: string;
  photo_url: string;
  qualification: string;
  specialization: string;
  experience_years: number;
  bio: string;
  rating: number;
  review_count: number;
}

export interface Appointment {
  id: string;
  user_id: string;
  clinic_id: string;
  doctor_id?: string;
  procedure_id?: string;
  appointment_date: string;   // ISO date
  appointment_time: string;   // HH:mm
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  clinics?: Clinic;            // joined
  doctors?: Doctor;            // joined
  procedures?: Procedure;      // joined
}

export type ProcedureCategory = 'skin' | 'hair' | 'injectables' | 'laser' | 'anti_ageing' | 'body';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface FAQ {
  question: string;
  answer: string;
}

export interface OpeningHours {
  mon?: DayHours;
  tue?: DayHours;
  wed?: DayHours;
  thu?: DayHours;
  fri?: DayHours;
  sat?: DayHours;
  sun?: DayHours;
}

export interface DayHours {
  open: string;   // "09:00"
  close: string;  // "19:00"
  closed?: boolean;
}
```

---

## 9. Analytics Architecture

Thin wrapper pattern. Zero external dependencies for MVP. Can swap to Mixpanel, Amplitude, or PostHog later by changing only the analytics service.

```typescript
// src/services/analytics.service.ts

type AnalyticsEvent =
  | 'app_opened'
  | 'search_performed'
  | 'procedure_viewed'
  | 'clinic_viewed'
  | 'doctor_viewed'
  | 'booking_started'
  | 'booking_step_completed'
  | 'booking_completed'
  | 'booking_cancelled'
  | 'not_sure_flow_started'
  | 'concern_selected'
  | 'clinic_saved'
  | 'procedure_saved';

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  if (__DEV__) {
    console.log('[Analytics]', event, properties);
    return;
  }
  // Future: analytics_client.track(event, properties);
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (__DEV__) {
    console.log('[Analytics] identify', userId, traits);
    return;
  }
  // Future: analytics_client.identify(userId, traits);
}
```

---

## 10. Storage Architecture

Supabase Storage buckets:

| Bucket | Contents | Public? |
|---|---|---|
| `procedure-images` | Procedure hero images | ✅ Public |
| `clinic-images` | Clinic cover, logo, gallery | ✅ Public |
| `doctor-photos` | Doctor profile photos | ✅ Public |
| `user-avatars` | User profile photos | ✅ Public |

All buckets are public-read (no signed URLs needed for display).

Image naming convention:
```
procedure-images/{procedure-slug}/hero.jpg
clinic-images/{clinic-slug}/cover.jpg
clinic-images/{clinic-slug}/logo.jpg
clinic-images/{clinic-slug}/gallery/{n}.jpg
doctor-photos/{doctor-slug}/photo.jpg
```

---

## 11. Performance Strategy

| Concern | Strategy |
|---|---|
| List pagination | `limit(20).range()` on all list queries |
| Image loading | `expo-image` with built-in caching |
| Skeleton loading | Show skeleton cards while data loads |
| Query caching | TanStack Query with `staleTime: 10min` for procedures/clinics |
| Search debouncing | 300ms debounce on search input |
| Bundle size | No heavy dependencies; tree-shaking via Expo |
| Cold start | Minimal initial queries on app load |

---

## 12. Security

| Concern | Implementation |
|---|---|
| Auth | Supabase Auth — JWT tokens, auto-refresh |
| Data isolation | RLS policies on all tables |
| Booking access | `user_id = auth.uid()` enforced at DB level |
| Clinic data | Write access blocked for customers at DB level |
| Admin operations | Service role key never in mobile app |
| Environment vars | Supabase URL + anon key in `.env` (anon key is safe to expose) |
| Sensitive data | No medical data stored |

---

## 13. Future Extensibility Map

| Future Feature | What Needs to Change |
|---|---|
| Clinic App | Add `clinic_admins` table, RLS policies for `clinic_admin` role, new client app |
| Phone OTP auth | Supabase Auth config change — no schema change |
| Teleconsultation | Add `appointment_type` column to `appointments`, new booking flow screen |
| Online payments | Add `payment_status`, `payment_amount` to appointments; add payment provider |
| Sponsored listings | Add `is_sponsored`, `sponsored_until` to clinics; adjust sort logic |
| Doctor availability | Add `doctor_availability` table; modify booking flow |
| Advanced search | Add full-text search index (`tsvector`) to clinics and procedures |
| Push notifications | Expo Push tokens table + Edge Function for sending |
| Multi-city expansion | City already a first-class field; filter logic already city-aware |
| Web SEO layer | Slugs already on all entities; Next.js frontend can use same Supabase |

---

## 14. Environment Configuration

```
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# .env.local (not committed)
# No secrets needed — anon key is intentionally public
# Service role key only used in migrations/seed scripts locally
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 15. Development Workflow

```bash
# Start development
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android
npx expo start --android

# Type check
npx tsc --noEmit

# Run Supabase migrations (local dev)
supabase db push

# Seed data
supabase db reset  # applies migrations + seed
```

---

*End of Architecture Document v1.0*
