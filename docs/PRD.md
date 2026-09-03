# Product Requirements Document
## Aesthetic Clinics & Procedures Marketplace — Customer App MVP

**Version**: 1.0  
**Date**: September 2026  
**Status**: Draft — Pending Approval  
**Product Type**: Consumer Mobile Application  

---

## 1. Executive Summary

We are building a consumer-facing mobile marketplace for aesthetic dermatology. The product helps users discover aesthetic procedures, find trusted clinics and doctors, and book in-clinic appointments.

This is a **procedure discovery + clinic discovery + appointment booking marketplace**.

It is intentionally simple for MVP. The strategic challenge is not software complexity — it is marketplace liquidity: getting consumers to discover and book, and getting clinics to fulfil those bookings reliably.

---

## 2. Product Vision

> Help users discover aesthetic procedures, discover aesthetic clinics and doctors, learn about procedures, and book in-clinic appointments with confidence.

### What This Product Is

- A procedure education and discovery platform
- A clinic and doctor discovery platform
- An in-clinic appointment booking marketplace

### What This Product Is NOT

- Not an AI skin analysis product
- Not a teleconsultation product
- Not a treatment recommendation engine
- Not a medical diagnosis product
- Not a clinic management application
- Not a patient record system

---

## 3. Business Context

### Future Monetization (not built now)

| Revenue Stream | Timeline |
|---|---|
| Teleconsultation commissions | V2 |
| Sponsored clinic placements | V2 |
| Premium clinic profiles | V2 |
| Clinic SaaS features | V3 |

Do not build any of these now. They must however be architecturally possible without a rewrite.

### Strategic Risks

The primary business risks are not technical:

1. **Consumer distribution** — Getting users to download and use the app
2. **Clinic acquisition** — Getting quality clinics to list
3. **Marketplace liquidity** — Enough supply and demand to make the marketplace work
4. **Booking conversion** — Users completing the booking funnel
5. **Clinic activation** — Clinics responding to and fulfilling bookings

The architecture, performance, and UX must therefore serve these goals directly.

---

## 4. Architecture Principle

```
                    SHARED BACKEND
                         │
             ┌───────────┴───────────┐
             │                       │
       CUSTOMER APP            FUTURE CLINIC APP
       BUILD NOW               NOT BUILDING NOW
```

One shared PostgreSQL database. One shared auth system. Multiple future clients.

The customer app must not make architectural assumptions that would prevent the future Clinic App from using the same backend.

---

## 5. Target Users

### Primary — The Aesthetic Consumer

**Profile**: Urban adult, typically 22–45, interested in aesthetic treatments.  
**Motivation**: Wants to improve appearance but may not know what procedure is right for them, or which clinic to trust.  
**Friction points**: Unsure of what to get, unsure of pricing, unsure of clinic quality, trust barriers.  
**Jobs to be done**:
- Discover what procedures exist and what they do
- Understand realistic pricing
- Find a trusted, verified clinic nearby
- Book an appointment easily

### Secondary (future) — The Clinic / Doctor

Not the focus of this MVP. Future Clinic App will serve them.

---

## 6. Core Product Entities

### 6.1 Procedure

Platform-controlled content. Information is curated by the platform.

| Field | Notes |
|---|---|
| Name | e.g. Botox |
| Category | Skin / Hair / Injectables / Laser / Anti-ageing / Body |
| Short description | Used in cards and search |
| Description | Full rich content |
| Common uses | Bullet list |
| Benefits | Bullet list |
| What to expect | Text |
| Sessions / frequency | Where relevant |
| Downtime | Text |
| Considerations / risks | Text |
| FAQs | Structured Q&A |
| Hero image | Platform-managed |
| Related procedures | Cross-links |
| Clinics offering this procedure | Dynamic, from clinic_procedures |

> **Critical**: Procedures do NOT have a universal price. Pricing always belongs to the `clinic_procedure` relationship.

**MVP Procedure Set** (12 procedures):

