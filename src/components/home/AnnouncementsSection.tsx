import { Calendar, Clock, MapPin, Sparkles, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicEvent } from '../../hooks/usePublicEvent';

export default function AnnouncementsSection() {
  const { data: event } = usePublicEvent();
  if (!event) return null;

  const eventDate = event.event_date ? new Date(`${event.event_date}T00:00:00`) : null;
  const weekday = eventDate ? ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][eventDate.getDay()] : 'Em breve';
  const date = eventDate ? `${weekday}, ${String(eventDate.getDate()).padStart(2, '0')} de ${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][eventDate.getMonth()]}` : 'Data a definir';
  const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.92044944303!2d-46.963326200000004!3d-23.0266929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf2d40e0f25a5b%3A0x2f788dcc83ff167b!2sRod.%20Edenor%20Jo%C3%A3o%20Tasca%2C%20980%2C%20Vinhedo%20-%20SP%2C%2013280-000!5e0!3m2!1spt-BR!2sbr!4v1783061992069!5m2!1spt-BR!2sbr';

  return (
    <section id="avisos" className="bg-[#f5f5f3] text-neutral-950">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="flex flex-col gap-4 border-b border-neutral-300 pb-8 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500">02 / Informações do evento</p><h2 className="mt-4 font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-7xl">Tudo o que você<br />precisa saber.</h2></div><p className="max-w-xs text-sm leading-6 text-neutral-600">Uma noite marcada por música, elegância e presença.</p></div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden border border-neutral-300 bg-white p-2 shadow-[0_20px_55px_rgba(0,0,0,0.08)]"><div className="relative h-[320px] overflow-hidden sm:h-[470px]"><iframe title="Localização da Lux House" src={mapSrc} className="absolute inset-0 h-full w-full border-0 grayscale" loading="lazy" allowFullScreen /><div className="pointer-events-none absolute left-4 top-4 h-7 w-7 border-l border-t border-neutral-950/50" /><div className="pointer-events-none absolute bottom-4 right-4 h-7 w-7 border-b border-r border-neutral-950/50" /></div><div className="flex items-center justify-between px-3 py-4 text-[10px] font-semibold uppercase tracking-[0.18em]"><span>Localização</span><span>{event.location || 'Valinhos–SP'} ↗</span></div></motion.div>

          <div className="flex flex-col gap-4">
            <div className="relative flex h-56 items-center overflow-hidden border border-neutral-300 bg-white px-6 sm:h-64"><img src="/images/Retrato_de_homem_em_traje_branco_fazendo_silencio.png" alt="DJ Guhmix em traje branco" className="absolute inset-0 h-full w-full object-contain object-right" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" /><div className="relative z-10"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Atração principal</p><h3 className="mt-2 font-display text-4xl font-black uppercase tracking-[-0.05em]">DJ Guhmix</h3><p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-500">Ao vivo na Lux House</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><InfoCard Icon={Calendar} label="Quando" value={date} /><InfoCard Icon={Clock} label="Horário" value={event.event_time || 'A definir'} /><InfoCard Icon={MapPin} label="Onde" value={event.location || 'A definir'} /><InfoCard Icon={Sparkles} label="Dress code" value="Todos de branco" /></div>
            <div className="border border-neutral-300 bg-neutral-950 p-5 text-white"><div className="flex items-center gap-3"><Ticket size={17} /><p className="text-sm font-semibold">Ingressos limitados</p></div><p className="mt-2 text-xs leading-5 text-white/60">Garanta seu ingresso antes que o lote atual acabe.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ Icon, label, value }: { Icon: typeof Calendar; label: string; value: string }) {
  return <div className="border border-neutral-300 bg-white p-5"><Icon size={18} /><p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">{label}</p><p className="mt-2 text-sm font-semibold leading-5 text-neutral-950">{value}</p></div>;
}
