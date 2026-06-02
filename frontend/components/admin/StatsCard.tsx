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

const schemes = {
  default: 'from-gray-700 to-gray-800',
  blue:    'from-blue-600 to-indigo-600',
  emerald: 'from-emerald-600 to-teal-600',
  amber:   'from-amber-500 to-orange-500',
  red:     'from-red-500 to-rose-600',
  purple:  'from-violet-600 to-purple-700',
  teal:    'from-teal-500 to-cyan-600',
};

const glows = {
  default: '',
  blue:    'shadow-[0_4px_20px_rgba(59,130,246,0.35)]',
  emerald: 'shadow-[0_4px_20px_rgba(5,150,105,0.35)]',
  amber:   'shadow-[0_4px_20px_rgba(245,158,11,0.35)]',
  red:     'shadow-[0_4px_20px_rgba(239,68,68,0.35)]',
  purple:  'shadow-[0_4px_20px_rgba(139,92,246,0.35)]',
  teal:    'shadow-[0_4px_20px_rgba(20,184,166,0.35)]',
};

export function StatsCard({
  title, value, icon, change, changePositive, className, color = 'default',
}: StatsCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-5',
      `bg-gradient-to-br ${schemes[color]}`,
      glows[color],
      className
    )}>
      {/* Decorative circles */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-4 top-10 h-10 w-10 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5 text-white">
            {icon}
          </div>
          {change && (
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              changePositive ? 'bg-white/20 text-white' : 'bg-red-900/40 text-red-200'
            )}>
              {changePositive ? '↑' : '↓'} {change}
            </span>
          )}
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-white/75 mt-0.5 font-medium">{title}</p>
      </div>
    </div>
  );
}
