'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, LogOut, Menu, Package, Plus, Shield, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
];

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isModerator, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  const accountLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { href: '/my-reviews', label: 'My reviews', icon: <BookOpen /> },
    { href: '/products/new', label: 'Add product', icon: <Plus /> },
    { href: '/profile', label: 'Profile', icon: <User /> },
    ...(isModerator ? [{ href: '/moderation', label: 'Moderation', icon: <Shield /> }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: <Shield /> }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 xs:px-5 sm:px-8 lg:px-20">
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center border border-[var(--primary)] bg-[var(--primary)] text-sm font-black text-white">
            RH
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-[15px] font-black text-[var(--foreground)]">ReviewHub</span>
            <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Product evidence</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'border-b-2 py-4 text-sm font-extrabold transition-colors',
                  active
                    ? 'border-[var(--primary)] text-[var(--foreground)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-8 border border-[var(--border)] bg-[var(--surface-soft)]" />
          ) : isAuthenticated && user ? (
            <>
              <Link
                href="/products/new"
                className="hidden h-9 items-center gap-2 border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm font-extrabold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] sm:flex"
              >
                <Plus className="h-4 w-4" />
                Add product
              </Link>
              <Link href="/profile" className="hidden items-center gap-2 px-2 py-1 sm:flex">
                <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                <span className="max-w-[120px] truncate text-sm font-bold text-[var(--foreground)]">
                  {user.username || user.full_name || 'Account'}
                </span>
              </Link>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="h-9 px-3 text-sm font-extrabold text-[var(--muted)] hover:text-[var(--foreground)]">
                Sign in
              </button>
              <button onClick={() => router.push('/register')} className="hidden h-9 bg-[var(--primary)] px-3 text-sm font-extrabold text-white sm:block">
                Write a review
              </button>
            </>
          )}

          <ThemeToggle className="hidden md:flex" />
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-9 w-9 place-items-center border border-[var(--border)] text-[var(--foreground)] md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] md:hidden">
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4">
              <Avatar src={user.avatar_url} name={user.full_name || user.username} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[var(--foreground)]">{user.full_name || user.username}</p>
                <p className="truncate text-xs text-[var(--muted)]">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
          )}

          <div className="grid gap-1 p-3">
            <MobileLink href="/products" label="Products" icon={<Package />} active={pathname.startsWith('/products')} />
            <MobileLink href="/categories" label="Categories" icon={<BookOpen />} active={pathname.startsWith('/categories')} />
            {isAuthenticated && accountLinks.map((link) => (
              <MobileLink key={link.href} href={link.href} label={link.label} icon={link.icon} active={pathname === link.href || pathname.startsWith(`${link.href}/`)} />
            ))}
            {!isAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3">
                <Link href="/login" className="border border-[var(--border)] px-3 py-2 text-center text-sm font-extrabold text-[var(--foreground)]">Sign in</Link>
                <Link href="/register" className="bg-[var(--primary)] px-3 py-2 text-center text-sm font-extrabold text-white">Write a review</Link>
              </div>
            )}
            {isAuthenticated && (
              <button onClick={handleSignOut} className="mt-2 flex items-center gap-3 border-t border-[var(--border)] px-3 py-3 text-left text-sm font-extrabold text-[var(--danger)]">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            )}
            <div className="mt-2 flex items-center justify-between border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <span className="text-sm font-bold text-[var(--muted)]">Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 border-l-2 px-3 py-3 text-sm font-extrabold',
        active
          ? 'border-[var(--primary)] bg-[var(--surface-soft)] text-[var(--foreground)]'
          : 'border-transparent text-[var(--muted)]'
      )}
    >
      <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      {label}
    </Link>
  );
}
