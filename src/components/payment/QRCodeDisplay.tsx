import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle } from 'lucide-react';

interface QRCodeDisplayProps {
  pixCode: string;
  qrBase64?: string | null;
}

export default function QRCodeDisplay({ pixCode, qrBase64 }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* QR Code */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-4 sm:p-5 bg-white rounded-2xl"
        style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), 0 10px 30px rgba(0, 0, 0, 0.3)' }}
      >
        {qrBase64 ? (
          <img
            src={`data:image/png;base64,${qrBase64}`}
            alt="QR Code Pix"
            width={200}
            height={200}
            className="block"
          />
        ) : (
          <QRCodeSVG
            value={pixCode}
            size={200}
            bgColor="#ffffff"
            fgColor="#090909"
            level="M"
          />
        )}
      </motion.div>

      {/* Copy code */}
      <div className="w-full">
        <div className="text-[10px] tracking-widest text-white/30 uppercase mb-3 text-center font-medium">
          Pix Copia e Cola
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-4 py-4 text-xs text-white/50 font-mono truncate text-center sm:text-left">
            {pixCode}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyCode}
            className={`flex items-center justify-center gap-2 px-5 py-4 rounded-xl border text-sm font-medium tracking-wider transition-all duration-300 shrink-0 ${
              copied
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:border-purple-400/50 hover:bg-purple-500/15'
            }`}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Copiado
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Copy size={16} /> Copiar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
