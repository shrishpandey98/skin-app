import { Procedure } from '../types/procedure.types';
import { Clinic } from '../types/clinic.types';
import { Doctor } from '../types/doctor.types';
import { Review } from '../types/review.types';
import { ConcernQuestion, ConcernResultMapping } from '../types/notsure.types';

import { PROCEDURES_KNOWLEDGE_BASE, MOCK_PROCEDURES } from './procedures.data';
export { PROCEDURES_KNOWLEDGE_BASE, MOCK_PROCEDURES };

export const MOCK_DOCTORS: Doctor[] = [];

export const MOCK_CLINICS: Clinic[] = [];

export const MOCK_REVIEWS: Review[] = [];

export const CONCERN_CATEGORIES = [
  { id: 'skin', label: 'Skin Glow & Texture', icon: 'sparkles', subtitle: 'Dullness, pores, uneven texture or tan' },
  { id: 'acne', label: 'Acne & Scars', icon: 'flame', subtitle: 'Active breakouts, marks, and pitted scars' },
  { id: 'anti_ageing', label: 'Lines & Firming', icon: 'shield', subtitle: 'Forehead lines, jowl sagging & loss of bounce' },
  { id: 'pigmentation', label: 'Dark Spots & Melasma', icon: 'sun', subtitle: 'Sun spots, patchy tone & stubborn dark patches' },
  { id: 'hair', label: 'Hair Fall & Thinning', icon: 'wind', subtitle: 'Excessive shedding, visible scalp & thinning' },
  { id: 'face_contour', label: 'Face Shape & Lips', icon: 'heart', subtitle: 'Lip definition, cheek volume & jawline' },
];

