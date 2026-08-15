import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        bgSecondary: '#FFFDF8',
        card: '#FFFFFF',
        surface: '#FAF9F5',
        primary: '#F59E0B',
        primaryDark: '#D97706',
        secondary: '#FBBF24',
        highlight: '#FDBA74',
        success: '#22C55E',
        successSoft: '#DCFCE7',
        danger: '#EF4444',
        dangerSoft: '#FEE2E2',
        warning: '#FB923C',
        warningSoft: '#FFEDD5',
        info: '#38BDF8',
        infoSoft: '#E0F2FE',
        text: '#171717',
        textSecondary: '#737373',
        textMuted: '#A3A3A3',
        divider: '#F1F5F9',
      },
      boxShadow: {
        clay:
          '0 8px 24px rgba(245,158,11,0.10), 0 2px 6px rgba(23,23,23,0.04), inset 2px 2px 8px rgba(255,255,255,0.9), inset -2px -2px 8px rgba(245,158,11,0.05)',
        'clay-sm':
          '0 4px 12px rgba(245,158,11,0.08), 0 1px 3px rgba(23,23,23,0.03), inset 1px 1px 4px rgba(255,255,255,0.9)',
        'clay-inset':
          'inset 3px 3px 8px rgba(245,158,11,0.10), inset -3px -3px 8px rgba(255,255,255,0.9)',
        'clay-hover':
          '0 12px 32px rgba(245,158,11,0.15), 0 3px 8px rgba(23,23,23,0.05), inset 2px 2px 8px rgba(255,255,255,0.9)',
      },
      borderRadius: {
        clay: '1.5rem',
        'clay-lg': '2rem',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
