/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy:    '#0A2342',
        navy2:   '#0D2D52',
        teal:    '#1565A8',
        sky:     '#1E88D4',
        mint:    '#00C6D8',
        gold:    '#E8A020',
        gold2:   '#F5C842',
        dark:    '#061626',
        darker:  '#040E1A',
        muted:   '#7FA8C9',
        cred:    '#C0392B',
        cred2:   '#E74C3C',
        cgreen:  '#1A7A4A',
        cgreen2: '#22A060',
        amber:   '#D97706',
        purple:  '#7C3AED',
        // Transparent card surfaces — used as background on glass cards
        'card-bg':      'rgba(255,255,255,0.07)',
        'card-bg2':     'rgba(255,255,255,0.04)',
        'card-border':  'rgba(255,255,255,0.12)',
        'card-border2': 'rgba(255,255,255,0.06)',
        // Topbar overlay
        'topbar-bg':    'rgba(6,22,38,0.65)',
        // Admin topbar
        'admin-topbar': 'rgba(4,14,26,0.65)',
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_700Bold'],
        'playfair-medium': ['PlayfairDisplay_600SemiBold'],
        sans:     ['DMSans_400Regular'],
        'sans-medium': ['DMSans_500Medium'],
        'sans-semibold': ['DMSans_600SemiBold'],
        mono:     ['DMMono_400Regular'],
        'mono-medium': ['DMMono_500Medium'],
      },
      borderRadius: {
        sm:  8,
        DEFAULT: 14,
        lg:  20,
        xl:  24,
      },
      spacing: {
        sidebar: 240,
        'sidebar-admin': 248,
      },
    },
  },
  plugins: [],
};