export const CONCERN_QUESTIONS: Record<string, ConcernQuestion[]> = {
  skin: [
    {
      id: 'q_skin_1',
      concernCategory: 'skin',
      questionNumber: 1,
      totalQuestions: 2,
      question: 'What is your primary skin goal right now?',
      subtitle: 'Select what you would most like to address',
      options: [
        { id: 'glow', label: 'Instant radiant glow & deep pore cleansing', sublabel: 'For upcoming events or monthly upkeep' },
        { id: 'texture', label: 'Smoothening rough texture & large open pores', sublabel: 'Collagen renewal & skin refinement' },
        { id: 'tan', label: 'Clearing sun tan & dull patchy skin tone', sublabel: 'Gentle exfoliation and renewal' },
      ],
    },
    {
      id: 'q_skin_2',
      concernCategory: 'skin',
      questionNumber: 2,
      totalQuestions: 2,
      question: 'What is your preferred recovery time?',
      subtitle: 'How much downtime works for your schedule?',
      options: [
        { id: 'zero_downtime', label: 'Zero downtime — I need to return to work/events immediately' },
        { id: 'mild_flaking', label: '1–2 days of mild peeling or pinkness is okay for deeper results' },
      ],
    },
  ],
  acne: [
    {
      id: 'q_acne_1',
      concernCategory: 'acne',
      questionNumber: 1,
      totalQuestions: 2,
      question: 'What best describes your acne situation?',
      options: [
        { id: 'active_acne', label: 'Active breakouts, blackheads and inflamed pimples' },
        { id: 'acne_marks', label: 'Flat brown or red marks left behind after acne' },
        { id: 'pitted_scars', label: 'Depressed, pitted scars (boxcar or rolling scars)' },
      ],
    },
    {
      id: 'q_acne_2',
      concernCategory: 'acne',
      questionNumber: 2,
      totalQuestions: 2,
      question: 'Have you taken treatment for this before?',
      options: [
        { id: 'first_time', label: 'No, this is my first time exploring clinical treatments' },
        { id: 'tried_creams', label: 'I’ve used topical creams and want faster, deeper results' },
      ],
    },
  ],
  anti_ageing: [
    {
      id: 'q_age_1',
      concernCategory: 'anti_ageing',
      questionNumber: 1,
      totalQuestions: 2,
      question: 'Which area are you noticing changes in?',
      options: [
        { id: 'dynamic_lines', label: 'Forehead lines, frown lines between brows or crow’s feet' },
        { id: 'sagging', label: 'Softening jawline, mild jowls or loss of cheek volume' },
        { id: 'overall_laxity', label: 'General loss of skin firmness and elasticity' },
      ],
    },
    {
      id: 'q_age_2',
      concernCategory: 'anti_ageing',
      questionNumber: 2,
      totalQuestions: 2,
      question: 'What approach do you prefer?',
      options: [
        { id: 'wrinkle_relaxing', label: 'Quick, targeted micro-injections for expression lines' },
        { id: 'energy_lifting', label: 'Non-invasive ultrasound / radiofrequency collagen lifting' },
        { id: 'volume_restoration', label: 'Restoring natural volume to cheeks, smile lines or lips' },
      ],
    },
  ],
  hair: [
    {
      id: 'q_hair_1',
      concernCategory: 'hair',
      questionNumber: 1,
      totalQuestions: 2,
      question: 'What hair concern are you experiencing?',
      options: [
        { id: 'active_shedding', label: 'Sudden increased hair fall while washing or brushing' },
        { id: 'thinning_crown', label: 'Gradual thinning at the crown or widening hair parting' },
        { id: 'receding_hairline', label: 'Receding temple hairline' },
      ],
    },
    {
      id: 'q_hair_2',
      concernCategory: 'hair',
      questionNumber: 2,
      totalQuestions: 2,
      question: 'How long have you noticed this?',
      options: [
        { id: 'recent', label: 'Recently (last 1 to 3 months)' },
        { id: 'prolonged', label: 'More than 6 months — I want targeted regenerative therapy' },
      ],
    },
  ],
  pigmentation: [
    {
      id: 'q_pigment_1',
      concernCategory: 'pigmentation',
      questionNumber: 1,
      totalQuestions: 1,
      question: 'Where is the discoloration primarily located?',
      options: [
        { id: 'melasma', label: 'Cheekbones, nose or upper lip (patchy brown melasma)' },
        { id: 'sun_spots', label: 'Scattered dark spots or sun freckles' },
        { id: 'overall_uneven', label: 'Overall dullness and uneven tan across the face' },
      ],
    },
  ],
  face_contour: [
    {
      id: 'q_contour_1',
      concernCategory: 'face_contour',
      questionNumber: 1,
      totalQuestions: 1,
      question: 'What enhancement would you like to explore?',
      options: [
        { id: 'lips', label: 'Soft, hydrated lip plumping and contour definition' },
        { id: 'cheeks_jaw', label: 'Cheekbone definition and sharp jawline contour' },
        { id: 'smile_lines', label: 'Softening smile lines (nasolabial folds)' },
      ],
    },
  ],
};

