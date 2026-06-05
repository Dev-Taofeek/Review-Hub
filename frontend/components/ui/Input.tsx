'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/* ── Shared field base ──────────────────────────────────── */
const fieldBase = [
  'w-full rounded-xl border',
  'bg-white dark:bg-[#0c1830]',
  'px-3.5 py-2.5 text-sm',
  'text-slate-900 dark:text-slate-100',
  'placeholder:text-slate-400 dark:placeholder:text-slate-600',
  'shadow-sm',
  'transition-all duration-150',
  'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
  'dark:focus:ring-brand-500/30 dark:focus:border-brand-500/70',
  'hover:border-slate-300 dark:hover:border-white/15',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-white/5',
].join(' ');

const fieldBorder = {
  normal: 'border-slate-200 dark:border-white/[0.09]',
  error:  'border-red-400 dark:border-red-500/70 focus:ring-red-400/50 focus:border-red-400',
};

/* ── Input ─────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {rest.required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              fieldBase,
              error ? fieldBorder.error : fieldBorder.normal,
              icon      && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            {...rest}
          />
          {iconRight && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 [&>svg]:h-4 [&>svg]:w-4">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
            <span className="h-3.5 w-3.5 rounded-full bg-red-500/15 flex items-center justify-center text-[9px] font-bold leading-none shrink-0">!</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ── Textarea ──────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {rest.required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            fieldBase,
            'resize-vertical min-h-[100px]',
            error ? fieldBorder.error : fieldBorder.normal,
            className
          )}
          {...rest}
        />
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400">
            <span className="h-3.5 w-3.5 rounded-full bg-red-500/15 flex items-center justify-center text-[9px] font-bold leading-none shrink-0">!</span>
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* ── Select ────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            fieldBase,
            'cursor-pointer appearance-none',
            error ? fieldBorder.error : fieldBorder.normal,
            className
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p role="alert" className="text-xs font-medium text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
