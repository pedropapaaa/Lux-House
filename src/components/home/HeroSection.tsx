import { Calendar, Clock, MapPin, ShieldCheck, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicEvent } from '../../hooks/usePublicEvent';
import { useSettings } from '../../hooks/useSettings';
import CountdownTimer from './CountdownTimer';

interface HeroSectionProps { onBuyClick: () => void; }

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function HeroSection({ onBuyClick }: HeroSectionProps) {
  const { data: event } = usePublicEvent();
  const { data: settings } = useSettings();
  const salesEnabled = settings?.sales_enabled ?? true;
  const eventDate = event?.event_date ? new Date(`${event.event_date}T00:00:00`) : null;
  const canBuy = Boolean(event && salesEnabled && event.status !== 'coming_soon' && event.status !== 'ended');
  const dateLabel = eventDate ? `${WEEKDAYS[eventDate.getDay()]}, ${eventDate.getDate()} de ${MONTHS[eventDate.getMonth()]}` : 'Sexta-feira, 04 de dezembro';
  const timeLabel = event?.event_time || 'A partir das 21h';
  const location = event?.location || 'Valinhos–SP';
  const buyLabel = canBuy ? 'Comprar ingresso' : event?.status === 'ended' ? 'Evento encerrado' : 'Vendas em breve';

  return (
    <section id="home" className="relative min-h-[760px] overflow-hidden bg-[#f5f5f3] text-neutral-950 sm:min-h-[820px] lg:min-h-[900px]">
      <img src="/images/Evento_Lux_House_Arte_Visual copy 2.png" alt="Festa do Branco" className="absolute inset-0 h-full w-full object-cover object-center" loading="eager" fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      <motion.img
        src="/images/Retrato_de_homem_em_traje_branco_fazendo_silencio.png"
        alt="DJ Guhmix em traje branco"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="pointer-events-none absolute bottom-0 right-[-8%] z-20 h-[72%] w-auto max-w-none object-contain object-bottom sm:right-[1%] sm:h-[78%] lg:right-[10%] lg:h-[92%]"
      />

      <div className="relative z-30 mx-auto flex min-h-[760px] max-w-[1440px] flex-col justify-end px-5 pb-12 pt-32 sm:min-h-[820px] sm:px-10 sm:pb-16 lg:min-h-[900px] lg:px-16 lg:pb-20">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-24">
          <motion.div initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="max-w-[610px]">
            <span className="inline-flex items-center gap-2 border border-neutral-950/25 bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm"><span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />Ingressos à venda</span>
            <h1 className="mt-5 max-w-[8ch] font-display text-7xl font-black uppercase leading-[0.82] tracking-[-0.06em] sm:text-8xl lg:text-[8.5rem]">Lux White</h1>
            <div className="mt-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-700"><span className="h-px w-12 bg-neutral-950" />Lux House apresenta</div>
            <p className="mt-6 max-w-lg text-sm leading-6 text-neutral-800 sm:text-base">Prepare-se para viver uma edição especial da Lux House. Uma noite marcada por muita música, energia, elegância e experiências inesquecíveis.</p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[{ Icon: Calendar, label: dateLabel }, { Icon: Clock, label: timeLabel }, { Icon: MapPin, label: location }].map(({ Icon, label }) => <div key={label} className="flex items-center gap-3 border-t border-neutral-950/20 pt-3 text-sm font-medium"><Icon size={17} />{label}</div>)}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="relative z-40 border border-neutral-950/20 bg-white/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-6">
            <div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Ingresso</p><p className="mt-2 font-display text-2xl font-bold uppercase">Pista</p></div><Ticket size={22} /></div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">Garanta o seu antes que o lote acabe.</p>
            {event?.event_date && event.status !== 'ended' && <div className="mt-5 border-t border-neutral-200 pt-5"><CountdownTimer eventDate={event.event_date} eventTime={event.event_time} /></div>}
            <button onClick={canBuy ? onBuyClick : undefined} disabled={!canBuy} className="mt-5 flex h-14 w-full items-center justify-center gap-2 bg-neutral-950 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"><Ticket size={17} />{buyLabel}</button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500"><ShieldCheck size={14} />Pagamento seguro via Pix</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
