import { useState, useEffect } from 'react';

/**
 * Mobile detection hook - returns true for screens < 768px
 * Used to conditionally disable heavy animations/effects on mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(checkIsMobile);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

/**
 * Simpler check without state - for initial render
 */
export function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
