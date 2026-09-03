// Color Theme inspired by Dr. Purva's Skin & Laser Clinic (Panchkula / Chandigarh)
// Signature aesthetic: Royal Champagne Gold, Warm Alabaster, Deep Slate Charcoal, Soft Clinical Teal

export const colors = {
  // Backgrounds
  background: '#FAF9F6', // Warm Alabaster
  surface: '#FFFFFF',
  surfaceSubtle: '#F5F2EB', // Soft Golden Cream
  surfaceElevated: '#FFFFFF',

  // Primary Aesthetic Accents (Dr. Purva Signature Gold & Champagne)
  primary: '#AD904A', // Rich Regal Gold (from .background-golden)
  primaryLight: '#FAF4E6', // Soft Champagne Tint
  primaryDark: '#8A7032', // Deep Antique Gold
  primaryShimmer: '#DEC481', // Radiant Champagne Gold (from .theme-color)

  // Secondary Accents (Clinical Reassurance & Contrast)
  secondary: '#36536B', // Deep Slate Blue (from headers/nav)
  secondaryLight: '#EBF1F5',
  secondaryDark: '#203344',

  // Subtle Clinical & Warm Tones
  teal: '#3E9BAA', // Clinical Aqua / Laser Glow
  tealLight: '#EAF6F8',
  peach: '#D68C58', // Warm Amber
  peachLight: '#FDF4ED',
  gold: '#DEC481',
  goldLight: '#FFFBF2',

  // Text & Typography
  text: '#222222', // Deep Charcoal
  textSecondary: '#666666',
  textMuted: '#999999',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#ECE7DC',
  borderStrong: '#DCD4C4',

  // Status Colors
  success: '#2E8B57', // Forest Jade
  successLight: '#EBF6EF',
  warning: '#D99B26',
  warningLight: '#FEF8EA',
  error: '#C83232',
  errorLight: '#FDECEC',
  info: '#36536B',
  infoLight: '#EBF1F5',

  // Overlay
  backdrop: 'rgba(25, 23, 19, 0.45)',
  shimmer: '#EFEAE0',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
};

export const typography = {
  fontSizes: {
    hero: 28,
    h1: 24,
    h2: 20,
    h3: 17,
    bodyLarge: 16,
    body: 14,
    caption: 12,
    micro: 10,
  },
  lineHeights: {
    hero: 34,
    h1: 30,
    h2: 26,
    h3: 22,
    bodyLarge: 22,
    body: 20,
    caption: 16,
    micro: 14,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};

export const shadows = {
  subtle: {
    shadowColor: '#2B261D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#2B261D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  floating: {
    shadowColor: '#2B261D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 6,
  },
};
