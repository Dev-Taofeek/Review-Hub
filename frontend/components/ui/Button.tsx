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
    'bg-gradient-to-r from-brand-600 to-brand-700',
    'text-white font-semibold',
    'shadow-lg shadow-brand-900/30',
    'hover:from-brand-500 hover:to-brand-600 hover:shadow-brand-900/50',
    'active:from-brand-700 active:to-brand-800',
    'disabled:from-brand-400 disabled:to-brand-500 disabled:shadow-none',
    'border border-brand-500/30',
  ].join(' '),

  secondary: [
    'bg-white/90 text-slate-800 font-semibold',
    'border border-slate-200',
    'shadow-sm',
    'hover:bg-white hover:border-slate-300 hover:shadow-md',
    'dark:bg-white/[0.07] dark:text-slate-200 dark:border-white/[0.1]',
    'dark:hover:bg-white/[0.11] dark:hover:border-white/[0.15]',
  ].join(' '),

  ghost: [
    'text-slate-600 font-medium',
    'hover:bg-slate-100 hover:text-slate-900',
    'dark:text-slate-400',
    'dark:hover:bg-white/[0.07] dark:hover:text-slate-100',
  ].join(' '),

  danger: [
    'bg-gradient-to-r from-red-600 to-red-700',
    'text-white font-semibold',
    'shadow-md shadow-red-900/25',
    'hover:from-red-500 hover:to-red-600',
    'border border-red-500/30',
  ].join(' '),

  outline: [
    'border border-slate-200 bg-transparent',
    'text-slate-700 font-medium',
    'hover:bg-slate-50 hover:border-slate-300',
    'dark:border-white/[0.1] dark:text-slate-300',
    'dark:hover:bg-white/[0.05] dark:hover:border-white/[0.18]',
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
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
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
