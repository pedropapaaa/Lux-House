import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { usePublicEvent } from '../../hooks/usePublicEvent';

export default function AnnouncementsSection() {
  const { data: event } = usePublicEvent();
  const imageUrl = event?.banner_url || '/images/IMG-20260901-WA0038.jpg';
  const [imgRatio, setImgRatio] = useState<number | null>(null);

  return (
    <section id="avisos" className="relative py-12 sm:py-20 px-4 sm:px-6 bg-dark-950 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-pink-500/60" />
            <Info size={16} className="text-pink-400/80" />
            <span className="text-[10px] tracking-[0.4em] text-pink-400/80 uppercase font-medium">Avisos</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-pink-500/60" />
          </div>
        </motion.div>

        {/* Banner image — adapts to the image's natural aspect ratio */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            // Use the image's natural ratio once known; fall back to 16/9
            aspectRatio: imgRatio ? `${imgRatio}` : '16 / 9',
            maxHeight: '70vh',
          }}
        >
          {/* Subtle border glow */}
          <div
            className="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,140,46,0.3), rgba(212,132,46,0.15), transparent)' }}
          >
            <div className="w-full h-full rounded-2xl bg-dark-950" />
          </div>

          <img
            src={imageUrl}
            alt="Avisos do evento"
            loading="lazy"
            decoding="async"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setImgRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
              }
            }}
            className="relative w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(8,6,5,0.7) 100%)' }} />
        </motion.div>
      </div>
    </section>
  );
}
