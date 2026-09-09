import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Camera, CameraOff, Search, X, CheckCircle2,
  AlertCircle, User, Ticket as TicketIcon, Calendar, Clock,
  RefreshCw, QrCode, Keyboard, LayoutDashboard,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { Ticket } from '../types';

type ScanMode = 'camera' | 'manual';
type CheckinState = 'idle' | 'scanning' | 'found' | 'success' | 'already_used' | 'not_found' | 'error';

function extractCode(raw: string): string {
  // QR contains URL like https://domain/ingresso/RLIO-XXXX
  // or just the raw code like RLIO-XXXX
  try {
    const url = new URL(raw);
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('ingresso');
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].toUpperCase();
  } catch {
    // not a URL — use as-is
  }
  return raw.trim().toUpperCase();
}

function TicketResultCard({
  ticket,
  onConfirm,
  onReset,
  onGoToDashboard,
  confirming,
  state,
}: {
  ticket: Ticket;
  onConfirm: () => void;
  onReset: () => void;
  onGoToDashboard: () => void;
  confirming: boolean;
  state: CheckinState;
}) {
  const wasUsed = state === 'already_used' || (state === 'found' && ticket.is_used);
  const justCheckedIn = state === 'success';

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {wasUsed && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-2xl">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-red-400">Ingresso já utilizado</div>
            {ticket.used_at && (
              <div className="text-xs text-red-400/60 mt-0.5">
                Utilizado em {new Date(ticket.used_at).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )}

      {justCheckedIn && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <div>
            <div className="text-sm font-medium text-emerald-400">Entrada confirmada!</div>
            <div className="text-xs text-emerald-400/60 mt-0.5">Check-in realizado com sucesso.</div>
          </div>
        </div>
      )}

      {/* Ticket card */}
      <div className={`bg-dark-800 border rounded-2xl overflow-hidden ${wasUsed ? 'border-red-500/20' : justCheckedIn ? 'border-emerald-500/25' : 'border-gold-600/15'}`}>
        {/* Card header */}
        <div className="px-6 py-5 border-b border-gold-600/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold-600/8 border border-gold-600/15 flex items-center justify-center">
              <TicketIcon size={16} className="text-gold-500/70" />
            </div>
            <div>
              <div className="text-[9px] tracking-widest text-white/25 uppercase">Código</div>
              <div className="font-mono text-gold-400 text-sm tracking-widest font-medium">{ticket.code}</div>
            </div>
          </div>
          <Badge variant={wasUsed ? 'red' : justCheckedIn ? 'green' : 'gold'}>
            {wasUsed ? 'Utilizado' : justCheckedIn ? 'Check-in OK' : 'Válido'}
          </Badge>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-3.5">
          {[
            { icon: User, label: 'Comprador', value: ticket.buyer_name },
            { icon: TicketIcon, label: 'Lote', value: ticket.lot_name },
            { icon: Calendar, label: 'Comprado em', value: new Date(ticket.created_at).toLocaleDateString('pt-BR') },
            { icon: Clock, label: 'Data do Evento', value: `${ticket.event_date} • ${ticket.event_time}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={14} className="text-white/25 shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] tracking-widest text-white/25 uppercase">{label}</div>
                <div className="text-sm text-white/70 truncate">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 text-xs text-white/40 hover:text-white/70 border border-gold-600/15 hover:border-gold-600/30 rounded-full transition-all"
          >
            <RefreshCw size={13} /> Novo scan
          </button>

          {!wasUsed && !justCheckedIn && (
            <Button
              className="flex-1"
              onClick={onConfirm}
              loading={confirming}
            >
              <CheckCircle2 size={14} />
              Confirmar Entrada
            </Button>
          )}
        </div>

        {justCheckedIn && (
          <Button
            variant="outline"
            className="w-full"
            onClick={onGoToDashboard}
          >
            <LayoutDashboard size={14} />
            Voltar ao Painel
          </Button>
        )}
      </div>
    </div>
  );
}

function QRScanner({ onDetect }: { onDetect: (code: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerIdRef = useRef<string>('');
  const [camState, setCamState] = useState<'idle' | 'starting' | 'active' | 'denied' | 'unsupported' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const detectedRef = useRef(false);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore stop errors
      }
    }
    scannerRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCamState('starting');
    setErrorMessage('');
    detectedRef.current = false;

    const scannerId = `qr-reader-${Date.now()}`;
    scannerIdRef.current = scannerId;

    try {
      const scanner = new Html5Qrcode(scannerId, {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCamState('denied');
        setErrorMessage('Nenhuma câmera encontrada.');
        return;
      }

      const backCamera = cameras.find(
        (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('traseira')
      ) || cameras[cameras.length - 1];

      await scanner.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 320, height: 320 },
          aspectRatio: 1,
        },
        (decodedText) => {
          if (detectedRef.current) return;
          detectedRef.current = true;
          stopCamera();
          setCamState('idle');
          onDetect(decodedText);
        },
        () => {
          // scan error - ignore, keep scanning
        }
      );

      setCamState('active');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '';
      const errorName = (err as { name?: string })?.name || '';

      if (errorName === 'NotAllowedError' || errorMsg.includes('Permission')) {
        setCamState('denied');
        setErrorMessage('Permissão de câmera negada. Permita o acesso nas configurações do navegador.');
      } else if (errorMsg.includes('not supported') || errorMsg.includes('not found')) {
        setCamState('unsupported');
        setErrorMessage('Scanner não suportado neste dispositivo.');
      } else {
        setCamState('error');
        setErrorMessage('Erro ao iniciar câmera. Tente novamente ou use a busca manual.');
      }
      await stopCamera();
    }
  }, [onDetect, stopCamera]);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  // Generate a stable scanner ID for this component instance
  const [scannerId] = useState(() => `qr-reader-${Math.random().toString(36).slice(2, 9)}`);

  return (
    <div className="space-y-4">
      {/* Viewfinder container */}
      <div className="relative w-full aspect-square bg-dark-900 rounded-2xl overflow-hidden border border-gold-600/15">
        {/* Scanner element - html5-qrcode will render video here */}
        <div
          id={scannerId}
          className={`absolute inset-0 w-full h-full ${camState === 'active' ? 'block' : 'hidden'}`}
        />

        {/* Overlay when camera not active */}
        {camState !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            {camState === 'starting' && <Spinner size={32} />}
            {camState === 'idle' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-gold-600/8 border border-gold-600/15 flex items-center justify-center">
                  <Camera size={28} className="text-gold-500/50" />
                </div>
                <div className="text-sm text-white/30">Câmera inativa</div>
              </>
            )}
            {(camState === 'denied' || camState === 'error') && (
              <>
                <CameraOff size={32} className="text-red-400/60" />
                <div className="text-sm text-red-400/70 whitespace-pre-line">{errorMessage || 'Permissão de câmera negada.\nUse a busca manual abaixo.'}</div>
              </>
            )}
            {camState === 'unsupported' && (
              <>
                <QrCode size={32} className="text-white/20" />
                <div className="text-sm text-white/30 whitespace-pre-line">{errorMessage || 'Scanner não suportado neste navegador.\nUse a busca manual abaixo.'}</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Camera toggle */}
      {camState !== 'unsupported' && (
        <button
          onClick={camState === 'active' ? stopCamera : startCamera}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-sm font-medium tracking-widest uppercase transition-all ${
            camState === 'active'
              ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
              : 'bg-gold-500 text-white hover:bg-gold-400'
          }`}
        >
          {camState === 'active' ? (
            <><CameraOff size={16} /> Parar Câmera</>
          ) : (
            <><Camera size={16} /> {camState === 'starting' ? 'Iniciando...' : 'Escanear QR Code'}</>
          )}
        </button>
      )}

      {camState === 'active' && (
        <p className="text-center text-xs text-white/25">Aponte a câmera para o QR Code do ingresso</p>
      )}
    </div>
  );
}