| # | Procedure | Category |
|---|---|---|
| 1 | Botox | Injectables |
| 2 | Dermal Fillers | Injectables |
| 3 | Chemical Peel | Skin |
| 4 | Microneedling | Skin |
| 5 | Hydrafacial | Skin |
| 6 | Laser Hair Removal | Laser |
| 7 | Laser Toning | Laser |
| 8 | Acne Scar Treatment | Skin |
| 9 | Pigmentation Treatment | Skin |
| 10 | Skin Brightening | Skin |
| 11 | PRP Hair Treatment | Hair |
| 12 | Skin Tightening | Anti-ageing |

### 6.2 Clinic

Clinic profiles are the primary commercial unit.

| Field | Notes |
|---|---|
| Name | — |
| Slug | URL-safe, e.g. `aesthetica-skin-clinic` |
| Description | — |
| Logo | — |
| Cover image | — |
| Address | Full address |
| City / State | For filtering |
| Coordinates | Lat/lng for future map use |
| Opening hours | Structured JSON |
| Phone / Email | Contact |
| Verification status | `unverified` / `pending` / `verified` |
| Rating | Computed from reviews |
| Review count | — |
| Is active | Soft-delete |
| Procedures offered | Via clinic_procedures |
| Procedure-specific pricing | Via clinic_procedures |
| Doctors | Via clinic_doctors |
| Photos | Storage |
| Reviews | Via reviews table |

### 6.3 Doctor

Doctors are distinct entities linked to clinics.

| Field | Notes |
|---|---|
| Name | — |
| Slug | URL-safe |
| Photo | — |
| Qualification | e.g. MBBS, MD Dermatology |
| Specialization | — |
| Experience years | — |
| Bio | — |
| Rating | Computed |
| Review count | — |
| Clinic association | Via clinic_doctors |

A doctor may work at multiple clinics (future). For MVP, one clinic association is sufficient.

### 6.4 Appointment

MVP: In-clinic appointments only. No teleconsultation.

| Field | Notes |
|---|---|
| User | FK to users |
| Clinic | FK to clinics |
| Doctor | Optional FK to doctors |
| Procedure | Optional FK to procedures |
| Date | — |
| Time | — |
| Status | `pending` / `confirmed` / `completed` / `cancelled` / `rescheduled` |
| Notes | Optional |

Booking is free. No payment in MVP.

---

## 7. Information Architecture

### Bottom Navigation (3 tabs only)

```
HOME | PROCEDURES | CLINICS
```

No Bookings tab. No Profile tab. Bookings are inside Profile (accessed via top-right icon).

### Global Top Bar

```
[City Selector ▼]    [🔔]  [👤]
```

- Location selector → city selection modal
- Notification icon → notification list
- Profile icon → profile screen

---

## 8. Screen-by-Screen Requirements

### 8.1 Home Screen

**Purpose**: Primary discovery surface.

**Header**:
- Location: `Chandigarh ▼`
- Right: Notification icon + Profile icon

**Hero**:
- Headline: `Your journey to confident you ✨`
- Subheadline: `Discover treatments, find trusted clinics and book with ease.`

**Search Bar**:
- Placeholder: `Search procedures, clinics or concerns...`
- Global search — results include procedures, clinics, concerns

**Three Discovery Actions** (below search):

| Action | Description |
|---|---|
| Explore Procedures | Learn about treatments and find clinics offering them |
| Find Clinics | Search clinics and doctors near you |
| Not Sure What You Need? | Tell us your concern and explore treatment options |

**Additional Content**:
- Featured / Popular Procedures (horizontal scroll)
- Top Clinics in [City] (horizontal scroll)
- Treatment categories (grid of chips)

---

### 8.2 Procedures List Screen

**Header**: `Procedures`  
**Search bar**: `Search procedures...`  

**Category Filters** (chips):
```
All | Skin | Hair | Injectables | Laser | Anti-ageing | Body
```

**Procedure Cards**:
- Hero image
- Name
- Short description
- Category chip
- Chevron / CTA

> Do NOT show price on procedure cards. Price varies by clinic.

---

### 8.3 Procedure Detail Screen

Full single-scroll page.

**Sections in order**:
1. Hero image
2. Name + category chip
3. Short description
4. About this procedure
5. Common uses
6. Benefits
7. What to expect
8. Sessions / frequency
9. Downtime
10. Considerations / risks
11. FAQs (collapsible)
12. **Clinics offering this procedure** — clinic cards with procedure-specific pricing
13. Related procedures

