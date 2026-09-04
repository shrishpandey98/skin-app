-- AURA AESTHETICS & PROCEDURES MARKETPLACE
-- SEED DATA MIGRATION (CLINICS, DOCTORS, PROCEDURES, PRICING & REVIEWS)

-- 1. SEED PROCEDURES
INSERT INTO public.procedures (id, name, slug, category, short_description, description, hero_image_url, common_uses, benefits, what_to_expect, sessions_info, downtime, considerations, faqs, sort_order, is_active)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    'Botox / Anti-Wrinkle Injections',
    'botox',
    'injectables',
    'FDA-approved purified botulinum neuromodulator to relax facial muscles and smooth dynamic wrinkles.',
    'Botox (Botulinum Toxin Type A) is an FDA-approved prescription injectable that temporarily relaxes targeted muscle contractions responsible for dynamic wrinkles.',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop',
    ARRAY['Forehead horizontal lines', 'Glabellar frown lines (11 lines)', 'Crow’s feet around eyes', 'Jawline slimming (Masseter reduction)'],
    ARRAY['Smooths existing dynamic wrinkles and prevents deep crease formation', 'Quick 15–20 minute in-clinic procedure', 'Zero recovery downtime', 'Natural results that preserve facial expressions'],
    'Using ultra-fine insulin micro-needles, the doctor places tiny micro-droplets into the precise target muscles. Most patients describe it as a minor mosquito pinch.',
    '1 session provides results lasting 4 to 6 months.',
    'Zero downtime. Normal activities can be resumed immediately.',
    ARRAY['Do not massage or rub treated areas for 24 hours', 'Remain upright for at least 4 hours post-procedure'],
    ARRAY['{"question": "How long does Botox take to show results?", "answer": "Initial muscle relaxation starts within 3–5 days, with full results visible at 10–14 days."}'::jsonb],
    1,
    TRUE
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    'Hydrafacial MD',
    'hydrafacial',
    'skin',
    'Patented 4-step vortex hydradermabrasion for deep cleansing, painless extraction & antioxidant hydration.',
    'Hydrafacial is a non-invasive, medical-grade skin resurfacing treatment combining cleansing, physical and chemical exfoliation, automated vortex suction extraction, and deep infusion of hyaluronic acid and peptides.',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop',
    ARRAY['Congested pores and blackheads', 'Dullness, uneven skin tone & pollution residue', 'Dehydrated dry skin', 'Enlarged pores and rough texture'],
    ARRAY['Instant dewy radiant glow from step one', 'Deeply extracts impurities without skin redness or trauma', 'Plumps skin with essential hyaluronic acid peptides', 'Completely safe before weddings, events, or parties'],
    'Comfortable 4-step treatment: vortex cleansing, gentle glycolic-salicylic peel, painless vortex suction extraction, and antioxidant peptide infusion.',
    'Monthly sessions recommended for optimal long-term skin health.',
    'Zero downtime. You can apply makeup immediately.',
    ARRAY['Avoid active retinol or harsh scrubs for 48 hours post-treatment'],
    ARRAY['{"question": "Is Hydrafacial safe for active acne?", "answer": "Yes, customized salicylic acid tips can be used to treat congested and acne-prone skin."}'::jsonb],
    2,
    TRUE
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    'Laser Hair Removal',
    'laser-hair-removal',
    'laser',
    'US-FDA approved Triple-Wavelength Diode & Alexandrite lasers for painless, permanent hair reduction.',
    'Laser Hair Removal uses concentrated laser light beams absorbed by melanin in hair follicles to permanently reduce hair growth while protecting surrounding skin with chilled contact tips.',
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop',
    ARRAY['Full body hair reduction', 'Facial hair (upper lip, chin, sideburns)', 'Bikini line and underarms', 'Ingrown hairs & razor bump prevention'],
    ARRAY['Up to 90% permanent hair reduction', 'Eliminates painful waxing and ingrown hairs', 'Virtually painless with sapphire contact cooling', 'Safe on all Indian skin types'],
    'The area is shaved, cooling gel is applied, and the laser handpiece glides smoothly with rapid pulses and ice-cold contact cooling.',
    '6 to 8 sessions spaced 4 to 6 weeks apart.',
    'Zero downtime. Mild transient redness resolves in 1–2 hours.',
    ARRAY['Shave target area 24 hours prior; avoid waxing or threading for 3 weeks before treatment'],
    ARRAY['{"question": "Is laser hair removal permanent?", "answer": "It provides permanent hair reduction (80–90%). Any rare regrowth is fine and vellus."}'::jsonb],
    3,
    TRUE
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    'Q-Switched Laser Toning',
    'laser-toning',
    'laser',
    'Nanosecond Nd:YAG laser to shatter stubborn pigmentation, treat sunspots & restore even skin tone.',
    'Q-Switched Nd:YAG laser delivers ultra-short nanosecond pulses of 1064nm light that selectively shatter excess melanin pigment granules without burning epidermal layers.',
    'https://images.unsplash.com/photo-1512290900672-1f02e79df0dd?q=80&w=1200&auto=format&fit=crop',
    ARRAY['Sun-induced tanning and uneven skin tone', 'Freckles and age spots', 'Post-inflammatory hyperpigmentation (PIH)', 'Hollywood Carbon Laser Peel (Party Glow)'],
    ARRAY['Even skin tone with reduction in stubborn pigment patches', 'Stimulates deep dermal collagen', 'Non-ablative with zero peeling or scabbing', 'Safe for Indian skin tones'],
    'Comfortable warm sensation as the laser handpiece hovers across the skin.',
    '4 to 6 sessions spaced 2 to 3 weeks apart.',
    'Zero downtime.',
    ARRAY['Strict broad-spectrum SPF 50 sunscreen application is required daily'],
    ARRAY['{"question": "How soon will I see pigmentation fading?", "answer": "A brighter skin tone is visible within 3–5 days after the first session."}'::jsonb],
    4,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. SEED CLINICS (SINGLE CLINIC: Dr. Purva's Skin & Laser Clinic)
INSERT INTO public.clinics (id, name, slug, description, logo_url, cover_image_url, phone, email, address, area, city, state, latitude, longitude, verification_status, rating, review_count, specialties, is_active)
VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    'Dr. Purva''s Skin & Laser Clinic',
    'dr-purvas-skin-and-laser-clinic',
    'Dr. Purva''s Skin Clinic is one of the finest aesthetic dermatology and laser centers in Chandigarh Tricity. Founded by Dr. Purva Pande (Ex. GMCH-32 & Harvard USA), the clinic provides comprehensive, results-driven skin, hair, and laser treatments.',
    'https://drpurvaskinclinic.com/media/uploads/site_setting/117503311.png',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop',
    '+919417696148',
    'drpurvapande@gmail.com',
    'Plot No. 1187, Sector 11, Panchkula',
    'Sector 11 (Panchkula)',
    'Chandigarh',
    'Haryana',
    30.6890,
    76.8534,
    'verified',
    4.9,
    310,
    ARRAY['Laser Hair Removal', 'Laser Toning', 'Acne Scars', 'Hydrafacial MD', 'Melasma', 'Botox & Fillers', 'Chemical Peels'],
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. SEED DOCTORS (Dr. Purva Pande)
INSERT INTO public.doctors (id, name, slug, photo_url, qualification, specialization, experience_years, bio, rating, review_count, is_active)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    'Dr. Purva Pande',
    'dr-purva-pande',
    'https://images.unsplash.com/photo-1594824813686-21a4413158c3?q=80&w=600&auto=format&fit=crop',
    'MBBS, MD (Dermatology), DNB, MNAMS (Ex. GMCH-32, Harvard USA)',
    'Chief Dermatologist & Laser Specialist',
    15,
    'Dr. Purva is a board-certified, highly-rated senior dermatologist in Chandigarh Tricity with years of experience at GMCH Sec-32 Chandigarh and paediatric dermatology at Harvard, USA.',
    4.9,
    290,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name;

-- 4. SEED CLINIC-DOCTOR ASSOCIATIONS
INSERT INTO public.clinic_doctors (clinic_id, doctor_id, is_primary)
VALUES
  ('22222222-2222-2222-2222-222222222201', '33333333-3333-3333-3333-333333333301', TRUE)
ON CONFLICT (clinic_id, doctor_id) DO NOTHING;

-- 5. SEED CLINIC-SPECIFIC PROCEDURES & PRICING
INSERT INTO public.clinic_procedures (clinic_id, procedure_id, price_from, price_to, price_unit, description, is_available)
VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 250, 400, 'per unit', 'US-FDA Allergan Botox administered by Dr. Purva Pande with complimentary 2-week review.', TRUE),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102', 4800, 7500, 'per session', 'Medical-grade vortex-infusion deep pore cleansing and antioxidant glow.', TRUE),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103', 2200, 16000, 'per session', 'US-FDA approved painless triple-wavelength diode laser with chilled sapphire crystal.', TRUE),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111104', 3500, 8000, 'per session', 'Q-Switched Nd:YAG laser toning for deep dermal pigmentation, melasma & carbon peel glow.', TRUE)
ON CONFLICT (clinic_id, procedure_id) DO NOTHING;

