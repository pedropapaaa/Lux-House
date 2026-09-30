/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep dark backgrounds
        dark: {
          950: '#0A0908',
          900: '#0F0D0B',
          800: '#171310',
          700: '#211B16',
          600: '#2C241D',
          500: '#3A2F25',
          400: '#4B3D30',
          300: '#5E4D3D',
        },
        // Purple neon — primary identity
        purple: {
          300: '#FFC77A',
          400: '#FFAE47',
          500: '#FF9A1F',
          600: '#E08510',
          700: '#B86A0C',
        },
        // Magenta — primary identity
        magenta: {
          300: '#FFA04D',
          400: '#FF8420',
          500: '#FF5A0F',
          600: '#E04A0A',
          700: '#B8400A',
        },
        // Pink vibrant — primary identity
        pink: {
          300: '#FFC08A',
          400: '#FF9A4D',
          500: '#FF7A2B',
          600: '#E0620F',
          700: '#B84F0A',
        },
        // Electric blue — subtle depth accent
        blue: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        // Sunset orange — sunset element only
        sunset: {
          300: '#FFB585',
          400: '#FF9D3D',
          500: '#FF5A24',
          600: '#E04A18',
          700: '#C23A12',
        },
        // Off-white
        ivory: '#F6F1E9',
        // Semantic colors
        success: {
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        script: ['Dancing Script', 'cursive'],
        luxe: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        roma: ['Cinzel', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(255, 154, 31, 0.35), 0 0 40px rgba(255, 154, 31, 0.12)',
        'neon-pink': '0 0 22px rgba(255, 122, 43, 0.4), 0 0 44px rgba(255, 122, 43, 0.15)',
        'neon-magenta': '0 0 22px rgba(255, 90, 15, 0.4), 0 0 44px rgba(255, 90, 15, 0.15)',
        'neon-blue': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'neon-sunset': '0 0 20px rgba(255, 90, 15, 0.3), 0 0 40px rgba(255, 90, 15, 0.1)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.35)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 154, 31, 0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 122, 43, 0.3)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 40px rgba(255, 122, 43, 0.5)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, rgba(255, 154, 31, 0.1), rgba(255, 90, 15, 0.1))',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