**Clinics offering procedure card**:
```
[Clinic Image]
Aesthetica Skin Clinic
Sector 17, Chandigarh
★ 4.8  (124 reviews)  ✓ Verified
Botox from ₹150/unit
[Book Appointment →]
```

---

### 8.4 Clinics List Screen

**Header**: `Clinics`  
**Search bar**: `Search clinics, doctors or locations...`

**Filters**:
- Location (city/area)
- Procedure
- Rating (min rating)
- Verification status

**Sort options**:
- Recommended (default — verified > rating)
- Highest rated
- Most reviewed

**Clinic Cards** (vertical list):
- Cover/logo image
- Name
- Verification badge
- Rating + review count
- Location (city, area)
- Key procedure categories
- "Book Appointment" CTA

---

### 8.5 Clinic Detail Screen

Primary commercial page — must be high quality.

**Sticky header**: Clinic name + Book Appointment CTA

**Sections**:
1. Cover image (with logo overlay)
2. Name + Verification badge
3. Rating + review count + location
4. About
5. **Procedures & Pricing** (list from clinic_procedures)
   ```
   Botox                    From ₹150/unit
   Dermal Fillers           From ₹8,000/session
   Chemical Peel            From ₹2,500/session
   ```
6. **Doctors** (horizontal cards)
7. **Photos** (horizontal gallery)
8. **Reviews** (sample + "See all")
9. Opening hours
10. Address + Get Directions button
11. Sticky footer: `[Book Appointment]`

---

### 8.6 Doctor Profile Screen

Accessible from clinic detail.

**Sections**:
1. Photo + name
2. Qualification + specialization
3. Experience (X years)
4. Clinic association
5. Bio
6. Procedures they handle
7. Rating + reviews
8. CTA: `Book Appointment`

---

### 8.7 Booking Flow (Modal Stack)

Simple, minimal steps.

```
Step 1: Select Doctor (skip if clinic has 1 doctor or N/A)
Step 2: Select Procedure (optional)
Step 3: Select Date
Step 4: Select Time Slot
Step 5: Confirm Details (name, phone, notes)
Step 6: Review & Confirm
Step 7: Success Screen
```

**Success Screen shows**:
- Confirmation message: `Appointment Confirmed ✓`
- Clinic name + address
- Doctor name (if selected)
- Procedure (if selected)
- Date + Time
- Status: Pending (clinic to confirm)

**Actions on success**:
- Add to calendar
- Get directions
- View appointment

> No payment. Booking is free. Clinic confirms out-of-band for MVP.

---

### 8.8 Not Sure What You Need? Flow

**Intentionally non-prescriptive.**

```
Step 1: What area would you like to improve?
  [Skin] [Hair] [Anti-ageing] [Acne & Scars]
  [Pigmentation] [Face & Contour] [Body] [Lips]

Step 2: A few simple questions (2–3 per concern category)
  e.g. for Skin: "What is your primary skin concern?"
  Options: Dullness / Uneven tone / Texture / Fine lines / Other

Step 3: Results
  "These treatments may be relevant to your concern."
  [Procedure cards → normal procedure flow]
```

**Language rules**:
- ✅ "These treatments may be relevant to your concern."
- ✅ "Many people with similar concerns explore..."
- ❌ "You need treatment X."
- ❌ "We recommend..."
- ❌ Any prescriptive medical language

Questions and mappings are **data-driven** (stored in `concern_questions` and `concern_procedure_mappings` tables), not hardcoded in UI.

---

### 8.9 Global Search

Multi-entity search across:
- Procedures (name, description, category)
- Clinics (name, city, area, description)
- Concerns (maps to concern categories)

**Result grouping**:
```
PROCEDURES
  Botox →
  Dermal Fillers →

CLINICS
  Aesthetica Skin Clinic →

CONCERNS
  Acne scars →
```

Search is debounced (300ms). Search service is a standalone reusable service.

---

### 8.10 Profile

Access: top-right profile icon.

**Sections**:

| Section | Contents |
|---|---|
| My Appointments | Upcoming / Past / Cancelled |
| Upcoming | Clinic, doctor, procedure, date, time, status |
| Past | Completed appointments |
| Cancelled | Cancelled appointments |
| Saved | Saved clinics + saved procedures |
| Personal Details | Name, email, phone, profile image |
| Settings | Notification preferences |
| Help & Support | FAQ / contact |
| Logout | — |

