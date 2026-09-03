# Walkthrough — Aesthetic Clinics & Procedures Marketplace MVP

We have built the **Customer-Facing Mobile MVP** for the Aesthetic Clinics & Procedures Marketplace using **React Native + Expo SDK 57 (TypeScript)**, **React Navigation v6**, and **Supabase (PostgreSQL + RLS + Auth)**.

---

## 📱 What Was Built

### 1. Architecture & Documentation
- [`PRD.md`](file:///Users/shrishpandey/Desktop/skin-app/docs/PRD.md) — Complete 770+ line Product Requirements Document covering all 22 screens, 4 core entities, trust & safety principles, analytics funnel, and success metrics.
- [`ARCHITECTURE.md`](file:///Users/shrishpandey/Desktop/skin-app/docs/ARCHITECTURE.md) — Complete 920+ line System Architecture Document covering relational data model, RLS policies, navigation trees, and extensible shared-backend patterns for the future Clinic App.
- [`001_initial_schema.sql`](file:///Users/shrishpandey/Desktop/skin-app/supabase/migrations/001_initial_schema.sql) — Full PostgreSQL schema with tables, enums, indexes, and Row Level Security policies.

---

### 2. Design System & Tokens ([`theme.ts`](file:///Users/shrishpandey/Desktop/skin-app/src/constants/theme.ts))
- **Curated Aesthetic Palette (inspired by Dr. Purva Skin Clinic)**: Regal Antique Gold (`#AD904A`), Radiant Champagne (`#DEC481`), Deep Slate (`#36536B`), Clinical Aqua/Teal (`#3E9BAA`), Warm Alabaster (`#FAF9F6`), and Deep Charcoal typography (`#222222`).
- **Reusable UI Component Library**:
  - [`PrimaryButton`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/PrimaryButton.tsx) (primary, secondary, outline, ghost variants)
  - [`RatingBadge`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/RatingBadge.tsx) (stars, numeric rating, review count)
  - [`VerifiedBadge`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/VerifiedBadge.tsx) (verified clinic badge)
  - [`StatusBadge`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/StatusBadge.tsx) (appointment status indicators)
  - [`FilterChip`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/FilterChip.tsx) (interactive filter pills)
  - [`PriceTag`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/PriceTag.tsx) (Indian Rupee ₹ formatted rates)
  - [`SearchBar`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/SearchBar.tsx) (global debounced search)
  - [`TopBar`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/TopBar.tsx) (Location selector + Notifications + Profile)
  - [`FAQItem`](file:///Users/shrishpandey/Desktop/skin-app/src/components/ui/FAQItem.tsx) (collapsible accordion)
  - [`ProcedureCard`](file:///Users/shrishpandey/Desktop/skin-app/src/components/cards/ProcedureCard.tsx) (vertical and horizontal carousel cards, no universal price)
  - [`ClinicCard`](file:///Users/shrishpandey/Desktop/skin-app/src/components/cards/ClinicCard.tsx) (specialties, clinic-specific pricing highlight)
  - [`DoctorCard`](file:///Users/shrishpandey/Desktop/skin-app/src/components/cards/DoctorCard.tsx) (credentials, experience, specialization)
  - [`BookingCard`](file:///Users/shrishpandey/Desktop/skin-app/src/components/cards/BookingCard.tsx) (upcoming, past, cancelled appointment cards)
  - [`ReviewCard`](file:///Users/shrishpandey/Desktop/skin-app/src/components/cards/ReviewCard.tsx) (verified patient feedback)
  - [`EmptyState`](file:///Users/shrishpandey/Desktop/skin-app/src/components/states/EmptyState.tsx) & [`LoadingState`](file:///Users/shrishpandey/Desktop/skin-app/src/components/states/LoadingState.tsx)

---

### 3. Core Customer Screens & User Flows

```text
┌────────────────────────────────────────────────────────┐
│               THREE PRIMARY DISCOVERY PATHS             │
│                                                        │
│  1. Explore Procedures  2. Find Clinics  3. Not Sure?  │
└────────────────────────────────────────────────────────┘
```

1. **Home Discovery Surface** ([`HomeScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/home/HomeScreen.tsx)):
   - Location top bar (`Chandigarh ▼`)
   - Hero headline (`Your journey to confident you ✨`)
   - Search trigger
   - 3 Primary Discovery Action cards: *Explore Procedures*, *Find Clinics*, *Not Sure What You Need?*
   - Treatment categories carousel & Top-rated clinics carousel
   - The Aura Standard trust badge

2. **Procedures Library & Discovery Hub**:
   - [`ProceduresScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/procedures/ProceduresScreen.tsx): Category filtering (Skin, Hair, Injectables, Laser, Anti-ageing, Body) and search.
   - [`ProcedureDetailScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/procedures/ProcedureDetailScreen.tsx): Full single-scroll treatment education page (About, Common uses, Benefits, What to expect, Downtime, Considerations, FAQs) + **Clinics Offering [Procedure] with clinic-specific pricing**.

3. **Clinics Directory & Profiles**:
   - [`ClinicsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/clinics/ClinicsScreen.tsx): Deterministic sorting (Recommended, Highest Rated, Most Reviewed), verified filter, and search.
   - [`ClinicDetailScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/clinics/ClinicDetailScreen.tsx): Cover, About, **Procedures & Pricing table**, Doctors list, Clinic photo gallery, Patient reviews, Opening hours, Map & directions, and Sticky "Book Appointment" CTA.
   - [`DoctorProfileScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/clinics/DoctorProfileScreen.tsx): Doctor qualifications, bio, treatments handled, clinic affiliation, and direct booking CTA.

4. **"Not Sure What You Need?" Guided Flow**:
   - [`ConcernSelectScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/notsure/ConcernSelectScreen.tsx): Choose concern category (Skin, Hair, Anti-ageing, Acne & Scars, Pigmentation, Face contour).
   - [`ConcernQuestionsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/notsure/ConcernQuestionsScreen.tsx): 1–2 lightweight preference questions.
   - [`ConcernResultsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/notsure/ConcernResultsScreen.tsx): Compliant, non-prescriptive framing: *"These treatments may be relevant to your concern."*

5. **In-Clinic Appointment Booking Flow (Modal Stack)**:
   - [`SelectDoctorScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/booking/SelectDoctorScreen.tsx): Pick doctor or "Any Available Specialist".
   - [`SelectProcedureScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/booking/SelectProcedureScreen.tsx): Pick procedure or "General In-Clinic Consultation".
   - [`SelectDateTimeScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/booking/SelectDateTimeScreen.tsx): Interactive 10-day date carousel + Morning/Afternoon/Evening time slots.
   - [`ConfirmDetailsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/booking/ConfirmDetailsScreen.tsx): Patient name, phone, email, doctor notes.
   - [`ReviewBookingScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/booking/ReviewBookingScreen.tsx): Full summary with Zero Booking Fee assurance.
   - [`BookingSuccessScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/booking/BookingSuccessScreen.tsx): Confirmation card, Directions deep-link, Calendar option, and Profile navigation.

6. **Global Search & Modals**:
   - [`SearchResultsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/search/SearchResultsScreen.tsx): Multi-entity search across Procedures, Clinics, Doctors, and Concerns.
   - [`ProfileScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/profile/ProfileScreen.tsx): User details, quick counts, navigation to appointments and saves.
   - [`MyAppointmentsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/profile/MyAppointmentsScreen.tsx): Upcoming, Past, and Cancelled appointments with Reschedule and Cancel triggers.
   - [`AppointmentDetailScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/profile/AppointmentDetailScreen.tsx): Full appointment ticket and clinic contact.
   - [`SavedItemsScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/profile/SavedItemsScreen.tsx): Bookmarked clinics and treatments.
   - [`CitySelectorModalScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/profile/CitySelectorModalScreen.tsx): Chandigarh sectors & area filter.
   - [`NotificationsModalScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/profile/NotificationsModalScreen.tsx): System and booking updates.
   - [`WelcomeAuthScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/auth/WelcomeAuthScreen.tsx) & [`OtpVerificationScreen.tsx`](file:///Users/shrishpandey/Desktop/skin-app/src/screens/auth/OtpVerificationScreen.tsx): Phone/Email OTP authentication.

---

### 4. Realistic Seed Dataset ([`mockData.ts`](file:///Users/shrishpandey/Desktop/skin-app/src/data/mockData.ts))
- **3 Chandigarh Clinics**:
  1. *Aesthetica Skin & Laser Clinic* (Sector 17-C, Chandigarh — ★ 4.9, 230 reviews, Verified)
  2. *Glow Dermatology Centre* (Sector 35-C, Chandigarh — ★ 4.8, 180 reviews, Verified)
  3. *The Skin Studio by Dr. Mehak* (Sector 8-C, Chandigarh — ★ 4.9, 275 reviews, Verified)
- **6 Board-Certified Doctors**: Dr. Ananya Sharma (AIIMS), Dr. Vikramaditya Rathore, Dr. Simran Kaur (PGI), Dr. Kabir Sethi, Dr. Mehak Walia (BAD), Dr. Rohit Talwar.
- **12 Curated Procedures**: Botox, Dermal Fillers, Hydrafacial MD, Chemical Peel, Microneedling / Dermapen, Laser Hair Removal, Q-Switched Laser Toning, Acne Scar Subcision + Fractional, Pigmentation & Melasma Treatment, Skin Brightening & Medi-Facials, PRP Hair Restoration, Skin Tightening (HIFU & RF).
- **Clinic-Specific Pricing**: Every clinic has distinct pricing (e.g. Botox: ₹195/unit at Glow vs ₹220/unit at Aesthetica vs ₹240/unit at Skin Studio).

---

## 🔍 Validation Results

- **TypeScript Compilation**: `npx tsc --noEmit` passed with **0 errors**.
- **Dependencies**: All Expo, React Navigation, Supabase, TanStack Query, Zustand, Lucide Icons, and Async Storage packages configured and cleanly installed.

---

## 🚀 How to Run the App

```bash
# In the skin-app directory:
npx expo start
```
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator / Device
- Scan the QR code with Expo Go on a physical device
