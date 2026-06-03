'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Star, Menu, X, ChevronDown, User, LogOut,
  Shield, BookOpen, LayoutDashboard, BarChart2, Plus,
  Sparkles, Layers, Package,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ── Shared mobile link style ── */
const mobileLink = (active: boolean) => cn(
  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
  active
    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
);

const mobileIcon = (active: boolean) => cn(
  'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 [&>svg]:h-4 [&>svg]:w-4 transition-colors',
  active
    ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400'
    : 'bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400'
);

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isModerator, signOut, loading } = useAuth();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const closeAll = () => { setMobileOpen(false); setProfileOpen(false); };

  const handleSignOut = async () => {
    closeAll();
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  /* Desktop nav links */
  const navLinks = [
    { href: '/products',   label: 'Products' },
    { href: '/categories', label: 'Categories' },
  ];

  /* All mobile nav links with icons — single source of truth, no duplicates */
  const browseLinks = [
    { href: '/products',   label: 'Products',   icon: <Package /> },
    { href: '/categories', label: 'Categories', icon: <Layers /> },
  ];
  const accountLinks = [
    { href: '/dashboard',    label: 'Dashboard',   icon: <BarChart2 /> },
    { href: '/my-reviews',   label: 'My Reviews',  icon: <BookOpen /> },
    { href: '/products/new', label: 'Add Product', icon: <Plus /> },
    { href: '/profile',      label: 'Profile',     icon: <User /> },
    ...(isModerator ? [{ href: '/moderation', label: 'Moderation', icon: <Shield /> }] : []),
    ...(isAdmin     ? [{ href: '/admin',       label: 'Admin Panel', icon: <LayoutDashboard /> }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 backdrop-blur-xl dark:bg-[#060c1a]/95 dark:border-white/[0.06] shadow-sm shadow-slate-900/5 dark:shadow-black/20">
      <div className="mx-auto flex h-[60px] max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-18">

        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} onClick={closeAll}
          className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 group-hover:shadow-brand-600/50 transition-shadow duration-300">
            <Star className="h-4.5 w-4.5 fill-current" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">ReviewHub</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-400">Verified Reviews</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                pathname.startsWith(link.href)
                  ? 'text-brand-700 dark:text-brand-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              )}
            >
              {pathname.startsWith(link.href) && (
                <span className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-950/40 ring-1 ring-brand-200/60 dark:ring-brand-800/30" />
              )}
              <span className="relative">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          ) : isAuthenticated && user ? (
            <>
              <Link href="/products/new" className="hidden sm:block" onClick={closeAll}>
                <Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}
                  className="border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors">
                  Add Product
                </Button>
              </Link>

              {/* Profile dropdown — desktop */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-all duration-200',
                    profileOpen ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-100 dark:hover:bg-white/8'
                  )}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#060c1a] ring-1 ring-emerald-400/50" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[96px] truncate">
                    {user.username || user.full_name || 'Account'}
                  </span>
                  <ChevronDown className={cn(
                    'hidden sm:block h-3.5 w-3.5 text-slate-400 transition-transform duration-200',
                    profileOpen && 'rotate-180'
                  )} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2.5 z-50 w-60 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] py-2 shadow-xl shadow-slate-900/15 dark:shadow-black/40 animate-scale-in overflow-hidden">
                    <div className="relative px-4 py-3.5 mb-1 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent dark:from-brand-950/30 dark:to-transparent" />
                      <div className="relative">
                        <div className="flex items-center gap-2.5 mb-2">
                          <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                              {user.full_name || user.username}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <RoleBadge role={user.role} />
                      </div>
                    </div>
                    <div className="px-2 pb-1">
                      <DropdownItem href="/dashboard"  icon={<BarChart2 />}       onClick={closeAll}>Dashboard</DropdownItem>
                      <DropdownItem href="/profile"    icon={<User />}            onClick={closeAll}>Profile</DropdownItem>
                      <DropdownItem href="/my-reviews" icon={<BookOpen />}        onClick={closeAll}>My Reviews</DropdownItem>
                      {isModerator && <DropdownItem href="/moderation" icon={<Shield />} onClick={closeAll}>Moderation</DropdownItem>}
                      {isAdmin     && <DropdownItem href="/admin" icon={<LayoutDashboard />} onClick={closeAll}>Admin Panel</DropdownItem>}
                    </div>
                    <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-white/[0.06]" />
                    <div className="px-2 pb-1">
                      <button onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
                          <LogOut className="h-3.5 w-3.5 text-red-500" />
                        </span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => { closeAll(); router.push('/login'); }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Sign in
              </Button>
              <Button size="sm" onClick={() => { closeAll(); router.push('/register'); }}
                className="hidden sm:inline-flex bg-gradient-to-br from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 shadow-md shadow-brand-600/20">
                Get started
              </Button>
            </div>
          )}

          <ThemeToggle className="hidden md:flex" />

          <button
            className={cn(
              'md:hidden p-2 rounded-xl transition-all duration-200',
              mobileOpen
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile nav drawer ───────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0c1526] animate-slide-down">

          {/* User info strip — authenticated only */}
          {isAuthenticated && user && (
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-3">
              <div className="relative">
                <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1526]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.full_name || user.username}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
          )}

          <div className="px-3 py-3 space-y-4">

            {/* ── Browse section ── */}
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                Discover
              </p>
              <div className="space-y-0.5">
                {browseLinks.map((link) => {
                  const active = pathname.startsWith(link.href);
                  return (
                    <Link key={link.href} href={link.href} onClick={closeAll} className={mobileLink(active)}>
                      <span className={mobileIcon(active)}>{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Account section — authenticated ── */}
            {isAuthenticated ? (
              <div>
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  My Account
                </p>
                <div className="space-y-0.5">
                  {accountLinks.map((link) => {
                    const active = pathname === link.href || pathname.startsWith(link.href + '/');
                    return (
                      <Link key={link.href} href={link.href} onClick={closeAll} className={mobileLink(active)}>
                        <span className={mobileIcon(active)}>{link.icon}</span>
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Sign out */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                  <button onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 shrink-0">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </span>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              /* ── Auth buttons — unauthenticated ── */
              <div className="flex gap-2 pt-1">
                <Link href="/login" onClick={closeAll} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                </Link>
                <Link href="/register" onClick={closeAll} className="flex-1">
                  <Button size="sm" className="w-full bg-gradient-to-r from-brand-600 to-brand-700">Get started</Button>
                </Link>
              </div>
            )}

            {/* ── Appearance ── */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Appearance</span>
              </div>
              <ThemeToggle />
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

function DropdownItem({
  href, icon, children, onClick,
}: {
  href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors group">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      {children}
    </Link>
  );
}
