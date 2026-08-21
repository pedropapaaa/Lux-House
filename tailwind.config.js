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
        // Primary purple neon
        purple: {
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        // Halloween orange (replaces pink/neon accent) — mais vibrante/chamativo
        orange: {
          300: '#FFB37A',
          400: '#FF8A33',
          500: '#FF5A00',
          600: '#E64E00',
          700: '#C43F00',
        },
        // Keep pink as alias for backwards-compat (maps to orange)
        pink: {
          300: '#FFB37A',
          400: '#FF8A33',
          500: '#FF5A00',
          600: '#E64E00',
          700: '#C43F00',
        },
        // Blue accent
        cyan: {
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
        },
        // Legacy gold (mapped to orange for backwards compatibility)
        gold: {
          300: '#FFB37A',
          400: '#FF8A33',
          500: '#FF5A00',
          600: '#E64E00',
          700: '#C43F00',
          800: '#9C2D00',
        },
        // Neon aliases
        neon: {
          purple: '#8B5CF6',
          pink: '#FF5A00',
          blue: '#38BDF8',
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
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'neon-pink': '0 0 22px rgba(255, 90, 0, 0.45), 0 0 44px rgba(255, 90, 0, 0.18)',
        'neon-blue': '0 0 20px rgba(56, 189, 248, 0.3), 0 0 40px rgba(56, 189, 248, 0.1)',
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.35)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 90, 0, 0.1)',
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
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(255, 90, 0, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(255, 90, 0, 0.5)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(255, 90, 0, 0.1))',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
