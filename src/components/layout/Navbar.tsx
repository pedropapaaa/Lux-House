import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Ticket } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';

const links = [
  { label: 'Inicio', href: '#home' },
  { label: 'Atracoes', href: '#atracoes' },
  { label: 'Local', href: '#local' },
  { label: 'FAQ', href: '#faq' },
];

interface NavbarProps {
  onBuyClick?: () => void;
}

export default function Navbar({ onBuyClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isMobile = useIsMobile();
  const { data: event } = usePublicEvent();
  const { data: settings } = useSettings();
  const salesEnabled = settings?.sales_enabled ?? true;
  const canBuy = salesEnabled && (event ? (event.status !== 'coming_soon' && event.status !== 'ended') : true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    if (!isHome) return;
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={isMobile ? false : { y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-950/95 backdrop-blur-xl py-2.5 sm:py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
      style={{
        borderBottom: scrolled ? '1px solid rgba(255, 140, 46, 0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <motion.div
            whileHover={isMobile ? undefined : { scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <picture>
              <source srcSet="/images/logo.webp" type="image/webp" />
              <img
                src="/images/logo.webp"
                alt="Lux House"
                width={48}
                height={48}
                loading="eager"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full"
                style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 14px rgba(255, 140, 46, 0.6))' }}
              />
            </picture>
          </motion.div>
          <div className="ml-2.5 sm:ml-3 leading-tight">
            <span
              className="font-roma text-xl sm:text-3xl font-bold block"
              style={{
                background: 'linear-gradient(135deg, #FFD4A8 0%, #FF8C2E 50%, #D4842E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.08em',
              }}
            >
              Lux House
            </span>
            <span className="text-[7px] sm:text-[8px] tracking-[0.4em] sm:tracking-[0.5em] text-pink-400/50 uppercase block mt-0.5">Casa de Show</span>
          </div>
        </Link>

        {/* Desktop nav */}
        {isHome && (
          <div className="hidden md:flex items-center gap-10">
            {links.map((l, i) => (
              <motion.button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                initial={isMobile ? false : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isMobile ? 0 : i * 0.1 }}
                className="text-[11px] tracking-[0.2em] uppercase text-white/50 hover:text-pink-400 transition-colors duration-300 relative group py-2"
              >
                {l.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(90deg, #FF8C2E, #D4842E)',
                    boxShadow: isMobile ? 'none' : '0 0 8px rgba(255, 140, 46, 0.5)',
                  }}
                />
              </motion.button>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {onBuyClick && canBuy ? (
            <motion.button
              onClick={onBuyClick}
              whileHover={isMobile ? undefined : { scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-6 py-3 text-white text-xs tracking-widest uppercase font-bold flex items-center gap-2 overflow-hidden"
              style={{
                background: 'transparent',
                border: '2px solid #FF8C2E',
                borderRadius: '12px',
                boxShadow: isMobile ? 'none' : '0 0 20px rgba(255, 140, 46, 0.3), inset 0 0 15px rgba(255, 140, 46, 0.05)',
              }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 140, 46, 0.2), rgba(212, 132, 46, 0.2))',
                }}
              />
              <Ticket size={16} className="relative" />
              <span className="relative">Ingresso</span>
            </motion.button>
          ) : (
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-pink-500/40 text-pink-400 text-xs tracking-widest uppercase hover:border-pink-400 hover:bg-pink-500/10 transition-all duration-300"
            >
              Inicio
            </Link>
          )}
          <Link
            to="/meus-ingressos"
            className="text-xs text-white/40 hover:text-pink-400 tracking-wide transition-colors flex items-center gap-1.5"
          >
            <Ticket size={13} />
            Meus Ingressos
          </Link>
          <Link
            to="/admin"
            className="text-xs text-white/20 hover:text-white/50 tracking-wide transition-colors"
          >
            Admin
          </Link>
        </div>

        {/* Mobile toggle */}
        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-white/60 hover:text-white transition-colors p-2"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="mx-3 sm:mx-4 mt-2 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 sm:gap-3"
              style={{
                background: 'rgba(9, 9, 9, 0.95)',
                border: '1px solid rgba(255, 140, 46, 0.2)',
                boxShadow: isMobile ? 'none' : '0 0 30px rgba(255, 140, 46, 0.15)',
              }}
            >
              {isHome && links.map((l, i) => (
                <motion.button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  initial={isMobile ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0 : i * 0.05 }}
                  className="text-left text-xs sm:text-sm tracking-widest uppercase text-white/50 hover:text-pink-400 transition-colors py-2.5 px-3 rounded-lg hover:bg-white/5"
                >
                  {l.label}
                </motion.button>
              ))}
              <div className="h-px bg-white/5 my-2" />
              {onBuyClick && canBuy && (
                <motion.button
                  onClick={() => { setOpen(false); onBuyClick(); }}
                  initial={isMobile ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isMobile ? 0 : 0.2 }}
                  className="relative mt-1 px-5 py-3 sm:py-3.5 rounded-xl text-white text-xs sm:text-sm tracking-widest uppercase font-bold flex items-center justify-center gap-2 overflow-hidden"
                  style={{
                    border: '2px solid #FF8C2E',
                    boxShadow: isMobile ? 'none' : '0 0 20px rgba(255, 140, 46, 0.3)',
                  }}
                >
                  <Ticket size={16} />
                  Comprar Ingresso
                </motion.button>
              )}
              <Link
                to="/meus-ingressos"
                className="text-xs sm:text-sm text-white/40 hover:text-pink-400 tracking-wide py-2.5 px-3 rounded-lg hover:bg-white/5 flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <Ticket size={14} />
                Meus Ingressos
              </Link>
              <Link
                to="/admin"
                className="text-xs sm:text-sm text-white/25 tracking-wide py-2.5 px-3 rounded-lg hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
