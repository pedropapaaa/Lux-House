import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Mail, CreditCard, Ticket as TicketIcon, ChevronRight, Search, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { Ticket } from '../types';

function TicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Link to={`/ingresso/${ticket.code}`} className="block group">
        <div
          className="glass-card rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300"
          style={{ border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center shrink-0">
              <TicketIcon size={20} className="text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/80 font-medium truncate">{ticket.buyer_name}</div>
              <div className="text-xs text-white/40 mt-0.5">{ticket.lot_name}</div>
              <div className="font-mono text-xs text-purple-400/70 mt-1 tracking-wider">{ticket.code}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ticket.is_used ? (
                <span className="text-[10px] tracking-widest uppercase text-red-400/80 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  Usado
                </span>
              ) : (
                <span className="text-[10px] tracking-widest uppercase text-emerald-400/80 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Valido
                </span>
              )}
              <ChevronRight size={18} className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function MyTickets() {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [searchedEmail, setSearchedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !cpf.trim()) return;
    setError('');
    setLoading(true);
    setSearchedEmail(email.trim());
    const cleanCpf = cpf.trim().replace(/\D/g, '');
    const { data, error: queryError } = await supabase
      .from('tickets')
      .select('*, orders!inner(buyer_cpf)')
      .ilike('buyer_email', email.trim())
      .order('created_at', { ascending: false });
    setLoading(false);
    if (queryError) {
      setError('Erro ao buscar ingressos. Tente novamente.');
      return;
    }
    const filtered = (data ?? []).filter(
      (t: any) => (t.orders?.buyer_cpf ?? '').replace(/\D/g, '') === cleanCpf
    );
    setTickets(filtered as Ticket[]);
  };

  const handleReset = () => {
    setSearchedEmail(null);
    setTickets([]);
    setEmail('');
    setCpf('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-10 sm:py-16">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-80 bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
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
                  style={{ filter: 'drop-shadow(0 0 20px rgba(212, 132, 46, 0.5))' }}
                />
              </picture>
            </motion.div>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <TicketIcon size={12} className="text-purple-400" />
            <span className="text-[10px] tracking-widest text-white/50 uppercase">Meus Ingressos</span>
          </div>
        </motion.div>

        {/* Search form */}
        {searchedEmail === null ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-white" />
              </div>
              <h1 className="font-playfair text-xl text-white">Recuperar Ingressos</h1>
              <p className="text-xs text-white/40 mt-2">
                Digite o e-mail e o CPF utilizados na compra para encontrar seus ingressos
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest text-white/40 uppercase">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white placeholder-white/25 outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-widest text-white/40 uppercase">CPF</label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm bg-dark-800 border border-white/10 rounded-xl text-white placeholder-white/25 outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl"
              >
                <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Buscar meus ingressos
            </Button>
          </motion.form>
        ) : (
          <>
            {/* Results header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <p className="text-xs text-white/30">Ingressos de</p>
                <p className="text-sm text-white/70 font-medium">{searchedEmail}</p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-pink-400 transition-colors tracking-wide"
              >
                <ArrowLeft size={14} />
                Nova busca
              </button>
            </motion.div>

            {/* Tickets list */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner size={36} />
              </div>
            ) : tickets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <TicketIcon size={28} className="text-white/20" />
                </div>
                <h3 className="font-playfair text-lg text-white/80 mb-2">Nenhum ingresso encontrado</h3>
                <p className="text-xs text-white/30 max-w-xs mx-auto">
                  Nenhum ingresso encontrado para este e-mail e CPF. Verifique os dados informados.
                </p>
                <button onClick={handleReset} className="inline-block mt-6">
                  <Button variant="outline" size="sm">Tentar novamente</Button>
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t, i) => (
                  <TicketCard key={t.id} ticket={t} index={i} />
                ))}
              </div>
            )}
          </>
        )}

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
