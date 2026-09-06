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
    <section id="home" className="relative flex items-center justify-center overflow-hidden bg-dark-950" style={{ minHeight: '52vh' }}>
      {/* Background — solid dark with warm gradients, no banner image */}
      <div className="absolute inset-0">
        {/* Base dark gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,6,5,0.6) 0%, rgba(15,10,8,0.3) 40%, rgba(20,12,8,0.4) 70%, rgba(10,7,5,0.85) 100%)' }} />
        {/* Side vignette for text readability */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(8,6,5,0.4) 0%, transparent 25%, transparent 75%, rgba(8,6,5,0.35) 100%)' }} />
        {/* Warm sunset glow — positioned lower */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,140,60,0.18) 0%, rgba(212,132,46,0.08) 35%, transparent 75%)' }} />
      </div>

      {/* Beach bottom — sand glow, palm silhouettes, sparkles */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 2 }}>
        {/* Warm sand glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '120px', background: 'linear-gradient(180deg, transparent 0%, rgba(255,220,180,0.03) 50%, rgba(255,240,200,0.07) 100%)' }} />

        {/* Palm leaf silhouette — left corner */}
        {!isMobile && (
          <div className="absolute bottom-0 left-0" style={{ opacity: 0.07 }}>
            <svg width="220" height="130" viewBox="0 0 220 130" fill="none">
              <path d="M0,130 Q15,70 55,45 Q35,85 45,130 M8,130 Q25,75 65,52 Q50,95 60,130 M18,130 Q35,85 75,62 Q65,105 75,130 M3,130 Q12,55 48,32 Q33,72 42,130 M28,130 Q45,90 85,68 Q78,110 88,130" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Palm leaf silhouette — right corner */}
        {!isMobile && (
          <div className="absolute bottom-0 right-0" style={{ opacity: 0.07, transform: 'scaleX(-1)' }}>
            <svg width="220" height="130" viewBox="0 0 220 130" fill="none">
              <path d="M0,130 Q15,70 55,45 Q35,85 45,130 M8,130 Q25,75 65,52 Q50,95 60,130 M18,130 Q35,85 75,62 Q65,105 75,130 M3,130 Q12,55 48,32 Q33,72 42,130 M28,130 Q45,90 85,68 Q78,110 88,130" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Beach grass swaying — left corner */}
        {!isMobile && (
          <motion.div
            className="absolute bottom-0 left-2"
            style={{ opacity: 0.06 }}
            animate={{ rotate: [0, 3, 0, -2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
              <path d="M10,60 Q12,30 8,5 M20,60 Q22,35 18,10 M30,60 Q32,40 28,15 M40,60 Q42,35 38,8" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}

        {/* Beach grass swaying — right corner */}
        {!isMobile && (
          <motion.div
            className="absolute bottom-0 right-2"
            style={{ opacity: 0.06, transform: 'scaleX(-1)' }}
            animate={{ rotate: [0, -3, 0, 2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
              <path d="M10,60 Q12,30 8,5 M20,60 Q22,35 18,10 M30,60 Q32,40 28,15 M40,60 Q42,35 38,8" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}

        {/* Sparkle reflections on sand */}
        {!isMobile && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '100px' }}>
            {[...Array(14)].map((_, i) => {
              const size = i % 3 === 0 ? 3 : 2;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: size,
                    height: size,
                    left: `${(i * 7 + 3) % 95}%`,
                    bottom: `${8 + (i * 7) % 70}px`,
                    boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(255,240,200,0.4)',
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.3, 1.5, 0.3],
                    y: [0, -6, 0],
                  }}
                  transition={{
                    duration: 2.5 + (i % 4) * 0.5,
                    repeat: Infinity,
                    delay: i * 0.35,
                    ease: 'easeInOut',
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Foam bubbles floating up */}
        {!isMobile && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '80px' }}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`bubble-${i}`}
                className="absolute rounded-full bg-white/70"
                style={{
                  width: 3,
                  height: 3,
                  left: `${12 + i * 14}%`,
                  bottom: '3px',
                  boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                }}
                animate={{
                  y: [0, -30, -60],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 0.9, 0.3],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.7,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Sand shimmer line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '5px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,220,180,0.12) 20%, rgba(255,240,200,0.2) 50%, rgba(255,220,180,0.12) 80%, transparent 100%)',
            filter: 'blur(2px)',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.96, 1, 0.96] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mobile sparkles */}
        {isMobile && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '70px' }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`m-spark-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: 2,
                  height: 2,
                  left: `${15 + i * 17}%`,
                  bottom: `${10 + (i * 12) % 45}px`,
                  boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                }}
                animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 0.3] }}
                transition={{ duration: 2.5 + (i % 3), repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}

        {/* Mobile bubbles */}
        {isMobile && (
          <div className="absolute bottom-0 left-0 right-0" style={{ height: '45px' }}>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`m-bubble-${i}`}
                className="absolute rounded-full bg-white/60"
                style={{
                  width: 3,
                  height: 3,
                  left: `${20 + i * 28}%`,
                  bottom: '2px',
                }}
                animate={{ y: [0, -20, -40], opacity: [0, 0.6, 0], scale: [0.5, 0.8, 0.2] }}
                transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}

        {/* Mobile palm leaf — small, left corner */}
        {isMobile && (
          <div className="absolute bottom-0 left-0" style={{ opacity: 0.05 }}>
            <svg width="130" height="75" viewBox="0 0 220 130" fill="none">
              <path d="M0,130 Q15,70 55,45 Q35,85 45,130 M8,130 Q25,75 65,52 Q50,95 60,130 M18,130 Q35,85 75,62 Q65,105 75,130" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Wet sand glow at very bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '30px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(255,240,200,0.06) 100%)',
          }}
        />
      </div>

      {/* Beach atmosphere — seagulls, light rays, starfish, petals */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          {/* Seagulls silhouettes drifting across */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`gull-${i}`}
              className="absolute"
              style={{
                top: `${8 + i * 12}%`,
                left: '-60px',
              }}
              animate={{
                x: ['0vw', '110vw'],
                y: [0, -15, 5, -10, 0],
              }}
              transition={{
                duration: 25 + i * 8,
                repeat: Infinity,
                delay: i * 6,
                ease: 'linear',
              }}
            >
              <svg width="28" height="14" viewBox="0 0 28 14" fill="none" style={{ opacity: 0.25 }}>
                <path
                  d="M2,8 C5,4 8,4 10,8 C12,4 15,4 18,8 C20,5 23,5 26,8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </motion.div>
          ))}

          {/* God rays — soft light beams from top */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute top-0"
              style={{
                left: `${15 + i * 22}%`,
                width: '120px',
                height: '60%',
                background: 'linear-gradient(180deg, rgba(255,240,220,0.06) 0%, transparent 100%)',
                transform: `rotate(${i % 2 === 0 ? -8 : 8}deg)`,
                transformOrigin: 'top center',
                filter: 'blur(20px)',
              }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.5, ease: 'easeInOut' }}
            />
          ))}

          {/* Sand shimmer line — subtle warm glow at the waterline */}
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '6px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,220,180,0.15) 30%, rgba(255,240,200,0.25) 50%, rgba(255,220,180,0.15) 70%, transparent 100%)',
              filter: 'blur(3px)',
            }}
            animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.95, 1, 0.95] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Starfish / shell silhouettes scattered near the bottom */}
          {[
            { left: '8%', bottom: '12px', size: 14, delay: 0 },
            { left: '82%', bottom: '18px', size: 12, delay: 2 },
            { left: '45%', bottom: '8px', size: 10, delay: 4 },
          ].map((s, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{ left: s.left, bottom: s.bottom }}
              animate={{ opacity: [0.08, 0.15, 0.08], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
            >
              <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
                <path
                  d="M12,2 L14.5,9 L22,9.5 L16,14.5 L18,22 L12,18 L6,22 L8,14.5 L2,9.5 L9.5,9 Z"
                  fill="#ffffff"
                  opacity="0.5"
                />
              </svg>
            </motion.div>
          ))}

          {/* Tropical flower petals floating */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`petal-${i}`}
              className="absolute"
              style={{
                left: `${10 + i * 15}%`,
                top: `${15 + (i * 13) % 50}%`,
              }}
              animate={{
                y: [0, 20, 0],
                x: [0, 10, 0],
                rotate: [0, 180, 360],
                opacity: [0, 0.12, 0],
              }}
              transition={{
                duration: 10 + i * 3,
                repeat: Infinity,
                delay: i * 2,
                ease: 'easeInOut',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <ellipse cx="5" cy="5" rx="3" ry="5" fill="#ffffff" opacity="0.6" />
              </svg>
            </motion.div>
          ))}

          {/* Distant lighthouse glow — warm circle on the right */}
          <motion.div
            className="absolute rounded-full"
            style={{
              top: '25%',
              right: '8%',
              width: '60px',
              height: '60px',
              background: 'radial-gradient(circle, rgba(255,220,180,0.15) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Mobile beach atmosphere — one seagull + lighthouse glow */}
      {isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
          <motion.div
            className="absolute"
            style={{ top: '12%', left: '-40px' }}
            animate={{ x: ['0vw', '115vw'], y: [0, -10, 5, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="22" height="11" viewBox="0 0 28 14" fill="none" style={{ opacity: 0.2 }}>
              <path d="M2,8 C5,4 8,4 10,8 C12,4 15,4 18,8 C20,5 23,5 26,8" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute rounded-full"
            style={{
              top: '22%', right: '10%',
              width: '40px', height: '40px',
              background: 'radial-gradient(circle, rgba(255,220,180,0.12) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Beach mist — warm, subtle */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -bottom-1/4 left-0 w-[150%] h-[50%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,220,180,0.04) 0%, rgba(255,240,200,0.03) 40%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{ x: ['-10%', '10%', '-10%'], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-1/4 right-0 w-[120%] h-[40%] rounded-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,240,200,0.03) 0%, transparent 60%)',
              filter: 'blur(70px)',
            }}
            animate={{ x: ['10%', '-10%', '10%'], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>
      )}

      {/* Warm beach glow orbs - hidden on mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'rgba(255,200,130,0.06)', filter: 'blur(150px)' }} />
          <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full" style={{ background: 'rgba(255,220,160,0.04)', filter: 'blur(130px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full" style={{ background: 'rgba(255,180,100,0.03)', filter: 'blur(100px)' }} />
        </div>
      )}

      {/* Floating beach particles - desktop only, disabled on mobile */}
      {!isMobile && (
        <div className="hidden lg:block absolute inset-0 pointer-events-none">
          {[...Array(16)].map((_, i) => {
            const colors = ['#FFD4A8', '#FFB066', '#FF8C2E', '#FFE4C4'];
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
        className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 pt-28 sm:pt-36 pb-10 sm:pb-14"
      >
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-center">
          {/* LEFT - Main content */}
          <div className="text-center lg:text-left">
            {/* Main headline */}
            <motion.div variants={itemVariant} className="mb-4">
              <h1 className="font-black text-white leading-[0.88] tracking-tight break-words">
                <span
                  className="block uppercase"
                  style={{
                    fontSize: 'clamp(3rem, 15vw, 10rem)',
                    letterSpacing: '-0.04em',
                    textShadow: isMobile ? 'none' : '0 0 60px rgba(255,255,255,0.2), 0 0 120px rgba(255,140,46,0.1)',
                    lineHeight: '0.88',
                  }}
                >
                  {headline.split(' ')[0]}
                </span>
                <span
                  className="block uppercase"
                  style={{
                    fontSize: 'clamp(3rem, 15vw, 10rem)',
                    letterSpacing: '-0.04em',
                    background: 'linear-gradient(135deg, #FFD4A8 0%, #FF8C2E 30%, #FFB066 60%, #C25A0E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 35px rgba(255, 140, 46, 0.8)) drop-shadow(0 0 70px rgba(255, 140, 46, 0.3))',
                    lineHeight: '0.88',
                  }}
                >
                  {headline.split(' ').slice(1).join(' ') || 'É NOSSA!'}
                </span>
              </h1>
              {/* Decorative underline — white glow */}
              <motion.div
                className="h-1 rounded-full mt-3"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 20%, #fff 50%, rgba(255,255,255,0.6) 80%, transparent 100%)',
                  maxWidth: '300px',
                  boxShadow: '0 0 12px rgba(255,255,255,0.4)',
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Description */}
            <motion.p variants={itemVariant} className="text-white/55 text-sm sm:text-base sm:text-lg leading-relaxed sm:leading-relaxed mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto lg:mx-0">
              {subheadline}
            </motion.p>

            {/* Feature icons */}
            <motion.div variants={itemVariant} className="grid grid-cols-4 gap-2 sm:gap-3 mb-8 sm:mb-10">
              {features.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 group">
                  <div
                    className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border border-pink-500/30 transition-all duration-300 group-hover:border-pink-400/60 group-hover:scale-105"
                    style={{
                      background: 'rgba(255, 140, 46, 0.08)',
                      boxShadow: isMobile ? 'none' : '0 0 20px rgba(255, 140, 46, 0.1)',
                    }}
                  >
                    <Icon size={18} className="text-pink-400 group-hover:text-pink-300 transition-colors sm:!size-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] sm:text-xs font-bold text-white/80 uppercase tracking-wide leading-tight">{label}</div>
                    <div className="text-[8px] sm:text-[9px] text-white/35 leading-tight">{sub}</div>
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
                    background: 'linear-gradient(135deg, #FF8C2E, #D4842E)',
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
                  className="relative w-full lg:w-auto px-8 sm:px-10 py-4 sm:py-5 text-white font-bold text-sm sm:text-base sm:text-lg uppercase tracking-widest overflow-hidden"
                  style={{
                    background: 'transparent',
                    border: '2px solid #FF8C2E',
                    borderRadius: '14px',
                    boxShadow: isMobile ? 'none' : '0 0 20px rgba(255, 140, 46, 0.4), inset 0 0 20px rgba(255, 140, 46, 0.05)',
                  }}
                  whileHover={isMobile ? undefined : {
                    scale: 1.03,
                    boxShadow: '0 0 40px rgba(255, 140, 46, 0.6), 0 0 80px rgba(255, 140, 46, 0.2), inset 0 0 30px rgba(255, 140, 46, 0.1)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 140, 46, 0.2), rgba(212, 132, 46, 0.2))',
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
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/8"
            >
              <div className="flex items-center gap-2 text-white/50 text-xs sm:text-sm">
                <MapPin size={14} className="text-pink-400/80 sm:!size-4" />
                <span>{location || (isComingSoon ? COMING_SOON : 'Vinhedo, Sao Paulo')}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/20" />
              <div className="text-white/50 text-xs sm:text-sm font-medium tracking-wide">
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
              className="relative w-full max-w-[260px] sm:max-w-xs"
              animate={isMobile ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Outer glow - hidden on mobile */}
              {!isMobile && (
                <div
                  className="absolute -inset-3 rounded-3xl blur-2xl opacity-30"
                  style={{ background: 'linear-gradient(135deg, #FF8C2E, #D4842E)' }}
                />
              )}

              <div
                className="relative rounded-2xl text-center p-4 sm:p-8 sm:p-10"
                style={{
                  background: 'rgba(9, 9, 9, 0.85)',
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, #FF8C2E, #D4842E) 1',
                  borderRadius: '18px',
                  boxShadow: isMobile ? 'none' : '0 0 30px rgba(255, 140, 46, 0.25), 0 0 60px rgba(212, 132, 46, 0.15), inset 0 0 30px rgba(255, 140, 46, 0.03)',
                }}
              >
                {/* Day of week */}
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
                  <div className="h-px w-6 sm:w-8 bg-gradient-to-r from-transparent to-pink-500/60" />
                  <span className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] text-pink-400/70 uppercase font-medium">
                    {isComingSoon ? COMING_SOON : (weekday || COMING_SOON)}
                  </span>
                  <div className="h-px w-6 sm:w-8 bg-gradient-to-l from-transparent to-pink-500/60" />
                </div>

                {/* Day number */}
                <div
                  className="font-bold leading-none mb-2"
                  style={{
                    fontSize: 'clamp(48px, 14vw, 110px)',
                    background: 'linear-gradient(135deg, #fff 0%, #FFD4A8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 30px rgba(255, 140, 46, 0.4))',
                  }}
                >
                  {isComingSoon ? '--' : (day || '--')}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent mb-2 sm:mb-4" />

                {/* Month */}
                <div
                  className="text-xl sm:text-3xl sm:text-4xl font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FF8C2E, #FFB066)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: isMobile ? 'none' : 'drop-shadow(0 0 10px rgba(255, 140, 46, 0.6))',
                  }}
                >
                  {isComingSoon ? 'EM BREVE' : (month || 'EM BREVE')}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mb-2 sm:mb-4" />

                {/* Time */}
                <div className="text-2xl sm:text-4xl sm:text-5xl font-bold text-white tracking-widest"
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
                <div className="flex items-center justify-center gap-2 mt-3 sm:mt-5">
                  <motion.div
                    className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-pink-500'}`}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ boxShadow: isMobile ? 'none' : `0 0 8px ${isLive ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 140, 46, 0.8)'}` }}
                  />
                  <span className="text-[10px] sm:text-xs text-white/40 tracking-[0.2em] uppercase">{statusLabel}</span>
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
          className="lg:hidden flex flex-col items-center gap-2 text-white/30 hover:text-white/50 transition-colors mx-auto mt-6 sm:mt-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} />
        </motion.button>
      </motion.div>
    </section>
  );
}
