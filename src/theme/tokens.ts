// ─────────────────────────────────────────────────────────────
// ASMPCS Design Tokens
// Single source of truth for all visual constants.
// Used directly where NativeWind classes are insufficient
// (e.g. LinearGradient colors, shadow config, opacity overlays).
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Base backgrounds
  navy:    '#0A2342',
  navy2:   '#0D2D52',
  dark:    '#061626',
  darker:  '#040E1A',

  // Blue accent family — member portal primary
  teal:    '#1565A8',
  sky:     '#1E88D4',
  mint:    '#00C6D8',

  // Warm accents
  gold:    '#E8A020',
  gold2:   '#F5C842',
  amber:   '#D97706',

  // Status
  green:   '#1A7A4A',
  green2:  '#22A060',
  red:     '#C0392B',
  red2:    '#E74C3C',
  // Admin primary — deep crimson
  crimson: '#8B1A1A',

  // Semantic
  purple:  '#7C3AED',
  muted:   '#7FA8C9',
  white:   '#FFFFFF',
  offwhite:'#F0F5FA',
  light:   '#D4E8F5',
} as const;

// Card surface overlays — these can't be expressed cleanly as Tailwind config
// without losing the rgba transparency, so components use them via `style` prop.
export const Surfaces = {
  cardBg:       'rgba(255,255,255,0.07)',
  cardBg2:      'rgba(255,255,255,0.04)',
  cardBorder:   'rgba(255,255,255,0.12)',
  cardBorder2:  'rgba(255,255,255,0.06)',
  topbarBg:     'rgba(6,22,38,0.65)',
  adminTopbarBg:'rgba(4,14,26,0.65)',
  loginCard:    'rgba(13,29,58,0.85)',
  adminLoginCard:'rgba(10,20,40,0.88)',
  modalBg:      '#0D2340',
  adminModalBg: '#0A1E36',
  overlayBg:    'rgba(0,0,0,0.75)',
} as const;

// Gradient stop pairs — used with expo-linear-gradient
export const Gradients = {
  // Backgrounds
  loginBg:       ['#061626', '#0A2342', '#0D3560'] as string[],
  adminLoginBg:  ['#040E1A', '#0A1E36', '#0D2D52'] as string[],
  mainBg:        ['#0D2340', '#071422'] as string[],
  adminMainBg:   ['#0A1E36', '#061220'] as string[],
  balanceHero:   ['#0D2D52', '#0D3560'] as string[],

  // Accent bars & buttons (member teal)
  memberPrimary: [Colors.teal, Colors.mint] as string[],
  memberBtn:     [Colors.teal, Colors.sky]  as string[],

  // Admin crimson
  adminPrimary:  [Colors.crimson, Colors.red] as string[],

  // Status
  gold:          [Colors.gold, Colors.gold2]   as string[],
  green:         [Colors.green, Colors.green2] as string[],
  red:           [Colors.crimson, Colors.red2] as string[],

  // Admin rainbow strip (login top bar)
  adminStrip:    [Colors.teal, Colors.mint, Colors.gold, Colors.red2] as string[],
} as const;

// Badge color maps — background and foreground rgba pairs
export const BadgeColors = {
  credit:   { bg: 'rgba(26,122,74,0.25)',   text: Colors.green2 },
  debit:    { bg: 'rgba(192,57,43,0.20)',   text: Colors.red2   },
  pending:  { bg: 'rgba(232,160,32,0.20)',  text: Colors.gold2  },
  approved: { bg: 'rgba(26,122,74,0.25)',   text: Colors.green2 },
  rejected: { bg: 'rgba(192,57,43,0.20)',   text: '#E88080'     },
  active:   { bg: 'rgba(26,122,74,0.20)',   text: Colors.green2 },
  inactive: { bg: 'rgba(127,168,201,0.15)', text: Colors.muted  },
  repaying: { bg: 'rgba(21,101,168,0.25)',  text: Colors.mint   },
  overdue:  { bg: 'rgba(192,57,43,0.25)',   text: Colors.red2   },
  disbursed:{ bg: 'rgba(124,58,237,0.25)',  text: '#A78BFA'     },
} as const;

// Spacing scale (supplement Tailwind's default)
export const Spacing = {
  sidebar:      240,
  sidebarAdmin: 248,
  pagePadH:     32,
  pagePadV:     28,
  cardPadH:     22,
  cardPadV:     18,
} as const;

// Border radii (used in components alongside NW classes)
export const Radii = {
  sm:  8,
  md:  14,
  lg:  20,
  xl:  24,
  full: 999,
} as const;

// Typography scale
export const FontSize = {
  xs:   10,
  sm:   11,
  base: 13,
  md:   14,
  lg:   15,
  xl:   17,
  '2xl':20,
  '3xl':22,
  '4xl':26,
  '5xl':28,
  hero: 48,
} as const;

// Named font families — must match keys loaded in expo-font
export const Fonts = {
  playfair:         'PlayfairDisplay_700Bold',
  playfairSemibold: 'PlayfairDisplay_600SemiBold',
  sans:             'DMSans_400Regular',
  sansMedium:       'DMSans_500Medium',
  sansSemibold:     'DMSans_600SemiBold',
  mono:             'DMMono_400Regular',
  monoMedium:       'DMMono_500Medium',
} as const;

// Shadow config for React Native (boxShadow doesn't work natively)
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  button: {
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  loginCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;
