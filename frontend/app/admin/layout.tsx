import { LayoutDashboard, Package, Users } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const adminNav = [
  { href: '/admin',          label: 'Overview',  icon: <LayoutDashboard />, exact: true },
  { href: '/admin/products', label: 'Products',  icon: <Package /> },
  { href: '/admin/users',    label: 'Users',     icon: <Users /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-14 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden md:block">
            <Sidebar items={adminNav} title="Admin" />
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden mt-6 flex gap-2 overflow-x-auto pb-1">
          {adminNav.map((item) => (
            <a key={item.href} href={item.href} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-surface-dark-muted border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
