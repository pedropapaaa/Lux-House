import { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Car, Train, Calendar, Zap } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent } from '../../hooks/usePublicEvent';

const COMING_SOON = 'Em breve';

const MapSection = memo(function MapSection() {
  const isMobile = useIsMobile();
  const { data: event } = usePublicEvent();
  const [mapVisible, setMapVisible] = useState(false);

  // Defer iframe load until section is near viewport
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    const el = document.getElementById('local');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isComingSoon = event?.status === 'coming_soon';
  const location = event?.location || (isComingSoon ? COMING_SOON : 'Rod. Edenor João Tasca, 980, Vinhedo - SP');
  const time = event?.event_time || (isComingSoon ? COMING_SOON : '21h00 - 03h30');

  const dateObj = event?.event_date ? new Date(event.event_date + 'T00:00:00') : null;
  const weekday = dateObj ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][dateObj.getDay()] : null;
  const day = dateObj ? String(dateObj.getDate()).padStart(2,'0') : null;
  const monthName = dateObj ? ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][dateObj.getMonth()] : null;

  const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.92044944303!2d-46.963326200000004!3d-23.0266929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf2d40e0f25a5b%3A0x2f788dcc83ff167b!2sRod.%20Edenor%20Jo%C3%A3o%20Tasca%2C%20980%2C%20Vinhedo%20-%20SP%2C%2013280-000!5e0!3m2!1spt-BR!2sbr!4v1783061992069!5m2!1spt-BR!2sbr';

  return (
    <section className="py-16 sm:py-24 sm:py-32 lg:py-40 px-4 sm:px-6 relative overflow-hidden bg-dark-900 grain-overlay">
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-magenta-500/6 blur-[180px]" />
          <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] rounded-full bg-purple-500/6 blur-[200px]" />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-magenta-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14 lg:mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <Zap size={16} className="text-purple-400" style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 8px #7A00FF)' }} />
            <span className="text-[10px] tracking-[0.5em] text-purple-400/80 uppercase font-medium">Localizacao</span>
            <Zap size={16} className="text-magenta-400" style={{ filter: isMobile ? 'none' : 'drop-shadow(0 0 8px #E90083)' }} />
          </div>
          <h2 className="text-3xl sm:text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-ivory uppercase tracking-tight">
            COMO{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7A00FF 0%, #E90083 40%, #FF2BA6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CHEGAR
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Map embed */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {!isMobile && (
              <div
                className="absolute -inset-3 rounded-3xl opacity-25 blur-2xl"
                style={{ background: 'linear-gradient(135deg, #7A00FF, #E90083)' }}
              />
            )}

            <div
              className="relative rounded-2xl overflow-hidden h-56 sm:h-72 sm:h-80 lg:h-[480px]"
              style={{
                border: '2px solid rgba(122, 0, 255, 0.25)',
                boxShadow: isMobile ? 'none' : '0 0 40px rgba(122, 0, 255, 0.15)',
              }}
            >
              {mapVisible && (
              <iframe
                title="Local do evento"
                src={mapSrc}
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
              />
              )}
              {!mapVisible && (
                <div className="w-full h-full flex items-center justify-center bg-dark-900">
                  <MapPin size={32} className="text-magenta-400/30" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <div className="space-y-4 sm:space-y-5">
            {[
              {
                icon: MapPin,
                label: 'LOCAL',
                accent: '#7A00FF',
                content: location,
              },
              {
                icon: Clock,
                label: 'HORÁRIO',
                accent: '#245CFF',
                content: time,
              },
            ].map(({ icon: Icon, label, accent, content }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : i * 0.1 }}
                className="group"
              >
                <div
                  className="rounded-2xl p-4 sm:p-6 transition-all duration-300"
                  style={{
                    background: 'rgba(9, 2, 15, 0.6)',
                    border: `1px solid ${accent}20`,
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-5">
                    <div
                      className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `${accent}15`,
                        boxShadow: isMobile ? 'none' : `0 0 20px ${accent}30`,
                      }}
                    >
                      <Icon size={18} style={{ color: accent }} className="sm:!size-5" />
                    </div>
                    <div>
                      <div
                        className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mb-1.5 sm:mb-2 font-bold"
                        style={{ color: accent }}
                      >
                        {label}
                      </div>
                      <div className="text-ivory/70 text-xs sm:text-sm sm:text-base leading-relaxed">{content}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : 0.2 }}
              >
                <div
                  className="rounded-2xl p-4 sm:p-6 h-full"
                  style={{
                    background: 'rgba(9, 2, 15, 0.6)',
                    border: '1px solid rgba(122, 0, 255, 0.15)',
                  }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                    style={{
                      background: 'rgba(122, 0, 255, 0.15)',
                      boxShadow: isMobile ? 'none' : '0 0 20px rgba(122, 0, 255, 0.3)',
                    }}
                  >
                    <Car size={18} className="text-purple-400 sm:!size-5" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] tracking-widest text-purple-400/70 uppercase mb-1 sm:mb-1.5 font-medium">Estacionamento</div>
                  <div className="text-ivory/50 text-xs sm:text-sm">{isComingSoon ? COMING_SOON : 'Disponivel no local'}</div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : 0.25 }}
              >
                <div
                  className="rounded-2xl p-4 sm:p-6 h-full"
                  style={{
                    background: 'rgba(9, 2, 15, 0.6)',
                    border: '1px solid rgba(36, 92, 255, 0.15)',
                  }}
                >
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                    style={{
                      background: 'rgba(36, 92, 255, 0.15)',
                      boxShadow: isMobile ? 'none' : '0 0 20px rgba(36, 92, 255, 0.3)',
                    }}
                  >
                    <Train size={18} className="text-blue-400 sm:!size-5" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] tracking-widest text-blue-400/70 uppercase mb-1 sm:mb-1.5 font-medium">Acesso</div>
                  <div className="text-ivory/50 text-xs sm:text-sm">{isComingSoon ? COMING_SOON : 'Seguir instruçoes no local'}</div>
                </div>
              </motion.div>
            </div>

            {/* Date highlight */}
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: isMobile ? 0 : 0.3 }}
            >
              <div
                className="rounded-2xl p-4 sm:p-6 sm:p-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(122, 0, 255, 0.1), rgba(233, 0, 131, 0.1))',
                  border: '2px solid rgba(122, 0, 255, 0.25)',
                  boxShadow: isMobile ? 'none' : '0 0 40px rgba(122, 0, 255, 0.15)',
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #7A00FF, #E90083)',
                      boxShadow: isMobile ? 'none' : '0 0 20px rgba(122, 0, 255, 0.4)',
                    }}
                  >
                    <Calendar size={16} className="text-white sm:!size-4" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] tracking-[0.3em] text-magenta-400 uppercase font-bold">Data do Evento</div>
                </div>
                <div className="text-2xl sm:text-3xl sm:text-4xl font-display font-bold text-ivory mb-2">
                  {isComingSoon ? COMING_SOON : (weekday && day && monthName ? `${weekday}, ${day} de ${monthName}` : COMING_SOON)}
                </div>
                <div className="text-ivory/40 text-xs sm:text-sm tracking-widest">{isComingSoon ? COMING_SOON : (event?.event_time || '--H')}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default MapSection;
