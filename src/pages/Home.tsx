import { useState, useCallback, lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';

// Lazy-load below-the-fold sections so they don't block initial render
const AttractionsSection = lazy(() => import('../components/home/AttractionsSection'));
const AnnouncementsSection = lazy(() => import('../components/home/AnnouncementsSection'));
const Footer = lazy(() => import('../components/layout/Footer'));
const PurchaseModal = lazy(() => import('../components/purchase/PurchaseModal')); 
const MapSection = lazy(() => import('../components/home/MapSection'));
const FAQSection = lazy(() => import('../components/home/FAQSection'));

function DeferredSection({ id, minHeight, children }: { id: string; minHeight: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} style={{ minHeight: ready ? undefined : minHeight }}>
      {ready && <Suspense fallback={null}>{children}</Suspense>}
    </div>
  );
}

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal  = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className="min-h-screen bg-dark-950 text-ivory">
      <Navbar onBuyClick={openModal} />
      <HeroSection onBuyClick={openModal} />
      <DeferredSection id="atrações" minHeight="520px">
        <AttractionsSection />
      </DeferredSection>
      <DeferredSection id="avisos" minHeight="320px">
        <AnnouncementsSection />
      </DeferredSection>
      <DeferredSection id="local" minHeight="600px">
        <MapSection />
      </DeferredSection>
      <DeferredSection id="faq" minHeight="560px">
        <FAQSection />
      </DeferredSection>
      <DeferredSection id="footer" minHeight="260px">
        <Footer />
      </DeferredSection>
      {modalOpen && (
        <Suspense fallback={null}>
          <PurchaseModal open={modalOpen} onClose={closeModal} />
        </Suspense>
      )}
    </div>
  );
}
