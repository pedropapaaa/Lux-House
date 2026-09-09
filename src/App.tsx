import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { EventProvider } from './context/EventContext';

// Função pura para remover a marca d'água
const removeBoltWatermark = () => {
  // 1. Remover por seletores de estilo inline (mais robusto)
  const candidates = document.querySelectorAll('div[style*="position: fixed"][style*="bottom"][style*="right"][style*="z-index"]');
  
  candidates.forEach(el => {
    const text = el.innerText || '';
    const hasBoltText = text.toLowerCase().includes('bolt') || text.toLowerCase().includes('built with');
    const hasBoltIcon = el.querySelector('svg') && el.querySelector('a[href*="bolt.new"]');

    // Filtra para não remover elementos legítimos do layout
    if (hasBoltText || hasBoltIcon || (el.clientHeight < 100 && el.clientWidth < 200)) {
      el.remove();
    }
  });

  // 2. Remover por classes Tailwind comuns
  const tailwindCandidates = document.querySelectorAll('.fixed.bottom-4.right-4, .fixed.bottom-2.right-2, .absolute.bottom-4.right-4');
  tailwindCandidates.forEach(el => {
    if (el.innerText.toLowerCase().includes('bolt') || el.querySelector('a[href*="bolt.new"]')) {
      el.remove();
    }
  });
};

// Injeta CSS uma vez (protegido contra duplicação)
const injectStyle = () => {
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
    // 1. Injeta CSS
    injectStyle();
    
    // 2. Executa limpeza inicial
    removeBoltWatermark();

    // 3. Configura Observer
    const observer = new MutationObserver((mutations) => {
      const shouldCheck = mutations.some(m => m.addedNodes.length > 0);
      if (shouldCheck) {
        removeBoltWatermark();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 4. Cleanup: desconecta observer ao desmontar
    return () => {
      observer.disconnect();
    };
  }, []); // Array vazio garante execução apenas uma vez no mount

  return (
    <QueryClientProvider client={queryClient}>
      <EventProvider>
        <RouterProvider router={router} />
      </EventProvider>
    </QueryClientProvider>
  );
}
