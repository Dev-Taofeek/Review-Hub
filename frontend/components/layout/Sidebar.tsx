'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  exact?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0">
      {title && (
        <div className="mb-3 px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {title}
          </p>
        </div>
      )}
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-brand-50 via-brand-50/60 to-transparent text-brand-700 dark:from-brand-950/70 dark:via-brand-950/30 dark:to-transparent dark:text-brand-300 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100'
              )}
            >
              {/* Left accent bar on active */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full bg-gradient-to-b from-brand-400 to-brand-600 dark:from-brand-400 dark:to-brand-600" />
              )}

              {/* Icon container */}
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all duration-200 [&>svg]:h-4 [&>svg]:w-4',
                active
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 shadow-sm shadow-brand-200/50 dark:shadow-brand-900/50'
                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-700 dark:group-hover:text-slate-300'
              )}>
                {item.icon}
              </span>

              <span className="flex-1 truncate">{item.label}</span>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn(
                  'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  active
                    ? 'bg-brand-500 text-white'
                    : 'bg-red-500 text-white'
                )}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
