import { useState, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import AttractionsSection from '../components/home/AttractionsSection';
import AnnouncementsSection from '../components/home/AnnouncementsSection';
import MapSection from '../components/home/MapSection';
import FAQSection from '../components/home/FAQSection';
import PurchaseModal from '../components/purchase/PurchaseModal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal  = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Navbar onBuyClick={openModal} />
      <HeroSection onBuyClick={openModal} />
      <AttractionsSection />
      <AnnouncementsSection />
      <MapSection />
      <FAQSection />
      <Footer />
      <PurchaseModal open={modalOpen} onClose={closeModal} />
    </div>
  );
}
