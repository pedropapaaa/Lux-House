import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Ticket } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';

const links = [
  { label: 'Início', href: '#home' },
  { label: 'Atrações', href: '#atracoes' },
  { label: 'Local', href: '#local' },
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
      className={`fixed top-0 left-0 right-0 z-50 bg-[#f4f4f2]/95 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? 'py-2.5 border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)]' : 'py-3 sm:py-4 border-black/5'
      }`}
    >
      <div className="lux-container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
          <motion.img
            src="/images/logo.webp"
            alt="Lux House"
            width={48}
            height={48}
            loading="eager"
            whileHover={isMobile ? undefined : { scale: 1.06, rotate: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-full ring-1 ring-black/10"
          />
          <span className="h-8 w-px bg-black/25" aria-hidden />
          <span className="leading-none">
            <span className="block text-[13px] sm:text-[15px] font-bold tracking-[0.18em] text-black">LUX HOUSE</span>
            <span className="block mt-1 text-[8px] sm:text-[9px] font-semibold tracking-[0.42em] text-black/60 uppercase">Apresenta</span>
          </span>
        </Link>

        {isHome && (
          <div className="hidden md:flex items-center gap-8 lg:gap-12">
            {links.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className={`relative py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors ${
                  active === l.href ? 'text-black' : 'text-black/60 hover:text-black'
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1 left-1/2 h-[2px] -translate-x-1/2 bg-black transition-all duration-300 ${
                    active === l.href ? 'w-[130%]' : 'w-0'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-5">
          <Link to="/meus-ingressos" className="text-[12px] font-medium text-black/55 hover:text-black transition-colors">
            Meus Ingressos
          </Link>
          <Link to="/admin" className="text-[12px] font-medium text-black/35 hover:text-black transition-colors">
            Admin
          </Link>
          {onBuyClick && canBuy && (
            <motion.button
              onClick={onBuyClick}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-lg border-2 border-black px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.04em] text-black transition-colors duration-200 hover:bg-black hover:text-white"
            >
              <Ticket size={16} />
              Comprar
            </motion.button>
          )}
        </div>

        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2.5 rounded-lg text-black hover:bg-black/5 transition-colors"
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
            <div className="mx-4 mt-3 mb-2 flex flex-col gap-1 rounded-2xl border border-black/10 bg-white p-3 shadow-xl">
              {isHome && links.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="rounded-lg px-3 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-black/70 hover:bg-black/5 hover:text-black"
                >
                  {l.label}
                </button>
              ))}
              <div className="my-2 h-px bg-black/10" />
              {onBuyClick && canBuy && (
                <button
                  onClick={() => { setOpen(false); onBuyClick(); }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                >
                  <Ticket size={16} />
                  Comprar Ingresso
                </button>
              )}
              <Link
                to="/meus-ingressos"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-black/60 hover:bg-black/5"
              >
                <Ticket size={14} />
                Meus Ingressos
              </Link>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-black/40 hover:bg-black/5"
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
