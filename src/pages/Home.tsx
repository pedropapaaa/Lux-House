import { useState, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import AnnouncementsSection from '../components/home/AnnouncementsSection';
import FAQSection from '../components/home/FAQSection';
import PurchaseModal from '../components/purchase/PurchaseModal';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal  = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className="landing-monochrome min-h-screen bg-white text-neutral-950">
      <Navbar onBuyClick={openModal} />
      <HeroSection onBuyClick={openModal} />
      <AboutSection />
      <AnnouncementsSection />
      <FAQSection />
      <Footer />
      <PurchaseModal open={modalOpen} onClose={closeModal} />
    </div>
  );
}
