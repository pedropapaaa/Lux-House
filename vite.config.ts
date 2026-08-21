import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always needed
          'vendor-react': ['react', 'react-dom'],
          // Routing
          'vendor-router': ['react-router-dom'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Supabase client (large — split from app code)
          'vendor-supabase': ['@supabase/supabase-js'],
          // Form validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // QR code rendering (only needed on ticket/payment pages)
          'vendor-qr': ['qrcode.react'],
          // QR scanner (only needed on check-in page)
          'vendor-scanner': ['html5-qrcode'],
          // Icons — consolidate all lucide icons into one chunk
          'vendor-icons': ['lucide-react'],
          // Animation library - separate chunk for faster initial load
          'vendor-motion': ['framer-motion'],
        },
      },
    },
    // Raise warning threshold — we're explicitly chunking
    chunkSizeWarningLimit: 400,
  },
  // Pre-bundle dependencies for better compatibility
  optimizeDeps: {
    include: ['lucide-react', 'html5-qrcode', 'framer-motion'],
  },
});
