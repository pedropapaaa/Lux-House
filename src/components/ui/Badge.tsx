import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type Variant = 'purple' | 'pink' | 'green' | 'red' | 'gray' | 'yellow' | 'blue';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  pink: 'bg-pink-500/15 text-pink-400 border border-pink-500/30',
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  red: 'bg-red-500/15 text-red-400 border border-red-500/30',
  gray: 'bg-white/5 text-white/50 border border-white/10',
  yellow: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  blue: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
};

// Map old gold to pink for backwards compatibility
const legacyMap: Record<string, Variant> = {
  gold: 'pink',
};

export function Badge({ variant = 'gray', children }: BadgeProps) {
  const resolvedVariant = legacyMap[variant as string] ?? variant;

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${styles[resolvedVariant]}`}
    >
      {children}
    </motion.span>
  );
}
