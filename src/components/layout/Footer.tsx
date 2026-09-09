import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';

const contactInfo = [
  { icon: MapPin, text: 'Vinhedo, SP', accent: '#7A00FF' },
  { icon: Phone, text: '+55 (19) 97143-3837', accent: '#E90083' },
  { icon: Mail, text: 'pedropapagames@gmail.com', accent: '#245CFF' },
];

const footerLinks = [
  { label: 'Comprar Ingressos', to: '/' },
  { label: 'Painel Administrativo', to: '/admin' },
];

export default function Footer() {
  return (
    <footer className="relative bg-dark-950 border-t border-white/8">
      {/* Neon background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-magenta-500/5 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* Decorative line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-magenta-500/30 to-transparent" />

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
                  <source srcSet="/images/logo.webp" type="image/webp" />
                  <img
                    src="/images/logo.webp"
                    alt="Lux House"
                    width={56}
                    height={56}
                    loading="lazy"
                    className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-full"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(122, 0, 255, 0.35))' }}
                  />
                </picture>
              </motion.div>
              <div>
                <div
                  className="font-roma text-2xl sm:text-3xl font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #B970FF 0%, #7A00FF 50%, #E90083 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.08em',
                  }}
                >
                  Lux House
                </div>
                <div className="text-[8px] sm:text-[9px] tracking-[0.32em] sm:tracking-[0.4em] text-white/40 uppercase mt-0.5">Casa de Show</div>
              </div>
            </div>
            <p className="text-ivory/35 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-xs">
              A experiencia mais vibrante em Vinhedo-SP, com os melhores combos e atracoes. Curta cada segundo.
            </p>
            {/* Decorative lightning bolts */}
            <div className="h-px w-16 bg-gradient-to-r from-magenta-500 to-transparent" />
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="lux-eyebrow mb-5">Contato</h4>
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map(({ icon: Icon, text, accent }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center gap-4 group"
                >
                  <div
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: `${accent}15`,
                      boxShadow: `0 0 15px ${accent}25`,
                    }}
                  >
                    <Icon size={14} style={{ color: accent }} className="sm:!size-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-ivory/50 leading-snug">{text}</span>
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
            <h4 className="lux-eyebrow mb-5">Links</h4>
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
                    className="block text-sm text-ivory/40 hover:text-magenta-400 transition-colors duration-300 py-1"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ivory/5 pt-6 sm:pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] sm:text-xs text-ivory/25 tracking-wide flex items-center gap-2">
              Feito com <Heart size={12} className="text-magenta-500" style={{ filter: 'drop-shadow(0 0 4px #E90083)' }} /> pela Lux House
            </p>
            <div className="hidden md:block h-px flex-1 mx-8 max-w-xs bg-gradient-to-r from-transparent via-magenta-500/15 to-transparent" />
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-ivory/20">
              <span className="tracking-wider">2026 Lux House - Casa de Show</span>
              <span className="text-ivory/10">|</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
