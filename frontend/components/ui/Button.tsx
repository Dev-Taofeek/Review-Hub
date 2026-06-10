'use client';

import { forwardRef } from 'react';
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
    'bg-[var(--primary)] text-white font-extrabold',
    'hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)]',
    'active:brightness-95',
    'border border-[var(--primary)]',
  ].join(' '),

  secondary: [
    'bg-[var(--surface-soft)] text-[var(--foreground)] font-extrabold',
    'border border-[var(--border)]',
    'hover:border-[var(--primary)]',
  ].join(' '),

  ghost: [
    'text-[var(--muted)] font-bold',
    'hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]',
  ].join(' '),

  danger: [
    'bg-[var(--danger)]',
    'text-white font-extrabold',
    'border border-[var(--danger)]',
  ].join(' '),

  outline: [
    'border border-[var(--border)] bg-transparent',
    'text-[var(--foreground)] font-bold',
    'hover:bg-[var(--surface-soft)] hover:border-[var(--primary)]',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  xs: 'h-7  px-3   text-xs  gap-1.5 rounded-md',
  sm: 'h-9  px-3.5 text-sm  gap-2   rounded-md',
  md: 'h-10 px-4   text-sm  gap-2   rounded-md',
  lg: 'h-12 px-5   text-base gap-2.5 rounded-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center transition-colors duration-150',
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
      </button>
    );
  }
);

Button.displayName = 'Button';
