import { motion } from 'framer-motion';
import { Check, AlertCircle, Lock, Ticket } from 'lucide-react';
import type { Lot } from '../../types';

interface LotSelectorProps {
  lots: Lot[];
  selectedId: string;
  onChange: (id: string) => void;
  error?: string;
  showRemaining?: boolean;
}

function formatPrice(price: number) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function LotSelector({ lots, selectedId, onChange, error, showRemaining = false }: LotSelectorProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Ticket size={14} className="text-purple-400" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium">
          Selecionar Lote
        </span>
      </div>

      <div className="space-y-3">
        {(() => {
          const activeIndex = lots.findIndex(
            (l) => l.status === 'active' && l.total_quantity - l.sold_quantity > 0
          );
          return lots.map((lot, i) => {
          const available = lot.total_quantity - lot.sold_quantity;
          const isActive = lot.status === 'active' && available > 0;
          const isClosed = lot.status === 'closed';
          const isSelected = selectedId === lot.id;
          const isUpcoming = isClosed && activeIndex !== -1 && i > activeIndex;

          const badgeLabel =
            lot.status === 'sold_out' || (isClosed && !isUpcoming) ? 'Esgotado'
            : isUpcoming ? 'Em breve...' : '';

          return (
            <motion.button
              key={lot.id}
              type="button"
              disabled={!isActive}
              onClick={() => isActive && onChange(lot.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={isActive ? { scale: 1.01 } : {}}
              whileTap={isActive ? { scale: 0.99 } : {}}
              className={`w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'border-purple-500/60 bg-purple-500/10'
                  : isActive
                  ? 'border-white/10 bg-dark-800/60 hover:border-purple-500/30 hover:bg-purple-500/5'
                  : 'border-white/5 bg-dark-800/30 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Gradient border effect when selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(255, 90, 0, 0.1))',
                  }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Radio indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500'
                        : isClosed
                        ? 'border-white/10'
                        : 'border-white/20 group-hover:border-purple-500/40'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check size={11} className="text-white stroke-[3]" />
                      </motion.div>
                    )}
                    {isClosed && <Lock size={9} className="text-white/25" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {lot.name}
                      </span>
                      {badgeLabel && (
                        <span
                          className={`text-[9px] px-2.5 py-1 rounded-full font-medium ${
                            isUpcoming
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                              : isClosed || lot.status === 'sold_out'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                              : 'bg-white/5 text-white/40 border border-white/5'
                          }`}
                        >
                          {badgeLabel}
                        </span>
                      )}
                    </div>
                    {isActive && showRemaining && (
                      <span className="text-xs text-white/40 mt-0.5 block">
                        {available} {available === 1 ? 'ingresso disponivel' : 'ingressos disponiveis'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-playfair text-xl transition-colors ${isSelected ? 'text-purple-400' : isActive ? 'text-white/80' : 'text-white/30'}`}>
                    {formatPrice(lot.price)}
                  </div>
                  <div className="text-[10px] text-white/30">por ingresso</div>
                </div>
              </div>
            </motion.button>
          );
          });
        })()}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
        >
          <AlertCircle size={14} />
          {error}
        </motion.div>
      )}
    </div>
  );
}
