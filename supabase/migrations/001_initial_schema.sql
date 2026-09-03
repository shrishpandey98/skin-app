-- AURA AESTHETICS & PROCEDURES MARKETPLACE
-- INITIAL SUPABASE SCHEMA & RLS MIGRATION

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE favorite_entity_type AS ENUM ('clinic', 'procedure');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('booking_confirmed', 'booking_cancelled', 'booking_reminder', 'booking_rescheduled', 'account');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE procedure_category AS ENUM ('skin', 'hair', 'injectables', 'laser', 'anti_ageing', 'body');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'clinic_admin', 'doctor', 'platform_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
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

-- 4. CLINICS TABLE
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  area TEXT NOT NULL DEFAULT 'Chandigarh',
  city TEXT NOT NULL DEFAULT 'Chandigarh',
  state TEXT NOT NULL DEFAULT 'Chandigarh',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  opening_hours JSONB,
  verification_status verification_status DEFAULT 'unverified',
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  gallery_images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinics_city ON public.clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_verification ON public.clinics(verification_status);
CREATE INDEX IF NOT EXISTS idx_clinics_rating ON public.clinics(rating DESC);

-- 5. PROCEDURES TABLE (PLATFORM CURATED)
CREATE TABLE IF NOT EXISTS public.procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  faqs JSONB[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procedures_category ON public.procedures(category);
CREATE INDEX IF NOT EXISTS idx_procedures_active ON public.procedures(is_active);

-- 6. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 7. CLINIC_DOCTORS (JUNCTION)
CREATE TABLE IF NOT EXISTS public.clinic_doctors (
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (clinic_id, doctor_id)
);

-- 8. CLINIC_PROCEDURES (JUNCTION + PRICING — CRITICAL RULE)
CREATE TABLE IF NOT EXISTS public.clinic_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  price_from DECIMAL(10, 2) NOT NULL,
  price_to DECIMAL(10, 2),
  price_unit TEXT DEFAULT 'per session',
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinic_id, procedure_id)
);

CREATE INDEX IF NOT EXISTS idx_clinic_procedures_procedure ON public.clinic_procedures(procedure_id);
CREATE INDEX IF NOT EXISTS idx_clinic_procedures_clinic ON public.clinic_procedures(clinic_id);

-- 9. APPOINTMENTS (IN-CLINIC BOOKING)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id),
  doctor_id UUID REFERENCES public.doctors(id),
  procedure_id UUID REFERENCES public.procedures(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- 10. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id),
  doctor_id UUID REFERENCES public.doctors(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  treatment_name TEXT,
  status review_status DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FAVORITES (SAVES)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entity_type favorite_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, entity_type, entity_id)
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  appointment_id UUID REFERENCES public.appointments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Marketplace Browsing
CREATE POLICY "Public can view active clinics" ON public.clinics FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active procedures" ON public.procedures FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active doctors" ON public.doctors FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view clinic procedures" ON public.clinic_procedures FOR SELECT USING (is_available = TRUE);
CREATE POLICY "Public can view clinic doctors" ON public.clinic_doctors FOR SELECT USING (TRUE);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');

-- Customer Policies (Authenticated)
CREATE POLICY "Users can manage own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read/update own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