export const CONCERN_MAPPINGS: Record<string, string[]> = {
  // Skin Glow, Texture & Hydration
  'glow': [
    'hydrafacial',
    'skin-brightening',
    'medical-facial',
    'skin-rejuvenation',
    'glow-radiance-treatment',
    'skin-hydration-treatment',
    'photo-facial-ipl',
  ],
  'texture': [
    'microneedling',
    'microneedling-collagen',
    'texture-improvement',
    'enlarged-pore-treatment',
    'hydrafacial',
    'chemical-peel',
    'glycolic-acid-peel',
    'lactic-acid-peel',
    'mandelic-acid-peel',
  ],
  'tan': [
    'chemical-peel',
    'laser-toning',
    'laser-toning-facial',
    'skin-brightening',
    'glycolic-acid-peel',
    'lactic-acid-peel',
    'carbon-laser-peel',
  ],
  'zero_downtime': [
    'hydrafacial',
    'skin-brightening',
    'medical-facial',
    'glow-radiance-treatment',
    'skin-hydration-treatment',
    'laser-hair-removal',
  ],
  'mild_flaking': [
    'chemical-peel',
    'glycolic-acid-peel',
    'salicylic-acid-peel',
    'tca-peel',
    'microneedling',
    'laser-toning',
  ],

  // Acne & Acne Scars
  'active_acne': [
    'salicylic-acid-peel',
    'combination-acne-peel',
    'chemical-peel-for-acne',
    'comedone-extraction',
    'medical-acne-procedures',
    'chemical-peel',
    'hydrafacial',
  ],
  'acne_marks': [
    'chemical-peel',
    'pigmentation-peel',
    'laser-toning',
    'laser-toning-facial',
    'skin-brightening',
    'glycolic-acid-peel',
    'carbon-laser-peel',
  ],
  'pitted_scars': [
    'acne-scar-treatment',
    'acne-scar-comprehensive',
    'subcision',
    'tca-cross',
    'rf-microneedling',
    'microneedling',
    'microneedling-collagen',
    'acne-scar-laser',
    'scar-revision',
  ],
  'first_time': [
    'hydrafacial',
    'chemical-peel',
    'salicylic-acid-peel',
    'comedone-extraction',
  ],
  'tried_creams': [
    'combination-acne-peel',
    'laser-toning',
    'rf-microneedling',
    'subcision',
    'tca-cross',
    'acne-scar-laser',
  ],

  // Anti-Ageing & Firming
  'dynamic_lines': [
    'botox',
    'botox-botulinum-toxin',
    'anti-aging-treatments',
    'skin-tightening',
  ],
  'sagging': [
    'skin-tightening',
    'hifu',
    'rf-skin-tightening',
    'thread-lift',
    'skin-tightening-procedures',
    'dermal-fillers',
    'facial-contouring',
  ],
  'overall_laxity': [
    'skin-tightening',
    'rf-skin-tightening',
    'hifu',
    'skin-boosters',
    'prp-facial',
    'microneedling',
    'rf-microneedling',
  ],
  'wrinkle_relaxing': [
    'botox',
    'botox-botulinum-toxin',
    'anti-aging-treatments',
  ],
  'energy_lifting': [
    'skin-tightening',
    'hifu',
    'rf-skin-tightening',
    'skin-tightening-procedures',
  ],
  'volume_restoration': [
    'dermal-fillers',
    'dermal-fillers-contouring',
    'skin-boosters',
    'facial-contouring',
  ],

  // Hair Fall & Scalp Health
  'active_shedding': [
    'prp-hair-treatment',
    'prp-therapy',
    'hair-fall-management',
    'scalp-treatments',
  ],
  'thinning_crown': [
    'prp-hair-treatment',
    'prp-therapy',
    'microneedling-for-hair',
    'hair-fall-management',
    'scalp-treatments',
  ],
  'receding_hairline': [
    'prp-hair-treatment',
    'prp-therapy',
    'microneedling-for-hair',
    'hair-fall-management',
  ],
  'recent': [
    'hair-fall-management',
    'scalp-treatments',
    'prp-hair-treatment',
  ],
  'prolonged': [
    'prp-hair-treatment',
    'prp-therapy',
    'microneedling-for-hair',
    'hair-fall-management',
  ],

  // Pigmentation & Melasma
  'melasma': [
    'pigmentation-treatment',
    'pigmentation-peel',
    'hyperpigmentation-treatment',
    'laser-toning',
    'laser-toning-facial',
    'q-switched-ndyag-laser',
    'mandelic-acid-peel',
    'chemical-peel',
  ],
  'sun_spots': [
    'laser-toning',
    'laser-toning-facial',
    'pigmentation-laser',
    'q-switched-ndyag-laser',
    'photo-facial-ipl',
    'pigmentation-treatment',
    'glycolic-acid-peel',
  ],
  'overall_uneven': [
    'skin-brightening',
    'chemical-peel',
    'laser-toning',
    'carbon-laser-peel',
    'photo-facial-ipl',
    'glycolic-acid-peel',
    'lactic-acid-peel',
  ],

  // Face Contour & Sculpting
  'lips': [
    'dermal-fillers',
    'dermal-fillers-contouring',
    'lip-pigmentation-treatment',
    'skin-boosters',
  ],
  'cheeks_jaw': [
    'dermal-fillers',
    'dermal-fillers-contouring',
    'facial-contouring',
    'skin-tightening',
    'hifu',
    'thread-lift',
  ],
  'smile_lines': [
    'dermal-fillers',
    'dermal-fillers-contouring',
    'skin-boosters',
    'botox',
  ],
};
