import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Ticket as TicketIcon, Sparkles, Shield, Download, Loader2 } from 'lucide-react';
import type { Ticket } from '../../types';
import { generateReceiptImage } from '../../lib/generateReceipt';

interface TicketDisplayProps {
  ticket: Ticket;
}

export default function TicketDisplay({ ticket }: TicketDisplayProps) {
  const ticketUrl = `${window.location.origin}/ingresso/${ticket.code}`;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateReceiptImage(ticket);
    } catch (e) {
      console.error('Failed to generate receipt:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Ticket card */}
      <motion.div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{
          boxShadow: '0 0 60px rgba(212, 132, 46, 0.15), 0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Premium gradient border */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl p-[1px] bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-cyan-500/30 pointer-events-none" />

        <div className="bg-dark-900 rounded-2xl sm:rounded-3xl">
          {/* Header */}
          <div className="relative px-5 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center border-b border-white/5">
            {/* Decorative dots */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #D4842E 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles size={10} className="text-purple-400" />
                <span className="text-[9px] tracking-[0.5em] text-purple-400/60 uppercase">Ingresso Digital</span>
                <Sparkles size={10} className="text-pink-400" />
              </div>
              <div className="font-roma text-5xl sm:text-6xl font-bold text-gradient-primary mb-2" style={{ letterSpacing: '0.08em' }}>Lux House</div>
              <div className="text-[9px] tracking-[0.5em] text-white/20 uppercase">Casa de Show</div>
            </div>
          </div>

          {/* Ticket details */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-3 sm:space-y-4">
            {[
              { icon: User, label: 'Comprador', value: ticket.buyer_name, color: '#D4842E' },
              { icon: TicketIcon, label: 'Lote', value: ticket.lot_name, color: '#FF8C2E' },
              { icon: Calendar, label: 'Data', value: ticket.event_date, color: '#5B9BD5' },
              { icon: Clock, label: 'Horário', value: ticket.event_time, color: '#E8A04F' },
              { icon: MapPin, label: 'Local', value: ticket.event_location, color: '#FFB066' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                  <Icon size={14} style={{ color }} className="sm:text-[15px]" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] tracking-widest text-white/25 uppercase">{label}</div>
                  <div className="text-sm text-white/80 font-medium truncate">{value}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Separator (torn effect) */}
          <div className="flex items-center px-5 sm:px-6">
            <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-dark-950 -ml-6 sm:-ml-9 border-r border-white/10" />
            <div className="flex-1 border-t border-dashed border-white/10" />
            <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-dark-950 -mr-6 sm:-mr-9 border-l border-white/10" />
          </div>

          {/* QR section */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 sm:p-5 bg-white rounded-2xl shadow-lg"
            >
              <QRCodeSVG
                value={ticketUrl}
                size={140}
                bgColor="#ffffff"
                fgColor="#090909"
                level="H"
                className="sm:w-[160px] sm:h-[160px]"
              />
            </motion.div>

            <div className="text-center">
              <div className="text-[10px] tracking-widest text-white/25 uppercase mb-1.5">Codigo</div>
              <div className="font-mono text-lg sm:text-xl text-gradient-primary tracking-[0.15em] sm:tracking-[0.2em] font-semibold">
                {ticket.code}
              </div>
            </div>

            {ticket.is_used && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-center text-sm text-red-400 flex items-center justify-center gap-2"
              >
                <Shield size={16} className="text-red-400/60" />
                Ingresso ja utilizado
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-white/25 mt-6 leading-relaxed px-4 flex items-center justify-center gap-2"
      >
        <Shield size={14} className="text-cyan-400/60" />
        Apresente este QR Code na entrada. Documento com foto obrigatorio.
      </motion.p>

      {/* Download receipt button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center mt-6"
      >
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 size={18} className="text-purple-400 animate-spin" />
          ) : (
            <Download size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            {downloading ? 'Gerando...' : 'Baixar Comprovante'}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
