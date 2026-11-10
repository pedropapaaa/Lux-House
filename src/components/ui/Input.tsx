import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  tone?: 'dark' | 'light';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, tone = 'dark', className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className={`text-[11px] tracking-[0.14em] uppercase font-semibold ${tone === 'light' ? 'text-neutral-500' : 'text-white/55'}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${tone === 'light' ? 'border-neutral-200 bg-neutral-50 text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white focus:ring-4 focus:ring-neutral-950/5' : 'input-premium text-white'} ${className}`}
          {...props}
        />
        {error && (
          <p
            className="text-xs text-red-400 flex items-center gap-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
