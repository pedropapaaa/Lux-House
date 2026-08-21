import { memo } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Clock, Sparkles, Zap, Radio } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent, usePublicSchedule } from '../../hooks/usePublicEvent';

const COMING_SOON = 'Em breve';

const AttractionsSection = memo(function AttractionsSection() {
  const isMobile = useIsMobile();
  const { data: event } = usePublicEvent();
  const { data: schedule = [], isLoading } = usePublicSchedule(event?.id);

  const isComingSoon = event?.status === 'coming_soon';
  const isEnded = event?.status === 'ended';
  const isLive = event?.status === 'live';

  const dateObj = event?.event_date ? new Date(event.event_date + 'T00:00:00') : null;
  const weekday = dateObj ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][dateObj.getDay()] : null;
  const day = dateObj ? String(dateObj.getDate()).padStart(2,'0') : null;
  const monthName = dateObj ? ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][dateObj.getMonth()] : null;

  // Build cards from schedule; fall back to placeholder when coming soon or empty
  const cards = isComingSoon || schedule.length === 0
    ? []
    : schedule.map((s, i) => ({
        time: s.time_label,
        label: i === 0 ? 'ABERTURA' : i === schedule.length - 1 ? 'FECHAMENTO' : 'ATRAÇÃO',
        artist: s.title,
        genre: s.description || '',
        description: s.description || '',
        image: event?.photos?.[i % (event.photos.length || 1)] || `/images/files_10828746-2026-07-03T03-41-0${i % 3 + 4}13Z-image.png`,
        accent: ['#FF5A00', '#38BDF8', '#8B5CF6'][i % 3],
        badge: i === 0 ? 'DESTAQUE' : null,
      }));

  return (
    <section id="atrações" className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 relative bg-dark-900">
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-pink-500/6 blur-[180px]" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full bg-purple-500/6 blur-[200px]" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <Zap size={16} className="text-pink-400" style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 8px #FF5A00)' }} />
            <span className="text-[10px] tracking-[0.5em] text-pink-400/80 uppercase font-medium">Programacao</span>
            <Zap size={16} className="text-purple-400" style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 8px #8B5CF6)' }} />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white uppercase tracking-tight mb-4">
            ATRAÇÕES{' '}
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #FF5A00 0%, #FF8A33 40%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isComingSoon ? 'EM BREVE' : 'DA NOITE'}
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 text-white/40 text-sm sm:text-base">
            {isComingSoon ? (
              <span className="text-pink-400 font-bold">{COMING_SOON}</span>
            ) : (
              <>
                <span>{weekday}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500/60" />
                <span className="text-pink-400 font-bold">{day} de {monthName}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500/60" />
                <span>{event?.location || 'Vinhedo - SP'}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Live banner */}
        {isLive && event?.live_info && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Evento acontecendo agora</span>
            </div>
            {event.live_info.current_attraction && <div className="text-white/90 text-sm font-semibold">{event.live_info.current_attraction}</div>}
            {event.live_info.next_attraction && <div className="text-white/40 text-xs mt-1">Próxima atração: {event.live_info.next_attraction}</div>}
            {event.live_info.notices && <div className="text-white/50 text-xs mt-2">{event.live_info.notices}</div>}
          </motion.div>
        )}

        {/* Cards or coming soon state */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500/30 border-t-pink-400 animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Radio size={40} className="text-white/15 mx-auto mb-4" />
            <p className="text-white/30 text-sm">
              {isComingSoon ? 'Informação será divulgada em breve.' : isEnded ? 'Este evento já aconteceu.' : 'Programação a ser divulgada.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {cards.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: isMobile ? 0 : 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : i * 0.15 }}
                className="group relative"
              >
                {!isMobile && (
                  <div
                    className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(ellipse at center, ${a.accent}20, transparent 70%)`,
                      filter: 'blur(30px)',
                    }}
                  />
                )}

                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(9, 9, 9, 0.8)',
                    border: `2px solid ${a.accent}25`,
                    boxShadow: isMobile ? 'none' : `0 0 40px ${a.accent}15`,
                  }}
                >
                  {a.badge && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="absolute top-4 right-4 z-20"
                    >
                      <span
                        className="text-[10px] tracking-[0.25em] font-bold px-4 py-2 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${a.accent}, ${a.accent}CC)`,
                          color: '#fff',
                          boxShadow: isMobile ? 'none' : `0 4px 25px ${a.accent}60`,
                        }}
                      >
                        {a.badge}
                      </span>
                    </motion.div>
                  )}

                  <div className="relative h-56 sm:h-64 lg:h-80 overflow-hidden">
                    <img
                      src={a.image}
                      alt={`${a.artist}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent" />

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="absolute bottom-4 left-4 flex items-center gap-3"
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2 rounded-xl"
                        style={{
                          background: 'rgba(9, 9, 9, 0.8)',
                          border: `1px solid ${a.accent}40`,
                          boxShadow: isMobile ? 'none' : `0 0 25px ${a.accent}30`,
                        }}
                      >
                        <Clock size={16} style={{ color: a.accent }} />
                        <span className="text-lg font-mono font-bold" style={{ color: a.accent }}>{a.time}</span>
                      </div>
                    </motion.div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(90deg, transparent, ${a.accent}, transparent)` }}
                    />
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `${a.accent}15`,
                          boxShadow: isMobile ? 'none' : `0 0 20px ${a.accent}30`,
                        }}
                      >
                        <Headphones size={18} style={{ color: a.accent }} />
                      </div>
                      <div>
                        <div
                          className="text-[10px] tracking-widest uppercase font-bold"
                          style={{ color: a.accent }}
                        >
                          {a.label}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors duration-300">
                      {a.artist}
                    </h3>

                    {a.description && <p className="text-white/40 text-sm leading-relaxed mb-4">{a.description}</p>}

                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 flex-1 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${a.accent}60, transparent)`,
                          boxShadow: isMobile ? 'none' : `0 0 10px ${a.accent}40`,
                        }}
                      />
                      <Sparkles size={14} style={{ color: a.accent, filter: isMobile ? 'none' : `drop-shadow(0 0 4px ${a.accent})` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ended info */}
        {isEnded && event?.ended_info && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
          >
            {event.ended_info.final_message && <p className="text-white/70 text-sm mb-4">{event.ended_info.final_message}</p>}
            {event.ended_info.next_event_name && (
              <div className="text-white/50 text-sm">
                Próximo evento: <span className="text-pink-400 font-semibold">{event.ended_info.next_event_name}</span>
                {event.ended_info.next_event_date && <span className="text-white/40"> — {event.ended_info.next_event_date}</span>}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
});

export default AttractionsSection;
