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
          <p className="text-label-mono text-[var(--muted)]">
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
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)] '
                  : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]'
              )}
            >
              {/* Left accent bar on active */}
              {active && (
                <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--primary)]" />
              )}

              {/* Icon container */}
              <span className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all duration-200 [&>svg]:h-4 [&>svg]:w-4',
                active
                  ? 'bg-[var(--surface)] text-[var(--primary)] '
                  : 'bg-[var(--surface-soft)] text-[var(--muted)] group-hover:text-[var(--foreground)]'
              )}>
                {item.icon}
              </span>

              <span className="flex-1 truncate">{item.label}</span>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn(
                  'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  active
                    ? 'bg-[var(--primary)] text-white'
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
