import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';

const contactInfo = [
  { icon: MapPin, text: 'Vinhedo, SP' },
  { icon: Phone, text: '+55 (19) 97143-3837' },
  { icon: Mail, text: 'pedropapagames@gmail.com' },
];

const footerLinks = [
  { label: 'Comprar Ingressos', to: '/' },
  { label: 'Painel Administrativo', to: '/admin' },
];

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 bw-grain overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="absolute bottom-0 left-1/3 w-[500px] h-[250px] rounded-full bg-white/3 blur-[150px] pointer-events-none" />

      <div className="lux-container py-16 sm:py-20 relative">
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 mb-10 sm:mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <picture>
                  <source srcSet="/images/monograma-lh.webp" type="image/webp" />
                  <img
                    src="/images/monograma-lh.webp"
                    alt="Lux House"
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-full invert p-0.5 bg-white/5 ring-1 ring-white/15"
                  />
                </picture>
              </motion.div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white tracking-[0.08em]" style={{ fontFamily: "'Anton', sans-serif" }}>
                  Lux House
                </div>
                <div className="text-[8px] sm:text-[9px] tracking-[0.32em] sm:tracking-[0.4em] text-white/40 uppercase mt-0.5">Festa do Branco</div>
              </div>
            </div>
            <p className="text-white/35 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-xs">
              A experiência mais vibrante em Vinhedo-SP, com os melhores DJs e atrações. Curta cada segundo.
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-white/30 to-transparent" />
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold mb-5">Contato</h4>
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/12 bg-white/5 transition-all duration-300 group-hover:border-white/25">
                    <Icon size={14} className="text-white sm:!size-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-white/50 leading-snug">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-bold mb-5">Links</h4>
            <div className="space-y-2 sm:space-y-3">
              {footerLinks.map(({ label, to }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <Link
                    to={to}
                    className="block text-sm text-white/40 hover:text-white transition-colors duration-300 py-1"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 sm:pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] sm:text-xs text-white/25 tracking-wide flex items-center gap-2">
              Feito com <Heart size={12} className="text-white/50" /> pela Lux House
            </p>
            <div className="hidden md:block h-px flex-1 mx-8 max-w-xs bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-white/20">
              <span className="tracking-wider">2026 Lux House — Festa do Branco</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
