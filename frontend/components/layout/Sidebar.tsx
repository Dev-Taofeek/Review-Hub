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
    <aside className="w-52 shrink-0">
      {title && (
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {title}
        </p>
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
                'group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/8 dark:hover:text-gray-100'
              )}
            >
              <span className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-all [&>svg]:h-4 [&>svg]:w-4',
                active
                  ? 'bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400'
                  : 'bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-500 group-hover:bg-gray-200 dark:group-hover:bg-white/12'
              )}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
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
