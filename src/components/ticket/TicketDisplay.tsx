import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Download, Loader2, MapPin, Shield, Ticket as TicketIcon, User } from 'lucide-react';
import type { Ticket } from '../../types';
import { generateReceiptImage } from '../../lib/generateReceipt';

interface TicketDisplayProps { ticket: Ticket; }

export default function TicketDisplay({ ticket }: TicketDisplayProps) {
  const ticketUrl = `${window.location.origin}/ingresso/${ticket.code}`;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try { await generateReceiptImage(ticket); } catch (error) { console.error('Failed to generate receipt:', error); } finally { setDownloading(false); }
  };

  const details = [
    { Icon: User, label: ticket.holder_name ? 'Participante' : 'Comprador', value: ticket.holder_name ?? ticket.buyer_name },
    { Icon: TicketIcon, label: 'Lote', value: ticket.lot_name },
    { Icon: Calendar, label: 'Data', value: ticket.event_date },
    { Icon: Clock, label: 'Horário', value: ticket.event_time },
    { Icon: MapPin, label: 'Local', value: ticket.event_location },
  ];

  return (
    <div className="mx-auto max-w-md">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
        <div className="border-b border-neutral-200 bg-neutral-950 px-6 pb-7 pt-8 text-white sm:px-8"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Entrada oficial</p><h1 className="mt-3 font-display text-4xl font-black uppercase tracking-[-0.06em]">Lux House</h1></div><span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20"><TicketIcon size={21} /></span></div><p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-white/45">Festa do Branco · ingresso digital</p></div>
        <div className="space-y-4 px-6 py-7 sm:px-8">{details.map(({ Icon, label, value }, index) => <motion.div key={label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="flex items-center gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-950"><Icon size={17} /></span><div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">{label}</p><p className="truncate text-sm font-semibold text-neutral-950">{value}</p></div></motion.div>)}</div>
        <div className="relative flex items-center border-y border-dashed border-neutral-200"><span className="-ml-3 h-6 w-6 rounded-full bg-[#f5f5f3]" /><div className="flex-1" /><span className="-mr-3 h-6 w-6 rounded-full bg-[#f5f5f3]" /></div>
        <div className="flex flex-col items-center px-6 py-7 sm:px-8"><div className="rounded-[22px] border border-neutral-200 bg-white p-4 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"><QRCodeSVG value={ticketUrl} size={170} bgColor="#ffffff" fgColor="#090909" level="H" /></div><p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-400">Código do ingresso</p><p className="mt-2 font-mono text-lg font-bold tracking-[0.2em] text-neutral-950">{ticket.code}</p>{ticket.is_used && <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-700"><Shield size={16} />Ingresso já utilizado</div>}</div>
      </motion.div>
      <p className="mt-6 flex items-center justify-center gap-2 px-4 text-center text-xs leading-5 text-neutral-500"><Shield size={14} />Apresente este QR Code e um documento com foto na entrada.</p>
      <div className="mt-5 flex justify-center"><button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50">{downloading ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}{downloading ? 'Gerando...' : 'Baixar comprovante'}</button></div>
    </div>
  );
}
