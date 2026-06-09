import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-[var(--surface-soft)] text-[var(--muted)] border-[var(--border)]',
  success: 'bg-[var(--primary-soft)] text-[var(--primary)] border-emerald-200/60 dark:border-emerald-300/20',
  warning: 'bg-[var(--secondary-soft)] text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-300/20',
  danger:  'bg-red-50     text-red-700     border-red-200',
  info:    'bg-[var(--accent-soft)] text-cyan-700 dark:text-cyan-200 border-cyan-200/70 dark:border-cyan-300/20',
  purple:  'bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]',
};

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1   text-xs font-medium',
};

export function Badge({ children, className, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    published: { label: 'Published', variant: 'success' },
    pending:   { label: 'Pending',   variant: 'warning' },
    flagged:   { label: 'Flagged',   variant: 'danger'  },
    rejected:  { label: 'Rejected',  variant: 'danger'  },
    resolved:  { label: 'Resolved',  variant: 'success' },
    dismissed: { label: 'Dismissed', variant: 'default' },
    reviewed:  { label: 'Reviewed',  variant: 'info'    },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    admin:     { label: 'Admin',     variant: 'purple' },
    moderator: { label: 'Moderator', variant: 'info'   },
    user:      { label: 'User',      variant: 'default'},
  };
  const { label, variant } = map[role] ?? { label: role, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}
