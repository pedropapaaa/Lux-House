import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
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
      'inline-flex items-center justify-center gap-2 font-semibold tracking-[0.12em] uppercase transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta-500/50 relative overflow-hidden min-h-11';

    const variants = {
      primary: 'btn-primary text-white',
      outline: 'btn-outline text-purple-400',
      ghost: 'text-white/65 hover:text-white hover:bg-white/7 bg-transparent',
      danger: 'bg-red-500/12 border border-red-500/35 text-red-300 hover:bg-red-500/20 hover:border-red-400',
    };

    const sizes = {
      sm: 'text-[11px] px-4 py-2',
      md: 'text-xs px-6 py-3',
      lg: 'text-sm px-8 py-4',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