**Appointment actions**:
- View details
- Reschedule (opens booking flow with pre-filled data)
- Cancel (with confirmation)

---

### 8.11 Auth Flow

**When auth is required**:
- Booking an appointment
- Saving a clinic or procedure
- Viewing profile

**When auth is NOT required**:
- Browsing home
- Viewing procedures
- Viewing clinics
- Viewing doctors
- Running "Not Sure" flow
- Searching

**Auth screens**:
1. Welcome screen (minimal — logo + phone/email input)
2. OTP entry screen
3. Redirect to previous screen on success

No lengthy onboarding. No profile setup required at signup.

---

## 9. Design System

### Visual Personality

| Attribute | Description |
|---|---|
| Premium | High-quality, luxury-adjacent feel |
| Clean | Generous whitespace, no clutter |
| Warm | Approachable, not cold/clinical |
| Trustworthy | Credibility through quality |
| Aesthetic | Visually beautiful |

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Background | Warm white | `#FAFAF8` |
| Surface | White | `#FFFFFF` |
| Accent primary | Blush pink | `#F2A5B1` |
| Accent secondary | Soft lavender | `#C5B8F0` |
| Accent tertiary | Peach | `#F5C4A0` |
| Text primary | Deep charcoal | `#1A1A2E` |
| Text secondary | Medium grey | `#6B7280` |
| Text muted | Light grey | `#9CA3AF` |
| Border | Very light | `#F0EDE8` |
| Success | Soft green | `#6BCB77` |
| Error | Soft red | `#EF5350` |

### Typography

Font: **Inter** (Google Fonts)

| Scale | Size | Weight | Use |
|---|---|---|---|
| Display | 28px | 700 | Hero headlines |
| H1 | 24px | 700 | Screen titles |
| H2 | 20px | 600 | Section headers |
| H3 | 17px | 600 | Card titles |
| Body | 15px | 400 | Paragraph text |
| Caption | 13px | 400 | Secondary labels |
| Micro | 11px | 500 | Badges, chips |

### Spacing

Base unit: 4px  
Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### Component Styling

| Element | Radius | Shadow |
|---|---|---|
| Cards | 12px | subtle warm shadow |
| Buttons | 24px | none |
| Chips / filters | 20px | none |
| Images | 12px | none |
| Input fields | 12px | subtle inset |
| Bottom sheet | 20px (top) | medium |

---

## 10. Analytics Plan

Tracked entirely client-side via a thin analytics wrapper. No external dependency for MVP — can swap in Mixpanel/Amplitude later.

### Key Events

**Acquisition / Browse**
- `app_opened`
- `search_performed` → `{ query, result_count }`
- `procedure_viewed` → `{ procedure_id, procedure_name }`
- `clinic_viewed` → `{ clinic_id, clinic_name }`
- `doctor_viewed` → `{ doctor_id }`

**Marketplace Funnel**
```
procedure_searched
  → procedure_viewed
  → clinic_viewed_from_procedure
  → booking_started
  → booking_completed
```

```
clinic_searched
  → clinic_viewed
  → booking_started
  → booking_completed
```

**Not Sure Flow**
```
not_sure_flow_started
  → concern_selected → { concern_category }
  → concern_options_viewed
  → procedure_viewed_from_concern
  → clinic_viewed
  → booking_started
  → booking_completed
```

**Booking**
- `booking_started` → `{ clinic_id }`
- `booking_step_completed` → `{ step, clinic_id }`
- `booking_completed` → `{ appointment_id, clinic_id, procedure_id }`
- `booking_cancelled` → `{ appointment_id }`

**Saves**
- `clinic_saved` / `clinic_unsaved`
- `procedure_saved` / `procedure_unsaved`

---

## 11. Empty and Error States

Every list screen and data-dependent screen must have defined states.

| Screen | Empty State | Error State |
|---|---|---|
| Clinics list | "No clinics found nearby. Try adjusting your filters." | "Couldn't load clinics. Tap to retry." |
| Procedure clinics | "No clinics offering this procedure yet in your area." | Retry |
| Search results | "No results for '[query]'. Try a different search." | Retry |
| My appointments | "No upcoming appointments. Book your first one!" | Retry |
| Saved items | "Nothing saved yet. Start exploring procedures and clinics." | Retry |
| Notifications | "You're all caught up." | Retry |

