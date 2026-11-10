import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Ticket } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';

const links = [
  { label: 'Início', href: '#home' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Avisos', href: '#avisos' },
  { label: 'Evento', href: '#avisos' },
  { label: 'FAQ', href: '#faq' },
];

interface NavbarProps {
  onBuyClick?: () => void;
}

export default function Navbar({ onBuyClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isMobile = useIsMobile();
  const { data: event } = usePublicEvent();
  const { data: settings } = useSettings();
  const salesEnabled = settings?.sales_enabled ?? true;
  const canBuy = !!event && salesEnabled && event.status !== 'coming_soon' && event.status !== 'ended';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    setActive(href);
    if (!isHome) return;
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={isMobile ? false : { y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-black/90 text-white backdrop-blur-xl py-2.5 border-b border-white/10'
          : 'bg-white/80 text-neutral-950 backdrop-blur-md py-4 border-b border-black/10'
      }`}
    >
      <div className="lux-container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
          <motion.img
            src="/images/monograma-lh.webp"
            alt="Lux House"
            width={48}
            height={48}
            loading="eager"
            whileHover={isMobile ? undefined : { scale: 1.06, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-full ring-1 ${scrolled ? 'ring-white/20 invert' : 'ring-black/15'} bg-white/80 p-0.5`}
          />
          <span className={`h-8 w-px ${scrolled ? 'bg-white/25' : 'bg-black/20'}`} aria-hidden />
          <span className="leading-none">
            <span className={`block text-[13px] sm:text-[15px] font-bold tracking-[0.18em] ${scrolled ? 'text-white' : 'text-neutral-950'}`}>LUX HOUSE</span>
            <span className={`block mt-1 text-[8px] sm:text-[9px] font-semibold tracking-[0.42em] uppercase ${scrolled ? 'text-white/50' : 'text-neutral-500'}`}>Festa do Branco</span>
          </span>
        </Link>

        {isHome && (
          <div className="hidden md:flex items-center gap-7 lg:gap-10">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className={`relative py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                  active === l.href ? (scrolled ? 'text-white' : 'text-neutral-950') : (scrolled ? 'text-white/50 hover:text-white' : 'text-neutral-500 hover:text-neutral-950')
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 transition-all duration-300 ${scrolled ? 'bg-white' : 'bg-neutral-950'} ${
                    active === l.href ? 'w-[130%]' : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-5">
          <Link to="/meus-ingressos" className={`text-[12px] font-medium transition-colors ${scrolled ? 'text-white/45 hover:text-white' : 'text-neutral-500 hover:text-neutral-950'}`}>
            Meus Ingressos
          </Link>
          {onBuyClick && canBuy && (
            <motion.button
              onClick={onBuyClick}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              className={`bw-shimmer-btn flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.04em] transition-colors duration-200 ${scrolled ? 'border-white text-white hover:bg-white hover:text-black' : 'border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-700'}`}
            >
              <Ticket size={16} />
              Comprar
            </motion.button>
          )}
        </div>

        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
          className={`md:hidden rounded-lg p-2.5 transition-colors ${scrolled ? 'text-white hover:bg-white/10' : 'text-neutral-950 hover:bg-black/5'}`}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="mx-4 mt-3 mb-2 flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-xl">
              {isHome && links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="rounded-lg px-3 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {l.label}
                </button>
              ))}
              <div className="my-2 h-px bg-white/10" />
              {onBuyClick && canBuy && (
                <button
                  onClick={() => { setOpen(false); onBuyClick(); }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-black"
                >
                  <Ticket size={16} />
                  Comprar Ingresso
                </button>
              )}
              <Link
                to="/meus-ingressos"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-white/50 hover:bg-white/5"
              >
                <Ticket size={14} />
                Meus Ingressos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
