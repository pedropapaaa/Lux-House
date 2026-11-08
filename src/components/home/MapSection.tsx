import { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Car, Calendar } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent } from '../../hooks/usePublicEvent';

const COMING_SOON = 'Em breve';

const MapSection = memo(function MapSection() {
  const isMobile = useIsMobile();
  const { data: event } = usePublicEvent();

  const isComingSoon = !event || event.status === 'coming_soon';
  const location = event?.location || COMING_SOON;
  const time = event?.event_time || COMING_SOON;

  const dateObj = event?.event_date ? new Date(event.event_date + 'T00:00:00') : null;
  const weekday = dateObj ? ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'][dateObj.getDay()] : null;
  const day = dateObj ? String(dateObj.getDate()).padStart(2,'0') : null;
  const monthName = dateObj ? ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][dateObj.getMonth()] : null;

  const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.92044944303!2d-46.963326200000004!3d-23.0266929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf2d40e0f25a5b%3A0x2f788dcc83ff167b!2sRod.%20Edenor%20Jo%C3%A3o%20Tasca%2C%20980%2C%20Vinhedo%20-%20SP%2C%2013280-000!5e0!3m2!1spt-BR!2sbr!4v1783061992069!5m2!1spt-BR!2sbr';

  return (
    <section id="local" className="relative py-20 sm:py-32 lg:py-40 px-4 sm:px-6 overflow-hidden bg-black bw-grain">
      <div className="absolute inset-0 bw-grid-lines opacity-30 pointer-events-none" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-0 w-[350px] h-[350px] rounded-full bg-white/4 blur-[180px]" />
          <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] rounded-full bg-white/3 blur-[200px]" />
        </div>
      )}

      <div className="lux-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-[10px] tracking-[0.5em] text-white/60 uppercase font-medium">Localização</span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/40" />
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Anton', sans-serif" }}>
            Como Chegar
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-start">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className="relative rounded-2xl overflow-hidden h-56 sm:h-72 sm:h-80 lg:h-[480px] border-2 border-white/15"
              style={{ boxShadow: isMobile ? 'none' : '0 0 40px rgba(255,255,255,0.08)' }}
            >
              <iframe
                title="Local do evento"
                src={mapSrc}
                className="absolute inset-0 block w-full h-full border-0"
                style={{ filter: 'grayscale(1) invert(0.9) contrast(0.9)' }}
                allowFullScreen
                loading="lazy"
              />
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-white/50 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-white/50 pointer-events-none" />
            </div>
          </motion.div>

          {/* Info */}
          <div className="space-y-4 sm:space-y-5">
            {[
              { icon: MapPin, label: 'LOCAL', content: location },
              { icon: Clock, label: 'HORÁRIO', content: time },
            ].map(({ icon: Icon, label, content }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : i * 0.1 }}
              >
                <div className="rounded-2xl p-5 sm:p-6 border border-white/12 bg-white/5 transition-all duration-300 hover:border-white/25">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 border border-white/15 bg-white/5">
                      <Icon size={18} className="text-white sm:!size-5" />
                    </div>
                    <div>
                      <div className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase mb-1.5 font-bold text-white/40">
                        {label}
                      </div>
                      <div className="text-white/80 text-xs sm:text-sm sm:text-base leading-relaxed">
                        {content}
                      </div>
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
                <div className="rounded-2xl p-4 sm:p-6 h-full border border-white/12 bg-white/5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 border border-white/15 bg-white/5">
                    <Car size={18} className="text-white sm:!size-5" />
                  </div>
                  <div className="text-[9px] tracking-widest text-white/40 uppercase mb-1 font-medium">
                    Estacionamento
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm">
                    {isComingSoon ? COMING_SOON : 'Disponível no local'}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: isMobile ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : 0.25 }}
              >
                <div className="rounded-2xl p-4 sm:p-6 h-full border border-white/12 bg-white/5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 border border-white/15 bg-white/5">
                    <MapPin size={18} className="text-white sm:!size-5" />
                  </div>
                  <div className="text-[9px] tracking-widest text-white/40 uppercase mb-1 font-medium">
                    Acesso
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm">
                    {isComingSoon ? COMING_SOON : 'Seguir instruções no local'}
                  </div>
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
              <div className="rounded-2xl p-5 sm:p-8 border-2 border-white/25 bg-white/8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border border-white/20 bg-white/5">
                    <Calendar size={16} className="text-white sm:!size-4" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] tracking-[0.3em] text-white/50 uppercase font-bold">
                    Data do Evento
                  </div>
                </div>
                <div className="text-xl sm:text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Anton', sans-serif" }}>
                  {isComingSoon
                    ? COMING_SOON
                    : weekday && day && monthName
                      ? `${weekday}, ${day} de ${monthName}`
                      : COMING_SOON}
                </div>
                <div className="text-white/40 text-xs sm:text-sm tracking-widest mt-1">
                  {isComingSoon ? COMING_SOON : (event?.event_time || '--H')}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default MapSection;
