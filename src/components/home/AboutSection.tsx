import { Calendar, Headphones, MapPin, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const details = [
  { Icon: Headphones, label: 'Atração principal', value: 'DJ Guhmix' },
  { Icon: Music, label: 'Experiência', value: 'Ao vivo' },
  { Icon: MapPin, label: 'Cidade', value: 'Valinhos' },
  { Icon: Calendar, label: 'Data', value: '04.12' },
];

export default function AboutSection() {
  return (
    <section id="sobre" className="bg-white text-neutral-950">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-28">
        <div className="flex flex-col gap-5 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">01 / A experiência</p><h2 className="mt-4 font-display text-6xl font-black uppercase leading-[0.85] tracking-[-0.06em] sm:text-8xl">A noite<br />tem nome.</h2></div><p className="max-w-xs text-xs uppercase tracking-[0.18em] text-neutral-500">Música. Energia. Presença.</p></div>
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex min-h-[460px] items-end justify-center overflow-hidden bg-[#ededeb] sm:min-h-[610px]">
            <div className="absolute left-6 top-7 font-display text-7xl font-black uppercase tracking-[-0.08em] text-neutral-300 sm:text-[10rem]">Guhmix</div>
            <img src="/images/Retrato_com_capuz_cinza_texturizado.png" alt="DJ Guhmix usando moletom cinza" className="relative z-10 h-full w-full object-contain object-bottom" loading="lazy" />
            <div className="absolute bottom-5 left-5 z-20 bg-white px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em]">Atração principal</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="max-w-[9ch] font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-7xl">Uma noite em preto e branco.</h3>
            <p className="mt-7 max-w-xl text-base leading-7 text-neutral-700">A Lux House apresenta uma edição especial da Festa do Branco, com o DJ Guhmix no comando. Uma experiência pensada para unir música, presença e uma estética marcante em Valinhos.</p>
            <p className="mt-5 max-w-xl text-sm leading-6 text-neutral-500">Vista-se de branco e prepare-se para uma noite de energia, elegância e os melhores hits.</p>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">{details.map(({ Icon, label, value }) => <div key={label} className="border border-neutral-200 bg-[#fafafa] p-4 sm:p-5"><Icon size={19} /><p className="mt-7 font-display text-xl font-bold uppercase sm:text-2xl">{value}</p><p className="mt-1 text-xs text-neutral-500">{label}</p></div>)}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
