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
        <Ticket size={14} className="text-neutral-950" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-semibold">
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

          const isSoldOut = lot.status === 'sold_out' || (isClosed && !isUpcoming && available === 0);
          const badgeLabel =
            isSoldOut ? 'Esgotado'
            : isUpcoming ? 'Em breve' : '';

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
                  ? 'border-neutral-950 bg-neutral-100 shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
                  : isActive
                  ? 'border-neutral-200 bg-white hover:border-neutral-500 hover:bg-neutral-50'
                  : 'border-neutral-200 bg-neutral-100 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Gradient border effect when selected */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.8))',
                  }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Radio indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950'
                        : isClosed
                        ? 'border-neutral-300'
                        : 'border-neutral-300 group-hover:border-neutral-950'
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
                    {isClosed && <Lock size={9} className="text-neutral-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-neutral-950' : 'text-neutral-800'}`}>
                        {lot.name}
                      </span>
                      {badgeLabel && (
                        <span
                          className={`text-[9px] px-2.5 py-1 rounded-full font-medium tracking-wide ${
                            isUpcoming
                              ? 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                              : isSoldOut
                              ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                          }`}
                        >
                          {badgeLabel}
                        </span>
                      )}
                    </div>
                    {isActive && showRemaining && (
                      <span className="text-xs text-neutral-500 mt-0.5 block">
                        {available} {available === 1 ? 'ingresso disponivel' : 'ingressos disponiveis'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-playfair text-xl transition-colors ${isSelected ? 'text-neutral-950' : isActive ? 'text-neutral-700' : 'text-neutral-400'}`}>
                    {formatPrice(lot.price)}
                  </div>
                  <div className="text-[10px] text-neutral-400">por ingresso</div>
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
