import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useTicketByCode } from '../hooks/useTicket';
import TicketDisplay from '../components/ticket/TicketDisplay';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function TicketPage() {
  const { code } = useParams<{ code: string }>();
  const { data: ticket, isLoading, error } = useTicketByCode(code);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center"
        >
          <AlertCircle size={36} className="text-red-400" />
        </motion.div>
        <h2 className="font-playfair text-2xl sm:text-3xl text-white">Ingresso nao encontrado</h2>
        <p className="text-white/40 text-sm max-w-xs">
          O codigo do ingresso e invalido ou este ingresso nao existe.
        </p>
        <Link to="/">
          <Button variant="outline">Voltar ao Inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-10 sm:py-16">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-80 bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <Link to="/" className="inline-block mb-5 group">
            <motion.div whileHover={{ scale: 1.05 }}>
              <picture>
                <source srcSet="/images/logo.webp" type="image/webp" />
                <img
                  src="/images/logo.webp"
                  alt="Lux House"
                  width={80}
                  height={80}
                  loading="lazy"
                  className="w-18 h-18 object-contain mx-auto rounded-full"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))' }}
                />
              </picture>
            </motion.div>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] tracking-widest text-white/50 uppercase">Seu Ingresso Digital</span>
          </div>
        </motion.div>

        {/* Ticket */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <TicketDisplay ticket={ticket} />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            to="/"
            className="text-xs text-white/25 hover:text-white/50 transition-colors tracking-wider inline-flex items-center gap-2"
          >
            Voltar ao site
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
