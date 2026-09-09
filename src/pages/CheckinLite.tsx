import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Search, CheckCircle2, AlertCircle, RefreshCw, Ticket, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui/Spinner';
import QRScanner from '../components/checkin/QRScannerLite';

type CheckinState = 'idle' | 'scanning' | 'found' | 'success' | 'already_used' | 'not_found' | 'error';

function extractCode(raw: string): string {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('ingresso');
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].toUpperCase();
  } catch { /* not a URL */ }
  return raw.trim().toUpperCase();
}

export default function CheckinLite() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [ticket, setTicket] = useState<{ code: string; buyer_name: string; lot_name: string; is_used: boolean; used_at: string | null } | null>(null);
  const [state, setState] = useState<CheckinState>('idle');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) navigate('/admin');
        return;
      }
      const { data } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (mounted) {
        if (!data) navigate('/admin');
        else setIsAdmin(true);
        setCheckingAuth(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const lookupTicket = useCallback(async (raw: string) => {
    const code = extractCode(raw);
    if (!code) return;
    setLookupLoading(true);
    setState('scanning');
    setTicket(null);

    const { data, error } = await supabase
      .from('tickets')
      .select('code, buyer_name, lot_name, is_used, used_at')
      .eq('code', code)
      .maybeSingle();

    setLookupLoading(false);
    if (error || !data) {
      setState('not_found');
      return;
    }
    setTicket(data);
    setState(data.is_used ? 'already_used' : 'found');
  }, []);

  const confirmCheckin = useCallback(async () => {
    if (!ticket) return;
    setState('scanning');
    const { error } = await supabase
      .from('tickets')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('code', ticket.code);
    if (error) {
      setState('error');
    } else {
      setState('success');
    }
  }, [ticket]);

  const handleReset = useCallback(() => {
    setTicket(null);
    setState('idle');
    setManualCode('');
    setShowScanner(false);
  }, []);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    lookupTicket(manualCode);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const showResult = ticket && (state === 'found' || state === 'already_used' || state === 'success');
  const wasUsed = state === 'already_used' || (state === 'found' && ticket?.is_used);
  const justCheckedIn = state === 'success';

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-dark-950/95 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/dashboard')}
            className="p-2.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Ticket size={18} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-gradient-primary">Check-in</div>
              <div className="text-[9px] text-white/25 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={8} className="text-purple-400" /> Lux House
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Loading state */}
        <AnimatePresence mode="wait">
          {state === 'scanning' && !ticket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center gap-4 py-12"
            >
              <Spinner size={32} />
              <span className="text-sm text-white/50">Buscando ingresso...</span>
            </motion.div>
          )}

          {state === 'not_found' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-red-400 mb-2">Ingresso nao encontrado</div>
                <button
                  onClick={handleReset}
                  className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} /> Tentar novamente
                </button>
              </div>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/25 rounded-2xl"
            >
              <AlertCircle size={20} className="text-red-400 shrink-0" />
              <div className="text-sm text-red-400">Erro ao processar. Tente novamente.</div>
            </motion.div>
          )}

          {/* Result Card */}
          {showResult && ticket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Status message */}
              {wasUsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/25 rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-400">Ingresso ja utilizado</div>
                    {ticket.used_at && (
                      <div className="text-xs text-red-400/60 mt-1">{new Date(ticket.used_at).toLocaleString('pt-BR')}</div>
                    )}
                  </div>
                </motion.div>
              )}

              {justCheckedIn && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-emerald-400">Entrada confirmada!</div>
                  </div>
                </motion.div>
              )}

              {/* Ticket info card */}
              <motion.div
                className={`rounded-2xl p-5 border ${
                  wasUsed
                    ? 'border-red-500/20 bg-red-500/5'
                    : justCheckedIn
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-purple-500/20 bg-dark-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">Codigo</span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    wasUsed
                      ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                      : justCheckedIn
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                  }`}>
                    {wasUsed ? 'Usado' : justCheckedIn ? 'OK' : 'Valido'}
                  </span>
                </div>
                <div className="font-mono text-xl text-gradient-primary tracking-wider mb-5">{ticket.code}</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/30">Comprador</span>
                    <span className="text-white/80 font-medium">{ticket.buyer_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/30">Lote</span>
                    <span className="text-white/80">{ticket.lot_name}</span>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-sm text-white/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <RefreshCw size={14} /> Novo
                </motion.button>
                {!wasUsed && !justCheckedIn && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmCheckin}
                    className="flex-1 flex items-center justify-center gap-2 py-4 text-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-medium"
                  >
                    <CheckCircle2 size={14} /> Confirmar
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner / Manual Input */}
        {!showResult && state !== 'scanning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Camera Button */}
            {!showScanner && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowScanner(true)}
                className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-semibold shadow-lg"
                style={{ boxShadow: '0 8px 30px rgba(212, 132, 46, 0.3)' }}
              >
                <Camera size={20} /> Abrir Camera
              </motion.button>
            )}

            {/* Scanner Container */}
            {showScanner && (
              <QRScanner
                onDetect={(code) => { setShowScanner(false); lookupTicket(code); }}
                onClose={() => setShowScanner(false)}
              />
            )}

            {/* Manual Input */}
            <form onSubmit={handleManualSearch} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">ou codigo manual</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              <div className="flex gap-3">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="RLIO-XXXXXX"
                  spellCheck={false}
                  className="flex-1 px-5 py-4 bg-dark-800 border border-white/10 rounded-xl text-white font-mono placeholder-white/20 outline-none focus:border-purple-500/40 transition-colors text-sm tracking-wider"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!manualCode.trim() || lookupLoading}
                  className="px-5 py-4 bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded-xl hover:bg-purple-500/25 disabled:opacity-50 transition-colors"
                >
                  <Search size={20} />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