---

## 12. Trust & Safety

Trust is core to this product. It is healthcare-adjacent.

| Feature | MVP | Future |
|---|---|---|
| Clinic verification badge | ✅ Display status | ✅ Admin verification flow |
| Doctor credential badge | ✅ Display qualification | Future |
| Review moderation | Schema ready | Admin flow in future |
| Report clinic | Schema ready | Future |
| Sponsored labelling | Schema ready | Future (must be explicit) |

Future sponsored listings must NEVER be presented as organic. They must be explicitly labelled.

---

## 13. Location Strategy

- City-level location is sufficient for MVP
- Support manual city selection (no permission required)
- Support device location where granted (optional, enhances discovery)
- No precise location required

MVP cities in seed data: **Chandigarh** (primary)

---

## 14. Authentication Strategy

| Trigger | Auth Required? |
|---|---|
| Browse home | ❌ |
| View procedures | ❌ |
| View clinics | ❌ |
| View doctors | ❌ |
| Run Not Sure flow | ❌ |
| Search | ❌ |
| Book appointment | ✅ |
| Save clinic/procedure | ✅ |
| View profile | ✅ |
| Write review | ✅ |

Auth method: **Email OTP** (simplest MVP approach; no Twilio required).

---

## 15. Future Extensibility Requirements

The following features must be architecturally possible without a database rewrite:

| Feature | Requirement |
|---|---|
| Teleconsultation | Doctor entity exists; appointment type field can be added |
| Sponsored listings | `is_sponsored` flag can be added to clinics |
| Premium clinic profiles | Subscription tier field on clinics |
| Online payments | Appointment table can receive `payment_status`, `payment_amount` |
| Clinic App | RLS roles already defined; clinic admin can manage their own rows |
| Doctor availability | `availability` table can be added alongside appointments |
| SEO web layer | Slugs on all entities; city/procedure structured |
| Advanced search | Full-text search columns can be indexed |

---

## 16. What NOT to Build in MVP

❌ AI chatbot or skin analysis  
❌ Image-based diagnosis  
❌ Treatment recommendation engine  
❌ Teleconsultation / video calling  
❌ Treatment plans or patient records  
❌ Complex CRM  
❌ Clinic management SaaS  
❌ Loyalty or rewards programs  
❌ In-app payments for in-clinic bookings  
❌ Marketplace commission on physical bookings  
❌ Social features or community  
❌ Doctor-patient chat  
❌ Advanced personalization  
❌ Complex notification centre  
❌ Map-heavy experience  
❌ Lengthy onboarding  

---

## 17. MVP Success Criteria

The MVP is successful when all of the following are true:

1. ✅ A user can open the app without signing in
2. ✅ A user can search for a procedure by name or concern
3. ✅ A user can read and understand a full procedure page
4. ✅ A user can see which clinics offer a procedure and at what price
5. ✅ A user can compare clinic options
6. ✅ A user can open a full clinic profile
7. ✅ A user can see procedures and clinic-specific pricing
8. ✅ A user can book an in-clinic appointment (after auth)
9. ✅ A user can see their appointment in Profile
10. ✅ A user can reschedule or cancel an appointment
11. ✅ A user can directly search and browse clinics
12. ✅ A user who doesn't know what they need can complete the "Not Sure" flow
13. ✅ All flows work with realistic seeded data
14. ✅ The app feels polished and trustworthy
15. ✅ The architecture is compatible with a future Clinic App on the same backend

---

## 18. Build Priority Order

| Phase | Deliverable |
|---|---|
| 1 | Project setup + design system + navigation skeleton |
| 2 | Supabase schema + RLS + seed data |
| 3 | Home screen |
| 4 | Procedures list + detail |
| 5 | Clinics list + detail |
| 6 | Doctor profiles |
| 7 | Global search |
| 8 | Booking engine |
| 9 | Auth (email OTP) |
| 10 | Profile + appointments |
| 11 | Not Sure flow |
| 12 | Reviews + saved items + notifications |
| 13 | Analytics + polish + QA |

---

*End of PRD v1.0*
