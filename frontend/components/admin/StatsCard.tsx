import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changePositive?: boolean;
  className?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'teal' | 'default';
}

const schemes: Record<NonNullable<StatsCardProps['color']>, { accent: string; soft: string }> = {
  default: { accent: 'var(--primary)', soft: 'var(--primary-soft)' },
  blue: { accent: 'var(--accent)', soft: 'var(--accent-soft)' },
  emerald: { accent: 'var(--primary)', soft: 'var(--primary-soft)' },
  amber: { accent: 'var(--secondary)', soft: 'var(--secondary-soft)' },
  red: { accent: 'var(--danger)', soft: 'var(--danger-soft)' },
  purple: { accent: 'var(--primary)', soft: 'var(--primary-soft)' },
  teal: { accent: 'var(--accent)', soft: 'var(--accent-soft)' },
};

export function StatsCard({
  title, value, icon, change, changePositive, className, color = 'default',
}: StatsCardProps) {
  const { accent, soft } = schemes[color];

  return (
    <div className={cn('trust-card trust-card-hover relative overflow-hidden rounded-lg p-5', className)}>
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-md [&>svg]:h-5 [&>svg]:w-5" style={{ background: soft, color: accent }}>
            {icon}
          </div>
          {change && (
            <span
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-black',
                changePositive ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'bg-[var(--secondary-soft)] text-amber-700 dark:text-amber-300'
              )}
            >
              {changePositive ? 'Up' : 'Down'} {change}
            </span>
          )}
        </div>

        <p className="text-data text-3xl font-black leading-none text-[var(--foreground)] sm:text-4xl">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-1.5 text-sm font-black text-[var(--muted)]">{title}</p>
      </div>
    </div>
  );
}
