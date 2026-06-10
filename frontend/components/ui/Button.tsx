'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary: [
    'bg-[var(--primary)] text-white font-bold',
    'shadow-lg shadow-emerald-900/20',
    'hover:brightness-110',
    'active:brightness-95',
    'disabled:shadow-none',
    'border border-emerald-900/10',
  ].join(' '),

  secondary: [
    'bg-[var(--surface)] text-[var(--foreground)] font-bold',
    'border border-[var(--border)] shadow-sm',
    'hover:bg-[var(--surface-soft)] hover:shadow-md',
  ].join(' '),

  ghost: [
    'text-[var(--muted)] font-bold',
    'hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]',
  ].join(' '),

  danger: [
    'bg-red-600',
    'text-white font-semibold',
    'shadow-md shadow-red-900/25',
    'hover:bg-red-500',
    'border border-red-500/30',
  ].join(' '),

  outline: [
    'border border-[var(--border)] bg-transparent',
    'text-[var(--foreground)] font-bold',
    'hover:bg-[var(--surface-soft)] hover:border-[var(--primary)]',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  xs: 'h-7  px-3   text-xs  gap-1.5 rounded-lg',
  sm: 'h-9  px-3.5 text-sm  gap-2   rounded-xl',
  md: 'h-10 px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-12 px-5   text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...rest }, ref) => {
    const reduced = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileHover={(!disabled && !loading && !reduced) ? { scale: 1.015 } : {}}
        whileTap={(!disabled  && !loading && !reduced)  ? { scale: 0.975 } : {}}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...(rest as any)}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-label="Loading" />
        ) : icon}
        {children}
        {!loading && iconRight}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