export default function AdminCheckin() {
  const { loading, isAdmin } = useAdminGuard();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [mode, setMode] = useState<ScanMode>('camera');
  const [manualCode, setManualCode] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [state, setState] = useState<CheckinState>('idle');
  const [lookupLoading, setLookupLoading] = useState(false);

  const lookupTicket = useCallback(async (raw: string) => {
    const code = extractCode(raw);
    if (!code) return;
    setLookupLoading(true);
    setState('scanning');
    setTicket(null);

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
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

  const checkinMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase
        .from('tickets')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      setState('success');
      qc.invalidateQueries({ queryKey: ['ticket'] });
    },
    onError: () => setState('error'),
  });

  const handleDetect = useCallback((raw: string) => {
    setMode('camera');
    lookupTicket(raw);
  }, [lookupTicket]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    lookupTicket(manualCode);
  };

  const handleReset = () => {
    setTicket(null);
    setState('idle');
    setManualCode('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const showResult = ticket && (state === 'found' || state === 'already_used' || state === 'success');

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="border-b border-gold-600/10 bg-dark-900/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 -ml-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
            aria-label="Voltar ao painel"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="font-script text-xl sm:text-2xl text-gradient-gold leading-none">Lux House</div>
            <div className="text-[8px] sm:text-[9px] tracking-widest text-white/20 uppercase">Check-in de Ingressos</div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* Mode tabs */}
        <div className="flex gap-1 p-1 bg-dark-800 border border-gold-600/10 rounded-xl">
          {([['camera', 'Câmera', Camera], ['manual', 'Código', Keyboard]] as const).map(([m, label, Icon]) => (
            <button
              key={m}
              onClick={() => { setMode(m); handleReset(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium tracking-widest uppercase transition-all ${
                mode === m
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Feedback states (before result) */}
        {state === 'scanning' && !ticket && (
          <div className="flex items-center justify-center gap-3 py-8 text-white/40">
            <Spinner size={20} />
            <span className="text-sm">Buscando ingresso...</span>
          </div>
        )}

        {state === 'not_found' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-400" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-red-400">Ingresso não encontrado</div>
              <div className="text-xs text-white/25 mt-1">Verifique o código e tente novamente.</div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mt-1"
            >
              <RefreshCw size={12} /> Tentar novamente
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <div className="text-sm text-red-400">Erro ao registrar check-in. Tente novamente.</div>
          </div>
        )}

        {/* Result card */}
        {showResult && ticket && (
          <TicketResultCard
            ticket={ticket}
            state={state}
            confirming={checkinMutation.isPending}
            onConfirm={() => checkinMutation.mutate(ticket.id)}
            onReset={handleReset}
            onGoToDashboard={() => navigate('/admin/dashboard')}
          />
        )}

        {/* Scanner / Manual (show only when no result) */}
        {!showResult && state !== 'scanning' && (
          <>
            {mode === 'camera' && (
              <QRScanner onDetect={handleDetect} />
            )}

            {mode === 'manual' && (
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest text-white/30 uppercase">
                    Código do Ingresso
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      placeholder="RLIO-XXXXXX"
                      autoFocus
                      spellCheck={false}
                      className="w-full pl-10 pr-10 py-3.5 bg-dark-800 border border-gold-600/15 rounded-xl text-white font-mono placeholder-white/20 outline-none focus:border-gold-500/40 transition-colors text-sm tracking-widest"
                    />
                    {manualCode && (
                      <button
                        type="button"
                        onClick={() => setManualCode('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  loading={lookupLoading}
                  disabled={!manualCode.trim()}
                >
                  <Search size={14} />
                  Buscar Ingresso
                </Button>
              </form>
            )}
          </>
        )}

        {/* Also show manual search below scanner when not in result state */}
        {mode === 'camera' && !showResult && state !== 'scanning' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gold-600/10" />
              <span className="text-[10px] tracking-widest text-white/20 uppercase">ou busca manual</span>
              <div className="flex-1 h-px bg-gold-600/10" />
            </div>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="RLIO-XXXXXX"
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-dark-800 border border-gold-600/15 rounded-xl text-white font-mono placeholder-white/20 outline-none focus:border-gold-500/40 transition-colors text-sm tracking-widest"
                />
              </div>
              <Button
                type="submit"
                loading={lookupLoading}
                disabled={!manualCode.trim()}
                size="md"
              >
                <Search size={14} />
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
