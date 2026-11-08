import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Sparkles, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { usePublicEvent } from '../../hooks/usePublicEvent';

export default function AnnouncementsSection() {
  const { data: event } = usePublicEvent();
  const [imgRatio, setImgRatio] = useState<string | null>(null);

  if (!event) return null;

  const imageUrl = '/images/poster-festa-branco.webp';

  const eventDate = event?.event_date ? new Date(event.event_date + 'T00:00:00') : null;
  const weekday = eventDate ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][eventDate.getDay()] : null;
  const day = eventDate ? String(eventDate.getDate()).padStart(2,'0') : null;
  const monthName = eventDate ? ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][eventDate.getMonth()] : null;

  return (
    <section id="avisos" className="relative py-20 sm:py-32 lg:py-40 px-4 sm:px-6 bg-[#0a0a0a] overflow-hidden bw-grain">
      {/* Decorative grid */}
      <div className="absolute inset-0 bw-grid-lines opacity-30 pointer-events-none" />

      {/* Hairlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Glow orbs */}
      <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full bg-white/4 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[250px] h-[250px] rounded-full bg-white/3 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/40" />
            <Info size={16} className="text-white/60" />
            <span className="text-[10px] tracking-[0.4em] text-white/60 uppercase font-medium">Avisos</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/40" />
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Anton', sans-serif" }}>
            Informações do Evento
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 sm:gap-8 lg:gap-10 items-stretch">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden border-2 border-white/15"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          >
            <div
              className="relative"
              style={{ aspectRatio: imgRatio ? `${imgRatio}` : '16 / 9', maxHeight: '60vh' }}
            >
              <img
                src={imageUrl}
                alt="Poster da Festa do Branco"
                loading="lazy"
                decoding="async"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight) {
                    setImgRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-white/50" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-white/50" />
            </div>
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Artist thumbnail */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 min-h-[170px] sm:min-h-[210px]">
              <img
                src="/images/dj-rayder-cutout.webp"
                alt="DJ Guhmix"
                className="absolute inset-0 h-full w-full object-cover object-top opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-5 sm:p-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/60">Atração principal</span>
                <span className="mt-2 text-3xl text-white" style={{ fontFamily: "'Anton', sans-serif" }}>DJ Guhmix</span>
                <span className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">Ao vivo na Lux House</span>
              </div>
              <div className="absolute top-3 left-3 h-6 w-6 border-l-2 border-t-2 border-white/50" />
              <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-white/50" />
            </div>

            {/* Date card */}
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/5">
                  <Calendar size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 font-bold">Quando</div>
                  <div className="text-white font-bold text-sm sm:text-base mt-0.5">
                    {weekday && day && monthName ? `${weekday}, ${day} de ${monthName}` : 'Em breve'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/5">
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 font-bold">Horário</div>
                  <div className="text-white font-bold text-sm sm:text-base mt-0.5">{event?.event_time || 'A definir'}</div>
                </div>
              </div>
            </div>

            {/* Location card */}
            <div className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/5">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 font-bold">Onde</div>
                  <div className="text-white font-bold text-sm sm:text-base mt-0.5">{event?.location || 'A definir'}</div>
                </div>
              </div>
            </div>

            {/* Dress code card */}
            <div className="rounded-2xl border-2 border-white/25 bg-white/8 p-5 sm:p-6 backdrop-blur-sm flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles size={18} className="text-white" />
                <div className="text-[9px] tracking-[0.3em] uppercase text-white/50 font-bold">Dress Code</div>
              </div>
              <p className="text-white font-bold text-lg sm:text-xl" style={{ fontFamily: "'Anton', sans-serif" }}>
                TODOS DE BRANCO
              </p>
              <p className="text-white/40 text-xs sm:text-sm mt-2 leading-relaxed">
                Vista-se de branco e faça parte da experiência visual única da noite.
              </p>
            </div>

            {/* Ticket note */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 flex items-center gap-3">
              <Ticket size={16} className="text-white/60 shrink-0" />
              <p className="text-white/50 text-xs sm:text-sm leading-snug">
                Ingressos limitados. Garanta o seu antes que o lote acabe.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
