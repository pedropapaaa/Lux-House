import { motion } from 'framer-motion';
import { Mic2, Users, Star, Music, Award, Flame } from 'lucide-react';

const stats = [
  { icon: Flame, label: 'Anos de Fogo', value: '12+', accent: '#FF5A00' },
  { icon: Mic2, label: 'Shows Realizados', value: '800+', accent: '#8B5CF6' },
  { icon: Users, label: 'Capacidade', value: '500', accent: '#38BDF8' },
  { icon: Music, label: 'Artistas Parceiros', value: '200+', accent: '#FF5A00' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutSection() {
  return (
    <section id="sobre" className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 relative overflow-hidden bg-dark-950">
      {/* Neon background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-500/8 blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/8 blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full bg-pink-600/3 blur-[120px]" />
      </div>

      {/* Decorative lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-500/60" />
            <span className="text-[10px] tracking-[0.5em] text-pink-400/80 uppercase font-medium">Sobre Nos</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-500/60" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white uppercase tracking-tight">
            A EXPERIENCIA{' '}
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #FF5A00 0%, #FF8A33 40%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DEFINITIVA
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Neon glow behind image */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
              style={{ background: 'linear-gradient(135deg, #FF5A00, #8B5CF6)' }}
            />

            <div className="relative rounded-2xl overflow-hidden">
              {/* Neon border */}
              <div
                className="absolute inset-0 rounded-2xl p-[2px]"
                style={{ background: 'linear-gradient(135deg, #FF5A00, #8B5CF6, #38BDF8)' }}
              >
                <div className="w-full h-full rounded-2xl bg-dark-950" />
              </div>

              <img
                src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1024"
                alt="Lux House interior"
                loading="lazy"
                decoding="async"
                className="relative w-full h-80 sm:h-96 lg:h-[520px] object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent rounded-2xl" />

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xs"
                style={{
                  background: 'rgba(9, 9, 9, 0.9)',
                  border: '1px solid rgba(255, 90, 0, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 0 30px rgba(255, 90, 0, 0.2)',
                }}
              >
                <div className="p-5 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #FF5A00, #8B5CF6)',
                      boxShadow: '0 0 20px rgba(255, 90, 0, 0.4)',
                    }}
                  >
                    <Award size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[0.3em] text-pink-400/70 uppercase">Reconhecida como</div>
                    <div className="text-white font-bold text-sm">Melhor Casa de Show</div>
                    <div className="text-white/30 text-[10px] mt-0.5">Vinhedo - SP 2024</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
              Onde a noite{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF5A00, #8B5CF6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ganha vida
              </span>
            </h3>

            <p className="text-white/50 leading-relaxed mb-6 text-base">
              A Lux House e o palco onde a musica brasileira se expressa
              em sua forma mais autentica e vibrante. Nossa casa foi construida com a missao de
              criar experiencias inesqueciveis em Vinhedo e regiao.
            </p>
            <p className="text-white/40 leading-relaxed mb-12 text-sm">
              Do funk ao eletronica, passando pelos melhores DJs - cada noite e uma experiencia
              cuidadosamente curada. Com capacidade para 300 convidados, sistema de som de ultima
              geracao e ambiente premium preparado para voce curtar cada segundo.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {stats.map(({ icon: Icon, label, value, accent }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="group cursor-default relative"
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                    style={{ background: `${accent}20` }}
                  />
                  <div
                    className="relative rounded-2xl p-6 transition-all duration-300"
                    style={{
                      background: 'rgba(9, 9, 9, 0.6)',
                      border: `1px solid ${accent}25`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${accent}15`,
                          boxShadow: `0 0 20px ${accent}30`,
                        }}
                      >
                        <Icon size={20} style={{ color: accent }} />
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${accent}, #fff)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                    <div className="text-white/40 text-xs sm:text-sm">{label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
