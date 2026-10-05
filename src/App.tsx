import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { EventProvider } from './context/EventContext';

export default function App() {
  useEffect(() => {
    // 1. BLINDAGEM POR CSS ULTRA-RÁPIDO
    const style = document.createElement('style');
    style.textContent = `
      div[style*="z-index: 2147483647"],
      div[style*="position: fixed"][style*="bottom: 1rem"],
      a[href*="bolt.new"],
      [class*="built-with"],
      [id*="bolt"] {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;

    document.head.appendChild(style);

    // Seletor cirúrgico
    const targetSelector =
      'div[style*="position: fixed"][style*="bottom: 1rem"][style*="z-index: 2147483647"]';

    // 2. EXTERMINADOR CONTÍNUO
    const universalKill = () => {
      // Remove do DOM principal
      const badges = document.querySelectorAll(
        `${targetSelector}, a[href*="bolt.new"]`
      );

      for (let i = 0; i < badges.length; i++) {
        badges[i].remove();
      }

      // Caça profunda no Shadow DOM
      const all = document.body.getElementsByTagName('*');

      for (let i = 0; i < all.length; i++) {
        const el = all[i] as HTMLElement;

        if (el.shadowRoot) {
          const shadowBadge =
            el.shadowRoot.querySelector(targetSelector) ||
            el.shadowRoot.querySelector('a[href*="bolt.new"]');

          if (shadowBadge) {
            shadowBadge.remove();
            el.remove();
          }
        }
      }
    };

    // Loop contínuo de 5ms
    const intervalId = setInterval(universalKill, 5);

    // Escutadores globais
    window.addEventListener('popstate', universalKill);
    window.addEventListener('pageshow', universalKill);
    document.addEventListener('visibilitychange', universalKill);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', universalKill);
      window.removeEventListener('pageshow', universalKill);
      document.removeEventListener('visibilitychange', universalKill);
      style.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EventProvider>
        <RouterProvider router={router} />
      </EventProvider>
    </QueryClientProvider>
  );
}