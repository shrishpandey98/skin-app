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
    description: 'Explore our comprehensive range of treatments',
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
    id: 'injectables',
    name: 'Injectables',
    label: 'Botox & Fillers',
    iconName: 'sparkle',
    description: 'Smoothing wrinkles, volume restoration, and subtle contours',
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
    id: 'hair',
    name: 'Hair',
    label: 'Hair Restoration',
    iconName: 'wind',
    description: 'PRP therapies, growth stimulation, and scalp wellness',
    color: '#36536B',
    bgColor: '#EBF1F5',
  },
  {
    id: 'anti_ageing',
    name: 'Anti-ageing',
    label: 'Firming & Tightening',
    iconName: 'shield',
    description: 'Collagen remodeling, HIFU lifting, and rejuvenation',
    color: '#AD904A',
    bgColor: '#FAF4E6',
  },
  {
    id: 'body',
    name: 'Body',
    label: 'Body Contouring',
    iconName: 'activity',
    description: 'Sculpting, stretch marks, and toning solutions',
    color: '#D68C58',
    bgColor: '#FDF4ED',
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
