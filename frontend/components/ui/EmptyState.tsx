'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center border border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center', className)}>
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--primary)]">
          <span className="[&>svg]:h-8 [&>svg]:w-8">{icon}</span>
        </div>
      )}
      <h3 className="mb-2 text-lg font-black text-[var(--foreground)]">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm leading-7 text-[var(--muted)]">{description}</p>}
      {action && <Button size="sm" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
