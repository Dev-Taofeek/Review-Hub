'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const fieldBase = [
  'w-full rounded-md border border-[var(--border)]',
  'bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)]',
  'placeholder:text-[var(--text-3)]',
  'transition-colors duration-150',
  'hover:border-[var(--primary)]',
  'focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
  'disabled:cursor-not-allowed disabled:bg-[var(--surface-soft)] disabled:opacity-60',
].join(' ');

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
          <label htmlFor={inputId} className="text-sm font-bold text-[var(--foreground)]">
            {label}
            {rest.required && <span className="ml-1 text-[var(--danger)]" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(fieldBase, error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-soft)]', icon && 'pl-10', iconRight && 'pr-10', className)}
            {...rest}
          />
          {iconRight && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] [&>svg]:h-4 [&>svg]:w-4">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs font-bold text-[var(--danger)]">{error}</p>
        )}
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

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
          <label htmlFor={inputId} className="text-sm font-bold text-[var(--foreground)]">
            {label}
            {rest.required && <span className="ml-1 text-[var(--danger)]" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(fieldBase, 'min-h-[120px] resize-y', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-soft)]', className)}
          {...rest}
        />
        {error && <p id={`${inputId}-error`} role="alert" className="text-xs font-bold text-[var(--danger)]">{error}</p>}
        {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-[var(--muted)]">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

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
        {label && <label htmlFor={inputId} className="text-sm font-bold text-[var(--foreground)]">{label}</label>}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(fieldBase, 'cursor-pointer', error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-soft)]', className)}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {error && <p role="alert" className="text-xs font-bold text-[var(--danger)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
