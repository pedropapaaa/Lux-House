import { motion } from 'framer-motion';
import { Mic2, Users, Music, Calendar, Headphones } from 'lucide-react';

const stats = [
  { icon: Headphones, label: 'Atração principal', value: 'DJ Guhmix' },
  { icon: Mic2, label: 'Experiência', value: 'Ao vivo' },
  { icon: Users, label: 'Cidade', value: 'Valinhos' },
  { icon: Calendar, label: 'Data', value: '04.12' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutSection() {
  return (
    <section id="sobre" className="relative py-20 sm:py-32 lg:py-40 px-4 sm:px-6 overflow-hidden bg-black bw-grain">
      {/* Decorative grid */}
      <div className="absolute inset-0 bw-grid-lines opacity-30 pointer-events-none" />

      {/* Top & bottom hairlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Glow orbs in white/gray */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-white/4 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-white/3 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-[10px] tracking-[0.5em] text-white/60 uppercase font-medium">A Noite</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/40" />
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Anton', sans-serif" }}>
            A Experiência
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-white/30" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">DJ Guhmix no comando</span>
            <div className="h-px w-8 bg-white/30" />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Glow behind image */}
            <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl bg-white" />

            <div className="relative rounded-2xl overflow-hidden border-2 border-white/15">
              <img
                src="/images/about-retrato.webp"
                alt="DJ Guhmix em traje branco"
                loading="lazy"
                decoding="async"
                className="relative w-full h-64 sm:h-80 sm:h-96 lg:h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Decorative corner accents */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/40" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/40" />

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 sm:right-auto sm:max-w-xs"
              >
                <div
                  className="rounded-2xl border border-white/20 bg-black/80 backdrop-blur-xl p-4 sm:p-5 flex items-center gap-4"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/20 bg-white/10">
                    <Music size={18} className="text-white sm:!size-5" />
                  </div>
                  <div>
                    <div className="text-[9px] tracking-[0.3em] text-white/50 uppercase">Set principal</div>
                    <div className="text-white font-bold text-sm">DJ Guhmix</div>
                    <div className="text-white/40 text-[10px] mt-0.5">Festa do Branco · 04.12</div>
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
            <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Anton', sans-serif" }}>
              Uma noite em <span className="text-white/50">preto e branco</span>
            </h3>

            <p className="text-white/60 leading-relaxed mb-5 text-sm sm:text-base">
              A Lux House apresenta uma edição especial da Festa do Branco, com o DJ Guhmix no comando da noite. Uma experiência pensada para unir música, presença e uma estética marcante em Valinhos.
            </p>
            <p className="text-white/45 leading-relaxed mb-10 text-xs sm:text-sm">
              Vista-se de branco e prepare-se para uma noite de energia, elegância e os melhores hits. O evento acontece em 04 de dezembro, a partir das 21h, na Lux House.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {stats.map(({ icon: Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="group cursor-default relative rounded-2xl p-4 sm:p-6 border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/25"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border border-white/15 bg-white/5">
                      <Icon size={16} className="text-white sm:!size-5" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Anton', sans-serif" }}>
                      {value}
                    </div>
                  </div>
                  <div className="text-white/40 text-[11px] sm:text-xs">{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
