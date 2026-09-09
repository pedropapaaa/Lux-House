import { forwardRef } from 'react';
import type { SelectHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <motion.select
            ref={ref}
            id={selectId}
            whileFocus={{ scale: 1.01 }}
            className={`w-full input-premium rounded-xl px-4 py-3.5 text-sm text-white outline-none appearance-none cursor-pointer pr-10 ${className}`}
            {...props}
          >
            {children}
          </motion.select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
