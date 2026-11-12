import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle2, Copy, ScanLine } from 'lucide-react';

interface QRCodeDisplayProps { pixCode: string; qrBase64?: string | null; }

export default function QRCodeDisplay({ pixCode, qrBase64 }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex w-full items-center justify-between border-b border-neutral-200 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Pagamento instantâneo</p><h2 className="mt-2 font-display text-2xl font-black uppercase tracking-[-0.04em] text-neutral-950">Escaneie o QR Code</h2></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white"><ScanLine size={18} /></span></div>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[24px] border border-neutral-200 bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.12)] sm:p-5"><div className="rounded-2xl bg-white p-2">{qrBase64 ? <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code Pix" width={240} height={240} className="block h-auto w-[220px] sm:w-[240px]" /> : <QRCodeSVG value={pixCode} size={240} bgColor="#ffffff" fgColor="#090909" level="M" className="h-auto w-[220px] sm:w-[240px]" />}</div></motion.div>
      <p className="mt-5 max-w-xs text-center text-xs leading-5 text-neutral-500">Abra o aplicativo do seu banco e aponte a câmera para pagar.</p>
      <div className="mt-7 w-full"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Pix copia e cola</span>{copied && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Copiado</span>}</div><div className="flex flex-col gap-2 sm:flex-row"><div className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 font-mono text-xs leading-5 text-neutral-600"><span className="block truncate">{pixCode}</span></div><motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={copyCode} className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${copied ? 'bg-emerald-700 text-white' : 'bg-neutral-950 text-white hover:bg-neutral-700'}`}><AnimatePresence mode="wait">{copied ? <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><Check size={16} />Copiado</motion.span> : <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><Copy size={16} />Copiar código</motion.span>}</AnimatePresence></motion.button></div></div>
    </div>
  );
}
