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
const BANNER_SRC = '/images/image%20copy%207.png';

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
  const title = event?.name ?? 'Próximo evento em breve';
  const description = event?.description ?? 'Estamos preparando a próxima noite. Fique de olho nas novidades.';

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
    <section id="home" className="relative bg-[#0b0b0b]">
      {/* Arte do evento (o topo da arte, que já tem um menu desenhado, fica escondido sob o menu real) */}
      <div className="relative bg-[#f4f4f2] pt-[64px] sm:pt-[76px]">
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full overflow-hidden aspect-[1600/775]"
        >
          <img
            src={BANNER_SRC}
            alt={title}
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#0b0b0b]/60" />
      </div>

      <div className="lux-container relative pt-12 pb-28 sm:pt-16 sm:pb-20 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,400px)] lg:gap-16 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-white'}`} />
              {pill}
            </span>

            <h1
              className="mt-5 uppercase text-white"
              style={{ fontFamily: "'Anton', 'Inter', sans-serif", fontSize: 'clamp(2.5rem, 9vw, 5.5rem)', lineHeight: 1, letterSpacing: '0.01em' }}
            >
              {title}
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">{description}</p>

            <ul className="mt-7 space-y-3">
              {[
                { Icon: Calendar, text: dateLabel },
                { Icon: Clock, text: timeLabel },
                { Icon: MapPin, text: location },
              ].filter(({ text }) => text).map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/90">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white">
                    <Icon size={18} />
                  </span>
                  <span className="text-[15px] font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-[#151515] p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Ingresso</p>
                <p className="mt-1 text-lg font-semibold text-white">{isComingSoon || noEvent || !salesEnabled ? '1º lote' : 'Pista'}</p>
              </div>
              <Ticket className="text-white" size={22} />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/60">{ticketMsg}</p>

            {event?.event_date && !isEnded && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <CountdownTimer eventDate={event.event_date} eventTime={event.event_time} />
              </div>
            )}

            <button
              onClick={canBuy ? onBuyClick : undefined}
              disabled={!canBuy}
              className="mt-5 hidden w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-bold uppercase tracking-[0.06em] text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,255,255,0.18)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:hover:translate-y-0 disabled:hover:shadow-none lg:flex"
            >
              <Ticket size={18} />
              {buyLabel}
            </button>

            {isLastTickets && event?.last_tickets_alert && (
              <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-center text-sm text-amber-400">{event.last_tickets_alert}</p>
            )}

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
              <ShieldCheck size={14} /> Pagamento seguro via Pix
            </p>
          </motion.div>
        </div>

        <button
          onClick={() => document.querySelector('#atracoes')?.scrollIntoView({ behavior: 'smooth' })}
          className="mx-auto mt-10 hidden text-white/30 transition-colors hover:text-white/70 lg:block"
          aria-label="Ver mais"
        >
          <ChevronDown size={24} className="animate-bounce" />
        </button>
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
