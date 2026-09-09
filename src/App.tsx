import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { EventProvider } from './context/EventContext';

// Inject CSS once to hide the Bolt watermark — no MutationObserver needed
const injectWatermarkStyle = () => {
  if (document.getElementById('remove-bolt-watermark-style')) return;
  const style = document.createElement('style');
  style.id = 'remove-bolt-watermark-style';
  style.innerHTML = `
    div[style*="position: fixed"][style*="bottom: 1rem"][style*="right: 1rem"],
    div[class*="bottom-4"][class*="right-4"] a[href*="bolt.new"],
    div[class*="bottom-2"][class*="right-2"] a[href*="bolt.new"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
};

export default function App() {
  useEffect(() => {
    injectWatermarkStyle();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EventProvider>
        <RouterProvider router={router} />
      </EventProvider>
    </QueryClientProvider>
  );
}
