import Link from 'next/link';
import { LayoutDashboard, Package, Users, Shield } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const adminNav = [
  { href: '/admin',          label: 'Overview',  icon: <LayoutDashboard />, exact: true },
  { href: '/admin/products', label: 'Products',  icon: <Package /> },
  { href: '/admin/users',    label: 'Users',     icon: <Users /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060c1a]">

      {/* ── Admin mode indicator strip ─────────────────── */}
      <div className="border-b border-brand-900/40 dark:border-brand-800/30"
        style={{ background: 'linear-gradient(90deg, #020d0a 0%, #031a10 50%, #020d0a 100%)' }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-18 h-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse shadow-sm shadow-brand-400/50" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-400/90">Admin Mode</span>
            </span>
            <span className="text-brand-900/60 dark:text-brand-800/60 text-xs select-none">|</span>
            <span className="text-[11px] text-brand-600/60 dark:text-brand-700/60 font-medium hidden sm:block">
              Full platform access enabled
            </span>
          </div>
          <Link href="/dashboard"
            className="text-[11px] font-medium text-brand-600/60 dark:text-brand-700/60 hover:text-brand-400 transition-colors">
            ← Exit admin
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-18 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-10">

          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-[92px]">
              {/* Sidebar header */}
              <div className="flex items-center gap-2 mb-4 px-3">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm shadow-brand-900/30">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Admin Panel</span>
              </div>
              <Sidebar items={adminNav} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>

        {/* Mobile tab nav */}
        <div className="md:hidden mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {adminNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0c1526] border border-slate-200 dark:border-white/[0.07] text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 transition-all shrink-0 shadow-sm"
            >
              <span className="[&>svg]:h-4 [&>svg]:w-4 text-slate-400">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
