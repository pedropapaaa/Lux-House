import { Calendar, Clock, MapPin, Ticket, ShieldCheck, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';
import CountdownTimer from './CountdownTimer';

interface HeroSectionProps {
  onBuyClick: () => void;
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const BANNER_SRC = '/images/Evento_Lux_House_Arte_Visual.png';
const DJ_SRC = '/images/';

export default function HeroSection({ onBuyClick }: HeroSectionProps) {
  const { data: event } = usePublicEvent();
  const { data: settings } = useSettings();
  const salesEnabled = settings?.sales_enabled ?? true;

  const isComingSoon = event?.status === 'coming_soon';
  const isEnded = event?.status === 'ended';
  const isLive = event?.status === 'live';
  const isLastTickets = event?.status === 'last_tickets';
  const noEvent = !event;
  const canBuy = !noEvent && salesEnabled && !isComingSoon && !isEnded;

  const eventDate = event?.event_date ? new Date(event.event_date + 'T00:00:00') : null;
  const dateLabel = eventDate ? `${WEEKDAYS[eventDate.getDay()]}, ${eventDate.getDate()} de ${MONTHS[eventDate.getMonth()]}` : null;
  const timeLabel = event?.event_time || null;
  const location = event?.location || null;
  const title = event?.name ?? 'Festa do Branco';
  const description = event?.description ?? 'Uma noite especial da Lux House com música, elegância e experiências inesquecíveis.';

  const pill = isEnded ? 'Evento encerrado'
    : isLive ? 'Acontecendo agora'
    : isLastTickets ? 'Últimos ingressos'
    : isComingSoon || noEvent || !salesEnabled ? '1º lote em breve'
    : 'Ingressos à venda';

  const ticketMsg = isEnded ? (event?.ended_info?.final_message || 'Obrigado a todos!')
    : isComingSoon || noEvent || !salesEnabled ? (event?.coming_soon_message || 'As vendas do 1º lote abrem em breve.')
    : isLive ? 'A festa já começou.'
    : 'Garanta o seu antes que o lote acabe.';

  const buyLabel = canBuy ? 'Comprar ingresso' : isEnded ? 'Evento encerrado' : 'Vendas em breve';

  return (
    <section id="home" className="relative min-h-screen bg-black overflow-hidden">
      {/* Full-bleed art background — DJ colors show through, dark overlay for text legibility */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        className="absolute inset-0"
      >
        <img
          src={BANNER_SRC}
          alt={title}
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[50%_top] lg:object-center"
        />
        {/* Dark gradient overlay — keeps B&W aesthetic but lets art colors peek */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/20" />
      </motion.div>

      {/* DJ portrait layered above the artwork, especially framed for mobile */}
      <motion.img
        src={DJ_SRC}
        alt="DJ Guhmix"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="pointer-events-none absolute z-[5] left-1/2 top-[88px] h-auto w-[235px] -translate-x-1/2 object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.7)] sm:top-[105px] sm:w-[300px] lg:left-auto lg:right-[17%] lg:top-[14%] lg:w-[420px] lg:translate-x-0"
      />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 bw-grid-lines opacity-40 pointer-events-none" />

      {/* Decorative corner frames */}
      <div className="absolute top-24 left-6 w-16 h-16 border-l-2 border-t-2 border-white/20 pointer-events-none hidden sm:block" />
      <div className="absolute top-24 right-6 w-16 h-16 border-r-2 border-t-2 border-white/20 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-32 left-6 w-16 h-16 border-l-2 border-b-2 border-white/20 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-32 right-6 w-16 h-16 border-r-2 border-b-2 border-white/20 pointer-events-none hidden sm:block" />

      {/* Floating decorative dots */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-[8%] w-2 h-2 rounded-full bg-white/30 pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/2 right-[10%] w-1.5 h-1.5 rounded-full bg-white/25 pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-1/4 left-[15%] w-1 h-1 rounded-full bg-white/40 pointer-events-none hidden lg:block"
      />

      {/* Content */}
      <div className="relative z-10 pt-[490px] sm:pt-[560px] lg:pt-36 pb-36 lg:pb-32 px-4 sm:px-6 min-h-screen flex flex-col">
        <div className="lux-container flex-1 flex flex-col justify-center">
          <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,380px)] lg:gap-16 lg:items-center">
            {/* Left — title and info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-white animate-pulse'}`} />
                {pill}
              </span>

              <h1
                className="mt-5 sm:mt-6 uppercase text-white max-w-[7ch] lg:max-w-none"
                style={{ fontFamily: "'Anton', 'Inter', sans-serif", fontSize: 'clamp(2.8rem, 10vw, 7rem)', lineHeight: 0.9, letterSpacing: '0.01em' }}
              >
                {title}
              </h1>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-px w-12 bg-white/40" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">Lux House apresenta</span>
              </div>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70">{description}</p>

              <ul className="mt-8 space-y-3">
                {[
                  { Icon: Calendar, text: dateLabel },
                  { Icon: Clock, text: timeLabel },
                  { Icon: MapPin, text: location },
                ].filter(({ text }) => text).map(({ Icon, text }, i) => (
                  <motion.li
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 text-white/90"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white backdrop-blur-sm">
                      <Icon size={18} />
                    </span>
                    <span className="text-[15px] font-medium">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Right — ticket card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="rounded-2xl border border-white/15 bg-black/65 p-5 sm:p-6 backdrop-blur-xl"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Ingresso</p>
                  <p className="mt-1 text-lg font-semibold text-white">{isComingSoon || noEvent || !salesEnabled ? '1º lote' : 'Pista'}</p>
                </div>
                <Ticket className="text-white" size={22} />
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/55">{ticketMsg}</p>

              {event?.event_date && !isEnded && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <CountdownTimer eventDate={event.event_date} eventTime={event.event_time} />
                </div>
              )}

              <button
                onClick={canBuy ? onBuyClick : undefined}
                disabled={!canBuy}
                className="bw-shimmer-btn mt-5 hidden w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-bold uppercase tracking-[0.06em] text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.25)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:hover:translate-y-0 disabled:hover:shadow-none lg:flex"
              >
                <Ticket size={18} />
                {buyLabel}
              </button>

              {isLastTickets && event?.last_tickets_alert && (
                <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-center text-sm text-amber-400">{event.last_tickets_alert}</p>
              )}

              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/35">
                <ShieldCheck size={14} /> Pagamento seguro via Pix
              </p>
            </motion.div>
          </div>
        </div>

        <motion.button
          onClick={() => document.querySelector('#sobre')?.scrollIntoView({ behavior: 'smooth' })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mx-auto mt-6 text-white/40 transition-colors hover:text-white/80 hidden lg:block"
          aria-label="Ver mais"
        >
          <ChevronDown size={28} className="animate-bounce" />
        </motion.button>
      </div>

      {/* Barra fixa de compra no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <button
          onClick={canBuy ? onBuyClick : undefined}
          disabled={!canBuy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-bold uppercase tracking-[0.06em] text-black disabled:bg-white/10 disabled:text-white/40"
        >
          <Ticket size={18} />
          {buyLabel}
        </button>
      </div>
    </section>
  );
}
