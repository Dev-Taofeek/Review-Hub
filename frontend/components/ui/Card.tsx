import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl trust-card',
        hover && 'trust-card-hover cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-base font-bold text-[var(--foreground)]', className)}>
      {children}
    </h3>
  );
}

export function CardDivider({ className }: { className?: string }) {
  return <hr className={cn('my-4 border-[var(--border)]', className)} />;
}
