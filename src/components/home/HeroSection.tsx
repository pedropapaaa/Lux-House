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

  const headline = event?.name || 'LUX HOUSE';
  const subheadline = event?.description || 'As melhores festas de Vinhedo e região com as melhores atracoes e experiencias inesqueciveis.';

  const statusLabel = isComingSoon ? 'Em breve'
    : isLive ? 'Acontecendo agora'
    : isLastTickets ? 'Últimos ingressos'
    : isEnded ? 'Evento encerrado'
    : 'Ingressos disponíveis';

  return (
    <section id="home" className="relative flex items-center justify-center overflow-hidden bg-dark-950 grain-overlay" style={{ minHeight: '52vh' }}>
      {/* Background — deep black/purple with neon gradients */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(9,2,15,0.7) 0%, rgba(13,4,24,0.4) 40%, rgba(21,8,40,0.5) 70%, rgba(9,2,15,0.9) 100%)' }} />
        {/* Side vignette for text readability */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(9,2,15,0.4) 0%, transparent 25%, transparent 75%, rgba(9,2,15,0.35) 100%)' }} />
        {/* Neon purple glow — positioned lower */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(122,0,255,0.18) 0%, rgba(233,0,131,0.08) 35%, transparent 75%)' }} />
        {/* Magenta accent glow — right side */}
        <div className="absolute top-1/4 right-0 w-[min(500px,80vw)] h-[min(500px,80vw)] rounded-full" style={{ background: 'rgba(233,0,131,0.06)', filter: 'blur(150px)' }} />
        {/* Sunset glow — very subtle, bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(600px,90vw)] h-[200px] rounded-full" style={{ background: 'rgba(255,90,36,0.04)', filter: 'blur(100px)' }} />
      </div>

      {/* Neon atmosphere — light rays, particles, glow orbs */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          {/* God rays — soft neon beams from top */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute top-0"
              style={{
                left: `${15 + i * 22}%`,
                width: '120px',
                height: '60%',
                background: `linear-gradient(180deg, ${i % 2 === 0 ? 'rgba(122,0,255,0.06)' : 'rgba(233,0,131,0.06)'} 0%, transparent 100%)`,
                transform: `rotate(${i % 2 === 0 ? -8 : 8}deg)`,
                transformOrigin: 'top center',
                filter: 'blur(20px)',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.5, ease: 'easeInOut' }}
            />
          ))}

          {/* Neon shimmer line at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '6px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(122,0,255,0.15) 30%, rgba(233,0,131,0.25) 50%, rgba(122,0,255,0.15) 70%, transparent 100%)',
              filter: 'blur(3px)',
            }}
            animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.95, 1, 0.95] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Neon particles floating */}
          {[...Array(16)].map((_, i) => {
            const colors = ['#7A00FF', '#E90083', '#FF2BA6', '#245CFF'];
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

      {/* Mobile atmosphere — single glow + particles */}
      {isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          <div className="absolute top-1/4 right-0 w-[min(300px,70vw)] h-[min(300px,70vw)] rounded-full" style={{ background: 'rgba(233,0,131,0.05)', filter: 'blur(100px)' }} />
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '70px' }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`m-spark-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 2,
                  height: 2,
                  left: `${15 + i * 17}%`,
                  bottom: `${10 + (i * 12) % 45}px`,
                  background: '#FF2BA6',
                  boxShadow: '0 0 6px rgba(255,43,166,0.8)',
                }}
                animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 0.3] }}
                transition={{ duration: 2.5 + (i % 3), repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Neon mist — subtle */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -bottom-1/4 left-0 w-[100%] h-[50%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(122,0,255,0.04) 0%, rgba(233,0,131,0.03) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{ x: ['-10%', '10%', '-10%'], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 right-0 w-[100%] h-[40%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,43,166,0.03) 0%, transparent 60%)',
              filter: 'blur(70px)',
            }}
            animate={{ x: ['10%', '-10%', '10%'], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>
      )}

      {/* Glow orbs - hidden on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[min(500px,70vw)] h-[min(500px,70vw)] rounded-full" style={{ background: 'rgba(122,0,255,0.06)', filter: 'blur(150px)' }} />
          <div className="absolute bottom-1/3 right-1/3 w-[min(400px,60vw)] h-[min(400px,60vw)] rounded-full" style={{ background: 'rgba(233,0,131,0.04)', filter: 'blur(130px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,90vw)] h-[300px] rounded-full" style={{ background: 'rgba(36,92,255,0.02)', filter: 'blur(100px)' }} />
        </div>
      )}

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-12 sm:pb-16"
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] gap-10 sm:gap-12 lg:gap-20 items-center">
          {/* LEFT - Main content */}
          <div className="text-center lg:text-left">
            {/* Main headline */}
            <motion.div variants={itemVariant} className="mb-4">
              <h1 className="font-display font-extrabold text-ivory leading-[0.95] tracking-tight">
                <span
                  className="block uppercase break-words"
                  style={{
                    fontSize: 'clamp(2rem, 8vw, 5rem)',
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #F8F4FF 0%, #B970FF 30%, #7A00FF 60%, #E90083 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: isMobile ? 'none' : '0 0 60px rgba(122,0,255,0.2), 0 0 120px rgba(233,0,131,0.1)',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 35px rgba(233, 0, 131, 0.6)) drop-shadow(0 0 70px rgba(122, 0, 255, 0.2))',
                    lineHeight: '0.95',
                  }}
                >
                  {headline}
                </span>
              </h1>
              {/* Decorative underline — neon glow */}
              <motion.div
                className="h-1 rounded-full mt-3"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(122,0,255,0.6) 20%, #E90083 50%, rgba(122,0,255,0.6) 80%, transparent 100%)',
                  maxWidth: '300px',
                  boxShadow: '0 0 12px rgba(233,0,131,0.4)',
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariant} className="text-ivory/55 text-sm sm:text-base sm:text-lg leading-relaxed sm:leading-relaxed mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto lg:mx-0">
              {subheadline}
            </motion.p>

            {/* Feature icons */}
            <motion.div variants={itemVariant} className="grid grid-cols-4 gap-2 sm:gap-3 mb-8 sm:mb-10">
              {features.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 group">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border border-magenta-500/30 transition-all duration-300 group-hover:border-magenta-400/60 group-hover:scale-105"
                    style={{
                      background: 'rgba(122, 0, 255, 0.08)',
                      boxShadow: isMobile ? 'none' : '0 0 20px rgba(122, 0, 255, 0.1)',
                    }}
                  >
                    <Icon size={18} className="text-magenta-400 group-hover:text-pink-300 transition-colors sm:!size-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] sm:text-xs font-bold text-ivory/80 uppercase tracking-wide leading-tight">{label}</div>
                    <div className="text-[8px] sm:text-[9px] text-ivory/35 leading-tight">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Promo text + CTA */}
            <motion.div variants={itemVariant} className="space-y-4 sm:space-y-5">
              <div className="text-center lg:text-left">
                <div
                  className="font-script text-xl sm:text-2xl sm:text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, #FF2BA6, #7A00FF)',
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

              {/* CTA button — magenta/pink gradient with glow */}
              {!isComingSoon && !isEnded && salesEnabled && (
                <motion.button
                  onClick={onBuyClick}
                  className="relative w-full lg:w-auto px-8 sm:px-10 py-4 sm:py-5 text-white font-bold text-sm sm:text-base sm:text-lg uppercase tracking-widest overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #E90083, #FF2BA6)',
                    border: 'none',
                    borderRadius: '14px',
                    boxShadow: isMobile ? 'none' : '0 0 20px rgba(233, 0, 131, 0.4), 0 0 40px rgba(255, 43, 166, 0.15)',
                  }}
                  whileHover={isMobile ? undefined : {
                    scale: 1.03,
                    boxShadow: '0 0 40px rgba(233, 0, 131, 0.6), 0 0 80px rgba(255, 43, 166, 0.2)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 43, 166, 0.3), rgba(122, 0, 255, 0.3))',
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
                  {event.live_info.current_attraction && <div className="text-ivory/90 text-sm font-semibold">{event.live_info.current_attraction}</div>}
                  {event.live_info.next_attraction && <div className="text-ivory/40 text-xs mt-1">Próxima: {event.live_info.next_attraction}</div>}
                  {event.live_info.notices && <div className="text-ivory/50 text-xs mt-2">{event.live_info.notices}</div>}
                </motion.div>
              )}

              {/* Security badge */}
              {!isComingSoon && !isEnded && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-ivory/30 text-xs">
                  <Shield size={14} className="text-blue-400/70" />
                  <span className="tracking-widest uppercase">Compra 100% Segura</span>
                </div>
              )}
            </motion.div>

            {/* Location + phone */}
            <motion.div
              variants={itemVariant}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-ivory/8"
            >
              <div className="flex items-center gap-2 text-ivory/50 text-xs sm:text-sm">
                <MapPin size={14} className="text-magenta-400/80 sm:!size-4" />
                <span>{location || (isComingSoon ? COMING_SOON : 'Vinhedo, Sao Paulo')}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-ivory/20" />
              <div className="text-ivory/50 text-xs sm:text-sm font-medium tracking-wide">
                (19) 97143-3837
              </div>
            </motion.div>
          </div>

          {/* RIGHT - Date box */}
          <motion.div
            variants={itemVariant}
            className="flex flex-col items-center lg:items-end gap-4 sm:gap-6"
          >
            {/* Neon date box */}
            <motion.div
              className="relative w-full max-w-[300px] sm:max-w-[340px]"
              animate={isMobile ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Outer glow - hidden on mobile */}
              {!isMobile && (
                <div
                  className="absolute -inset-3 rounded-3xl blur-2xl opacity-30"
                  style={{ background: 'linear-gradient(135deg, #7A00FF, #E90083)' }}
                />
              )}

              <div
                className="relative rounded-2xl text-center p-4 sm:p-8 sm:p-10"
                style={{
                  background: 'rgba(9, 2, 15, 0.85)',
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, #7A00FF, #E90083) 1',
                  borderRadius: '18px',
                  boxShadow: isMobile ? 'none' : '0 0 30px rgba(122, 0, 255, 0.25), 0 0 60px rgba(233, 0, 131, 0.15), inset 0 0 30px rgba(122, 0, 255, 0.03)',
                }}
              >
                {/* Day of week */}
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                  <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-magenta-500/60" />
                  <span className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-magenta-400/70 uppercase font-medium">
                    {isComingSoon ? COMING_SOON : (weekday || COMING_SOON)}
                  </span>
                  <div className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-magenta-500/60" />
                </div>

                {/* Day number */}
                <div
                  className="font-display font-bold leading-none mb-2"
                  style={{
                    fontSize: 'clamp(48px, 14vw, 110px)',
                    background: 'linear-gradient(135deg, #F8F4FF 0%, #B970FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 30px rgba(122, 0, 255, 0.4))',
                  }}
                >
                  {isComingSoon ? '--' : (day || '--')}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-magenta-500/40 to-transparent mb-2 sm:mb-4" />

                {/* Month */}
                <div
                  className="text-xl sm:text-3xl sm:text-4xl font-display font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #7A00FF, #FF2BA6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 10px rgba(233, 0, 131, 0.6))',
                  }}
                >
                  {isComingSoon ? 'EM BREVE' : (month || 'EM BREVE')}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mb-2 sm:mb-4" />

                {/* Time */}
                <div className="text-2xl sm:text-4xl sm:text-5xl font-display font-bold text-ivory tracking-widest"
                  style={{ textShadow: isMobile ? 'none' : '0 0 20px rgba(122,0,255,0.3)' }}>
                  {isComingSoon ? '--H' : (time || '--H')}
                </div>

                {/* Countdown Timer - Desktop only */}
                {!isComingSoon && !isEnded && (
                  <div className="hidden lg:block mt-6">
                    <CountdownTimer eventDate={event?.event_date} eventTime={event?.event_time} />
                  </div>
                )}

                {/* Pulse indicator */}
                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-5">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-magenta-500'}`}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: isMobile ? 'none' : `0 0 8px ${isLive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(233, 0, 131, 0.8)'}` }}
                  />
                  <span className="text-[10px] sm:text-xs text-ivory/40 tracking-[0.2em] uppercase">{statusLabel}</span>
                </div>
              </div>
            </motion.div>

            {/* Scroll cue - desktop only */}
            <motion.button
              onClick={() => document.querySelector('#atracoes')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden lg:flex flex-col items-center gap-2 text-ivory/30 hover:text-ivory/60 transition-colors"
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
          onClick={() => document.querySelector('#atracoes')?.scrollIntoView({ behavior: 'smooth' })}
          className="lg:hidden flex flex-col items-center gap-2 text-ivory/30 hover:text-ivory/50 transition-colors mx-auto mt-6 sm:mt-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} />
        </motion.button>
      </motion.div>
    </section>
  );
}
