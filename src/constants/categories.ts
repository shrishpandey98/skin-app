export interface CategoryItem {
  id: string;
  name: string;
  label: string;
  iconName: string;
  description: string;
  color: string;
  bgColor: string;
}

export const PROCEDURE_CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    name: 'All',
    label: 'All Procedures',
    iconName: 'sparkles',
    description: 'Explore all 67 procedures in the clinical knowledge base',
    color: '#8A7032',
    bgColor: '#FAF4E6',
  },
  {
    id: 'skin',
    name: 'Skin',
    label: 'Skin Health & Glow',
    iconName: 'sun',
    description: 'Hydration, clinical peels, brightening, and resurfacing',
    color: '#AD904A',
    bgColor: '#FAF4E6',
  },
  {
    id: 'hair',
    name: 'Hair',
    label: 'Hair Restoration',
    iconName: 'wind',
    description: 'PRP therapies, growth stimulation, and scalp wellness',
    color: '#36536B',
    bgColor: '#EBF1F5',
  },
  {
    id: 'laser',
    name: 'Laser',
    label: 'Laser Treatments',
    iconName: 'zap',
    description: 'Hair reduction, pigmentation, laser toning, and scar revision',
    color: '#3E9BAA',
    bgColor: '#EAF6F8',
  },
  {
    id: 'aesthetics',
    name: 'Aesthetics',
    label: 'Facial Aesthetics',
    iconName: 'heart',
    description: 'Anti-aging, botox, dermal fillers, thread lifts & facial sculpting',
    color: '#AD904A',
    bgColor: '#FAF4E6',
  },
];

export const CITIES = [
  {
    id: 'chandigarh',
    name: 'Chandigarh & Panchkula',
    state: 'Tricity',
    isAvailable: true,
    areas: [
      'Sector 11 (Panchkula)',
      'Sector 17 (Chandigarh)',
      'Sector 35 (Chandigarh)',
      'Sector 8 (Chandigarh)',
      'Sector 9',
      'Sector 22',
      'MDC Panchkula',
      'Sector 20 Panchkula',
      'Mohali Phase 7',
    ],
  },
];
