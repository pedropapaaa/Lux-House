// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  build: {
    target: "es2015",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always needed
          "vendor-react": ["react", "react-dom"],
          // Routing
          "vendor-router": ["react-router-dom"],
          // Data fetching
          "vendor-query": ["@tanstack/react-query"],
          // Supabase client (large — split from app code)
          "vendor-supabase": ["@supabase/supabase-js"],
          // Form validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // QR code rendering (only needed on ticket/payment pages)
          "vendor-qr": ["qrcode.react"],
          // QR scanner (only needed on check-in page)
          "vendor-scanner": ["html5-qrcode"],
          // Icons — consolidate all lucide icons into one chunk
          "vendor-icons": ["lucide-react"]
        }
      }
    },
    // Raise warning threshold — we're explicitly chunking
    chunkSizeWarningLimit: 400
  },
  // Let Vite pre-bundle lucide-react for faster dev cold starts
  optimizeDeps: {
    include: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gQ29yZSBSZWFjdCBydW50aW1lIFx1MjAxNCBhbHdheXMgbmVlZGVkXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgLy8gUm91dGluZ1xuICAgICAgICAgICd2ZW5kb3Itcm91dGVyJzogWydyZWFjdC1yb3V0ZXItZG9tJ10sXG4gICAgICAgICAgLy8gRGF0YSBmZXRjaGluZ1xuICAgICAgICAgICd2ZW5kb3ItcXVlcnknOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxuICAgICAgICAgIC8vIFN1cGFiYXNlIGNsaWVudCAobGFyZ2UgXHUyMDE0IHNwbGl0IGZyb20gYXBwIGNvZGUpXG4gICAgICAgICAgJ3ZlbmRvci1zdXBhYmFzZSc6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG4gICAgICAgICAgLy8gRm9ybSB2YWxpZGF0aW9uXG4gICAgICAgICAgJ3ZlbmRvci1mb3Jtcyc6IFsncmVhY3QtaG9vay1mb3JtJywgJ0Bob29rZm9ybS9yZXNvbHZlcnMnLCAnem9kJ10sXG4gICAgICAgICAgLy8gUVIgY29kZSByZW5kZXJpbmcgKG9ubHkgbmVlZGVkIG9uIHRpY2tldC9wYXltZW50IHBhZ2VzKVxuICAgICAgICAgICd2ZW5kb3ItcXInOiBbJ3FyY29kZS5yZWFjdCddLFxuICAgICAgICAgIC8vIFFSIHNjYW5uZXIgKG9ubHkgbmVlZGVkIG9uIGNoZWNrLWluIHBhZ2UpXG4gICAgICAgICAgJ3ZlbmRvci1zY2FubmVyJzogWydodG1sNS1xcmNvZGUnXSxcbiAgICAgICAgICAvLyBJY29ucyBcdTIwMTQgY29uc29saWRhdGUgYWxsIGx1Y2lkZSBpY29ucyBpbnRvIG9uZSBjaHVua1xuICAgICAgICAgICd2ZW5kb3ItaWNvbnMnOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIC8vIFJhaXNlIHdhcm5pbmcgdGhyZXNob2xkIFx1MjAxNCB3ZSdyZSBleHBsaWNpdGx5IGNodW5raW5nXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA0MDAsXG4gIH0sXG4gIC8vIExldCBWaXRlIHByZS1idW5kbGUgbHVjaWRlLXJlYWN0IGZvciBmYXN0ZXIgZGV2IGNvbGQgc3RhcnRzXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsV0FBVztBQUFBO0FBQUEsVUFFckMsaUJBQWlCLENBQUMsa0JBQWtCO0FBQUE7QUFBQSxVQUVwQyxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQTtBQUFBLFVBRXhDLG1CQUFtQixDQUFDLHVCQUF1QjtBQUFBO0FBQUEsVUFFM0MsZ0JBQWdCLENBQUMsbUJBQW1CLHVCQUF1QixLQUFLO0FBQUE7QUFBQSxVQUVoRSxhQUFhLENBQUMsY0FBYztBQUFBO0FBQUEsVUFFNUIsa0JBQWtCLENBQUMsY0FBYztBQUFBO0FBQUEsVUFFakMsZ0JBQWdCLENBQUMsY0FBYztBQUFBLFFBQ2pDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsdUJBQXVCO0FBQUEsRUFDekI7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
