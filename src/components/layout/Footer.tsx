import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Heart, Zap } from 'lucide-react';

const contactInfo = [
  { icon: MapPin, text: 'Vinhedo, SP', accent: '#FF5A00' },
  { icon: Phone, text: '+55 (19) 97143-3837', accent: '#8B5CF6' },
  { icon: Mail, text: 'pedropapagames@gmail.com', accent: '#38BDF8' },
];

const footerLinks = [
  { label: 'Comprar Ingressos', to: '/' },
  { label: 'Painel Administrativo', to: '/admin' },
];

export default function Footer() {
  return (
    <footer className="relative bg-dark-950 overflow-hidden">
      {/* Neon background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-pink-500/5 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* Decorative line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-6">
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
                    className="w-14 h-14 object-contain rounded-full"
                    style={{ filter: 'drop-shadow(0 0 16px rgba(255, 90, 0, 0.5))' }}
                  />
                </picture>
              </motion.div>
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #FF5A00, #8B5CF6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Lux House
                </div>
                <div className="text-[9px] tracking-[0.5em] text-pink-400/50 uppercase mt-0.5">Casa de Show</div>
              </div>
            </div>
            <p className="text-white/35 text-sm leading-relaxed mb-6 max-w-xs">
              A experiencia mais vibrante em Vinhedo-SP, com os melhores combos e atracoes. Curta cada segundo.
            </p>
            {/* Decorative lightning bolts */}
            <div className="flex items-center gap-3">
              <Zap size={14} className="text-pink-400" style={{ filter: 'drop-shadow(0 0 6px #FF5A00)' }} />
              <Zap size={18} className="text-purple-400" style={{ filter: 'drop-shadow(0 0 8px #8B5CF6)' }} />
              <Zap size={12} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 5px #38BDF8)' }} />
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-pink-400/70 mb-6 font-bold">Contato</h4>
            <div className="space-y-4">
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
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: `${accent}15`,
                      boxShadow: `0 0 15px ${accent}25`,
                    }}
                  >
                    <Icon size={16} style={{ color: accent }} />
                  </div>
                  <span className="text-sm text-white/50 leading-snug">{text}</span>
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
            <h4 className="text-[10px] tracking-[0.4em] uppercase text-purple-400/70 mb-6 font-bold">Links</h4>
            <div className="space-y-3">
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
                    className="block text-sm text-white/40 hover:text-pink-400 transition-colors duration-300 py-1"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/25 tracking-wide flex items-center gap-2">
              Feito com <Heart size={12} className="text-pink-500" style={{ filter: 'drop-shadow(0 0 4px #FF5A00)' }} /> pela Lux House
            </p>
            <div className="hidden md:block h-px flex-1 mx-8 max-w-xs bg-gradient-to-r from-transparent via-pink-500/15 to-transparent" />
            <div className="flex items-center gap-4 text-xs text-white/20">
              <span className="tracking-wider">2026 Lux House - Casa de Show</span>
              <span className="text-white/10">|</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
