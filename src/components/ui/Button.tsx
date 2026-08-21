import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold tracking-wider uppercase transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 relative overflow-hidden';

    const variants = {
      primary: 'btn-primary text-white',
      outline: 'btn-outline text-purple-400',
      ghost: 'text-white/60 hover:text-white hover:bg-white/5 bg-transparent',
      danger: 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:border-red-400',
    };

    const sizes = {
      sm: 'text-[11px] px-4 py-2',
      md: 'text-xs px-6 py-3',
      lg: 'text-sm px-8 py-4',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
