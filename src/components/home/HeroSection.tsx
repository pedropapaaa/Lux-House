import { Calendar, Clock, MapPin, Ticket, ShieldCheck, ChevronDown } from 'lucide-react';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';
import CountdownTimer from './CountdownTimer';

interface HeroSectionProps {
  onBuyClick: () => void;
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function HeroSection({ onBuyClick }: HeroSectionProps) {
  const { data: event } = usePublicEvent();
  const { data: settings } = useSettings();
  const salesEnabled = settings?.sales_enabled ?? true;

  const isComingSoon = event?.status === 'coming_soon';
  const isEnded = event?.status === 'ended';
  const isLive = event?.status === 'live';
  const isLastTickets = event?.status === 'last_tickets';
  const canBuy = salesEnabled && !isComingSoon && !isEnded;

  const dateStr = event?.event_date || '2026-10-16';
  const d = new Date(dateStr + 'T00:00:00');
  const dateLabel = `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
  const timeLabel = event?.event_time || '21h às 03h';
  const location = event?.location || 'Vinhedo, São Paulo';
  const title = event?.name || 'Lux Halloween Night';
  const description = event?.description || 'Uma noite de Halloween com DJ, drinks e fantasia liberada. Vem de terror!';

  const pill = isEnded ? 'Evento encerrado'
    : isLive ? 'Acontecendo agora'
    : isLastTickets ? 'Últimos ingressos'
    : isComingSoon || !salesEnabled ? '1º lote em breve'
    : 'Ingressos à venda';

  const ticketMsg = isEnded ? (event?.ended_info?.final_message || 'Obrigado a todos!')
    : isComingSoon || !salesEnabled ? (event?.coming_soon_message || 'As vendas do 1º lote abrem em breve.')
    : isLive ? 'A festa já começou.'
    : 'Garanta o seu antes que o lote acabe.';

  const buyLabel = canBuy ? 'Comprar ingresso' : isEnded ? 'Evento encerrado' : 'Vendas em breve';

  return (
    <section id="home" className="relative overflow-hidden bg-dark-950">
      {/* Uma única luz de fundo: lua laranja no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{ background: 'radial-gradient(60% 55% at 50% 0%, rgba(255,106,19,0.28) 0%, rgba(255,106,19,0.08) 45%, transparent 75%)' }}
      />

      <div className="lux-container relative pt-24 pb-28 sm:pt-32 sm:pb-20 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,400px)] lg:gap-16 lg:items-center">
          {/* Informações do evento */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300">
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? 'bg-red-500' : 'bg-purple-400'}`} />
              {pill}
            </span>

            <h1
              className="mt-5 uppercase text-ivory"
              style={{ fontFamily: "'Anton', 'Inter', sans-serif", fontSize: 'clamp(2.75rem, 13vw, 6.5rem)', lineHeight: 0.95, letterSpacing: '0.01em' }}
            >
              {title}
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/65">{description}</p>

            <ul className="mt-7 space-y-3.5">
              {[
                { Icon: Calendar, text: dateLabel },
                { Icon: Clock, text: timeLabel },
                { Icon: MapPin, text: location },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-ivory/90">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-purple-400">
                    <Icon size={18} />
                  </span>
                  <span className="text-[15px] font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cartão de ingresso */}
          <div className="rounded-2xl border border-white/10 bg-dark-800/80 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ivory/50">Ingresso</p>
                <p className="mt-0.5 text-lg font-semibold text-ivory">{isComingSoon || !salesEnabled ? '1º lote' : 'Pista'}</p>
              </div>
              <Ticket className="text-purple-400" size={22} />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ivory/60">{ticketMsg}</p>

            {!isEnded && (
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="mb-3 text-sm text-ivory/50">Faltam para a festa</p>
                <CountdownTimer eventDate={event?.event_date || dateStr} eventTime={event?.event_time} />
              </div>
            )}

            <button
              onClick={canBuy ? onBuyClick : undefined}
              disabled={!canBuy}
              className="mt-5 hidden w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-dark-950 transition-colors disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-ivory/40 lg:flex"
              style={canBuy ? { background: '#FF6A13' } : undefined}
            >
              <Ticket size={18} />
              {buyLabel}
            </button>

            {isLastTickets && event?.last_tickets_alert && (
              <p className="mt-4 rounded-lg bg-amber-500/10 p-3 text-center text-sm text-amber-400">{event.last_tickets_alert}</p>
            )}

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ivory/40">
              <ShieldCheck size={14} /> Pagamento seguro via Pix
            </p>
          </div>
        </div>

        <button
          onClick={() => document.querySelector('#atracoes')?.scrollIntoView({ behavior: 'smooth' })}
          className="mx-auto mt-10 hidden text-ivory/30 hover:text-ivory/60 lg:block"
          aria-label="Ver mais"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Barra fixa de compra no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-dark-950/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <button
          onClick={canBuy ? onBuyClick : undefined}
          disabled={!canBuy}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-dark-950 disabled:bg-white/10 disabled:text-ivory/40"
          style={canBuy ? { background: '#FF6A13' } : undefined}
        >
          <Ticket size={18} />
          {buyLabel}
        </button>
      </div>
    </section>
  );
}
