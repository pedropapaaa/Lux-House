import { MapPin, ChevronDown, Shield, Mic, Music2, Ticket, Wine } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/useIsMobile';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';
import CountdownTimer from './CountdownTimer';

interface HeroSectionProps {
  onBuyClick: () => void;
}

const features = [
  { icon: Mic, label: 'Atrações', sub: 'ao vivo' },
  { icon: Music2, label: 'DJ', sub: 'durante a noite' },
  { icon: Wine, label: 'Drinks', sub: 'exclusivos' },
  { icon: Ticket, label: 'Ingressos', sub: 'limitados' },
];

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeUpMobile = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const MONTHS = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const COMING_SOON = 'Em breve';

export default function HeroSection({ onBuyClick }: HeroSectionProps) {
  const isMobile = useIsMobile();
  const itemVariant = isMobile ? fadeUpMobile : fadeUp;
  const { data: event } = usePublicEvent();
  const { data: settings } = useSettings();
  const salesEnabled = settings?.sales_enabled ?? true;

  const isComingSoon = event?.status === 'coming_soon';
  const isEnded = event?.status === 'ended';
  const isLive = event?.status === 'live';
  const isLastTickets = event?.status === 'last_tickets';

  const dateObj = event?.event_date ? new Date(event.event_date + 'T00:00:00') : null;
  const weekday = dateObj ? WEEKDAYS[dateObj.getDay()] : null;
  const day = dateObj ? String(dateObj.getDate()).padStart(2, '0') : null;
  const month = dateObj ? MONTHS[dateObj.getMonth()] : null;
  const time = event?.event_time || null;
  const location = event?.location || null;

  const headline = event?.name || 'A NOITE';
  const subheadline = event?.description || 'As melhores festas de Vinhedo e região com as melhores atracoes e experiencias inesqueciveis.';

  const statusLabel = isComingSoon ? 'Em breve'
    : isLive ? 'Acontecendo agora'
    : isLastTickets ? 'Últimos ingressos'
    : isEnded ? 'Evento encerrado'
    : 'Ingressos disponíveis';

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={event?.banner_url || "https://images.pexels.com/photos/19053030/pexels-photo-19053030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"}
          alt=""
          fetchPriority="high"
          className="w-full h-full object-cover object-center scale-105"
          style={{ opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/50 to-dark-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/85 via-dark-950/30 to-dark-950/70" />
      </div>

      {/* Halloween fog overlay - desktop only */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -bottom-1/4 left-0 w-[150%] h-[60%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 90, 0, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{ x: ['-10%', '10%', '-10%'], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 right-0 w-[120%] h-[50%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.05) 0%, transparent 60%)',
              filter: 'blur(70px)',
            }}
            animate={{ x: ['10%', '-10%', '10%'], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>
      )}

      {/* Neon glow orbs - hidden on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-pink-500/10 blur-[150px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[130px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-pink-600/5 blur-[100px]" />
        </div>
      )}

      {/* Floating particles - desktop only, disabled on mobile */}
      {!isMobile && (
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {[...Array(16)].map((_, i) => {
            const colors = ['#FF5A00', '#8B5CF6', '#38BDF8', '#FF8A33'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  left: `${5 + (i * 6.2) % 90}%`,
                  top: `${10 + (i * 7.3) % 80}%`,
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                }}
                animate={{ y: [-15, 15, -15], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.25 }}
              />
            );
          })}
        </div>
      )}

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT - Main content */}
          <div className="text-center lg:text-left">
            {/* Main headline */}
            <motion.div variants={itemVariant} className="mb-4">
              <h1 className="font-bold text-white leading-tight tracking-tight break-words">
                <span
                  className="block uppercase"
                  style={{
                    fontSize: 'clamp(2rem, 11vw, 5rem)',
                    textShadow: isMobile ? 'none' : '0 0 40px rgba(255,255,255,0.1)',
                  }}
                >
                  {headline.split(' ')[0]}
                </span>
                <span
                  className="block uppercase"
                  style={{
                    fontSize: 'clamp(2rem, 11vw, 5rem)',
                    background: 'linear-gradient(135deg, #FF8A33 0%, #FF5A00 50%, #C43F00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 26px rgba(255, 90, 0, 0.65))',
                  }}
                >
                  {headline.split(' ').slice(1).join(' ') || 'É NOSSA!'}
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariant} className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              {subheadline}
            </motion.p>

            {/* Feature icons */}
            <motion.div variants={itemVariant} className="grid grid-cols-4 gap-3 mb-10">
              {features.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 group">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border border-pink-500/30 transition-all duration-300 group-hover:border-pink-400/60 group-hover:scale-105"
                    style={{
                      background: 'rgba(255, 90, 0, 0.08)',
                      boxShadow: isMobile ? 'none' : '0 0 20px rgba(255, 90, 0, 0.1)',
                    }}
                  >
                    <Icon size={20} className="text-pink-400 group-hover:text-pink-300 transition-colors" />
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs font-bold text-white/80 uppercase tracking-wide leading-tight">{label}</div>
                    <div className="text-[9px] text-white/35 leading-tight">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Promo text + CTA */}
            <motion.div variants={itemVariant} className="space-y-5">
              <div className="text-center lg:text-left">
                <div
                  className="font-script text-2xl sm:text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #FF5A00, #8B5CF6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {isComingSoon
                    ? (event?.coming_soon_message || 'Ingressos em breve!')
                    : isEnded
                    ? (event?.ended_info?.final_message || 'Obrigado a todos!')
                    : isLive
                    ? 'Atração ao vivo agora!'
                    : 'Garanta ja seu ingresso!'}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="lg:hidden">
                <CountdownTimer eventDate={event?.event_date} eventTime={event?.event_time} />
              </div>

              {/* CTA button — hidden when coming soon, ended, or sales disabled */}
              {!isComingSoon && !isEnded && salesEnabled && (
                <motion.button
                  onClick={onBuyClick}
                  className="relative w-full lg:w-auto px-10 py-5 text-white font-bold text-base sm:text-lg uppercase tracking-widest overflow-hidden"
                  style={{
                    background: 'transparent',
                    border: '2px solid #FF5A00',
                    borderRadius: '14px',
                    boxShadow: isMobile ? 'none' : '0 0 20px rgba(255, 90, 0, 0.4), inset 0 0 20px rgba(255, 90, 0, 0.05)',
                  }}
                  whileHover={isMobile ? undefined : {
                    scale: 1.03,
                    boxShadow: '0 0 40px rgba(255, 90, 0, 0.6), 0 0 80px rgba(255, 90, 0, 0.2), inset 0 0 30px rgba(255, 90, 0, 0.1)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 90, 0, 0.2), rgba(139, 92, 246, 0.2))',
                    }}
                    whileHover={isMobile ? undefined : { opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative flex items-center justify-center gap-3">
                    <Ticket size={20} />
                    COMPRAR INGRESSO
                  </span>
                </motion.button>
              )}

              {/* Last tickets alert */}
              {isLastTickets && event?.last_tickets_alert && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm text-center"
                >
                  {event.last_tickets_alert}
                </motion.div>
              )}

              {/* Live info */}
              {isLive && event?.live_info && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Ao vivo agora</span>
                  </div>
                  {event.live_info.current_attraction && <div className="text-white/90 text-sm font-semibold">{event.live_info.current_attraction}</div>}
                  {event.live_info.next_attraction && <div className="text-white/40 text-xs mt-1">Próxima: {event.live_info.next_attraction}</div>}
                  {event.live_info.notices && <div className="text-white/50 text-xs mt-2">{event.live_info.notices}</div>}
                </motion.div>
              )}

              {/* Security badge */}
              {!isComingSoon && !isEnded && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-white/30 text-xs">
                  <Shield size={14} className="text-cyan-400/70" />
                  <span className="tracking-widest uppercase">Compra 100% Segura</span>
                </div>
              )}
            </motion.div>

            {/* Location + phone */}
            <motion.div
              variants={itemVariant}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mt-8 pt-8 border-t border-white/8"
            >
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <MapPin size={15} className="text-pink-400/80" />
                <span>{location || (isComingSoon ? COMING_SOON : 'Vinhedo, Sao Paulo')}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
              <div className="text-white/50 text-sm font-medium tracking-wide">
                (19) 97143-3837
              </div>
            </motion.div>
          </div>

          {/* RIGHT - Date box */}
          <motion.div
            variants={itemVariant}
            className="flex flex-col items-center lg:items-end gap-6"
          >
            {/* Neon date box */}
            <motion.div
              className="relative w-full max-w-xs"
              animate={isMobile ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Outer glow - hidden on mobile */}
              {!isMobile && (
                <div
                  className="absolute -inset-3 rounded-3xl blur-2xl opacity-30"
                  style={{ background: 'linear-gradient(135deg, #FF5A00, #8B5CF6)' }}
                />
              )}

              <div
                className="relative rounded-2xl text-center p-8 sm:p-10"
                style={{
                  background: 'rgba(9, 9, 9, 0.85)',
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, #FF5A00, #8B5CF6) 1',
                  borderRadius: '18px',
                  boxShadow: isMobile ? 'none' : '0 0 30px rgba(255, 90, 0, 0.25), 0 0 60px rgba(139, 92, 246, 0.15), inset 0 0 30px rgba(255, 90, 0, 0.03)',
                }}
              >
                {/* Day of week */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-pink-500/60" />
                  <span className="text-[11px] tracking-[0.4em] text-pink-400/70 uppercase font-medium">
                    {isComingSoon ? COMING_SOON : (weekday || COMING_SOON)}
                  </span>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-pink-500/60" />
                </div>

                {/* Day number */}
                <div
                  className="font-bold leading-none mb-2"
                  style={{
                    fontSize: 'clamp(80px, 15vw, 120px)',
                    background: 'linear-gradient(135deg, #fff 0%, #FFB37A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 30px rgba(255, 90, 0, 0.4))',
                  }}
                >
                  {isComingSoon ? '--' : (day || '--')}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent mb-4" />

                {/* Month */}
                <div
                  className="text-3xl sm:text-4xl font-bold tracking-[0.2em] uppercase mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FF5A00, #FF8A33)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 10px rgba(255, 90, 0, 0.6))',
                  }}
                >
                  {isComingSoon ? 'EM BREVE' : (month || 'EM BREVE')}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mb-4" />

                {/* Time */}
                <div className="text-4xl sm:text-5xl font-bold text-white tracking-widest"
                  style={{ textShadow: isMobile ? 'none' : '0 0 20px rgba(255,255,255,0.3)' }}>
                  {isComingSoon ? '--H' : (time || '--H')}
                </div>

                {/* Countdown Timer - Desktop only */}
                {!isComingSoon && !isEnded && (
                  <div className="hidden lg:block mt-6">
                    <CountdownTimer eventDate={event?.event_date} eventTime={event?.event_time} />
                  </div>
                )}

                {/* Pulse indicator */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-pink-500'}`}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: isMobile ? 'none' : `0 0 8px ${isLive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 90, 0, 0.8)'}` }}
                  />
                  <span className="text-xs text-white/40 tracking-[0.2em] uppercase">{statusLabel}</span>
                </div>
              </div>
            </motion.div>

            {/* Scroll cue - desktop only */}
            <motion.button
              onClick={() => document.querySelector('#atrações')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden lg:flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[10px] tracking-[0.3em] uppercase">Ver mais</span>
              <ChevronDown size={20} />
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile scroll cue */}
        <motion.button
          onClick={() => document.querySelector('#atrações')?.scrollIntoView({ behavior: 'smooth' })}
          className="lg:hidden flex flex-col items-center gap-2 text-white/30 hover:text-white/50 transition-colors mx-auto mt-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} />
        </motion.button>
      </motion.div>
    </section>
  );
}
