import Link from 'next/link';
import { LayoutDashboard, Package, Shield, Users } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard />, exact: true },
  { href: '/admin/products', label: 'Products', icon: <Package /> },
  { href: '/admin/users', label: 'Users', icon: <Users /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="trust-shell min-h-screen">
      <div className="border-b border-emerald-300/15 bg-[#06251D]">
        <div className="mx-auto flex h-8 max-w-[1600px] items-center justify-between px-3 xs:px-4 sm:px-6 lg:px-18">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300  shadow-emerald-300/50" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300">Admin Mode</span>
            </span>
            <span className="text-xs text-amber-300/40">|</span>
            <span className="hidden text-[11px] font-medium text-[#C8BFAE] sm:block">Full platform access enabled</span>
          </div>
          <Link href="/dashboard" className="text-[11px] font-medium text-[#C8BFAE] transition-colors hover:text-emerald-300">
            Exit admin
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-3 py-6 xs:px-4 sm:px-6 sm:py-8 lg:px-18">
        <div className="flex gap-6 lg:gap-10">
          <div className="hidden md:block">
            <div className="sticky top-[92px]">
              <div className="mb-4 flex items-center gap-2 px-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]  shadow-emerald-900/20">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-[var(--foreground)]">Admin Panel</span>
              </div>
              <Sidebar items={adminNav} />
            </div>
          </div>

          <div className="min-w-0 flex-1">{children}</div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
          {adminNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)]  transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <span className="[&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
