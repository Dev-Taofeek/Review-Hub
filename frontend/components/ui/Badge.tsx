import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

const variants = {
  default: 'bg-slate-100  text-slate-600  border-slate-200  dark:bg-white/10 dark:text-slate-300',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50   text-amber-700   border-amber-200',
  danger:  'bg-red-50     text-red-700     border-red-200',
  info:    'bg-blue-50    text-blue-700    border-blue-200',
  purple:  'bg-purple-50  text-purple-700  border-purple-200',
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
