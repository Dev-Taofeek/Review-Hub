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

const schemes: Record<NonNullable<StatsCardProps['color']>, { from: string; to: string; glow: string }> = {
  default: { from: '#374151', to: '#1f2937', glow: '0 8px 32px rgba(55,65,81,0.3)' },
  blue:    { from: '#2563eb', to: '#1d4ed8', glow: '0 8px 32px rgba(37,99,235,0.35)' },
  emerald: { from: '#059669', to: '#047857', glow: '0 8px 32px rgba(5,150,105,0.35)' },
  amber:   { from: '#d97706', to: '#b45309', glow: '0 8px 32px rgba(217,119,6,0.35)' },
  red:     { from: '#dc2626', to: '#b91c1c', glow: '0 8px 32px rgba(220,38,38,0.35)' },
  purple:  { from: '#7c3aed', to: '#6d28d9', glow: '0 8px 32px rgba(124,58,237,0.35)' },
  teal:    { from: '#0d9488', to: '#0f766e', glow: '0 8px 32px rgba(20,184,166,0.35)' },
};

export function StatsCard({
  title, value, icon, change, changePositive, className, color = 'default',
}: StatsCardProps) {
  const { from, to, glow } = schemes[color];

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl p-5 group', className)}
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        boxShadow: glow,
      }}
    >
      {/* Decorative bg circles */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-4 top-12 h-12 w-12 rounded-full bg-white/[0.06] pointer-events-none" />
      {/* Diagonal texture */}
      <div className="absolute inset-0 card-texture pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 text-white shadow-sm">
            {icon}
          </div>
          {change && (
            <span className={cn(
              'text-[11px] font-bold px-2.5 py-1 rounded-full',
              changePositive
                ? 'bg-white/20 text-white'
                : 'bg-black/20 text-white/80'
            )}>
              {changePositive ? '↑' : '↓'} {change}
            </span>
          )}
        </div>

        <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-semibold text-white/80 mt-1.5">{title}</p>
      </div>
    </div>
  );
}
