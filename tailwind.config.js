/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary dark backgrounds
        dark: {
          950: '#090909',
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#242424',
          500: '#2a2a2a',
          400: '#333333',
          300: '#404040',
        },
        // Sunset purple (warm twilight)
        purple: {
          300: '#F0C27B',
          400: '#E8A04F',
          500: '#D4842E',
          600: '#B86F1E',
          700: '#9C5A14',
        },
        // Sunset orange (primary accent)
        orange: {
          300: '#FFD4A8',
          400: '#FFB066',
          500: '#FF8C2E',
          600: '#E6731A',
          700: '#C25A0E',
        },
        // Pink alias — sunset coral/rose
        pink: {
          300: '#FFD4A8',
          400: '#FFB066',
          500: '#FF8C2E',
          600: '#E6731A',
          700: '#C25A0E',
        },
        // Blue accent — muted twilight blue
        cyan: {
          300: '#8EC5E8',
          400: '#5B9BD5',
          500: '#3B7DB5',
          600: '#2B5E91',
        },
        // Legacy gold — sunset amber
        gold: {
          300: '#FFD4A8',
          400: '#FFB066',
          500: '#FF8C2E',
          600: '#E6731A',
          700: '#C25A0E',
          800: '#9C4508',
        },
        // Neon aliases — sunset palette
        neon: {
          purple: '#D4842E',
          pink: '#FF8C2E',
          blue: '#5B9BD5',
        },
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
        playfair: ['Playfair Display', 'Georgia', 'serif'],
        script: ['Dancing Script', 'cursive'],
        luxe: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        roma: ['Cinzel', 'Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(212, 132, 46, 0.3), 0 0 40px rgba(212, 132, 46, 0.1)',
        'neon-pink': '0 0 22px rgba(255, 140, 46, 0.45), 0 0 44px rgba(255, 140, 46, 0.18)',
        'neon-blue': '0 0 20px rgba(91, 155, 213, 0.3), 0 0 40px rgba(91, 155, 213, 0.1)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.35)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 140, 46, 0.1)',
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
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 140, 46, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(255, 140, 46, 0.5)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, rgba(212, 132, 46, 0.1), rgba(255, 140, 46, 0.1))',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
