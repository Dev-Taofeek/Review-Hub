'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Star, Menu, X, ChevronDown, User, LogOut,
  Shield, BookOpen, LayoutDashboard, BarChart2, Plus,
  Package, Layers,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { dropdownVariants } from '@/lib/animations';

const NAV_LINKS = [
  { href: '/products',   label: 'Products',   icon: <Package className="h-3.5 w-3.5" /> },
  { href: '/categories', label: 'Categories', icon: <Layers  className="h-3.5 w-3.5" /> },
];

const MOBILE_BROWSE = [
  { href: '/products',   label: 'Products',   icon: <Package /> },
  { href: '/categories', label: 'Categories', icon: <Layers  /> },
];

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isModerator, signOut, loading } = useAuth();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const dropRef  = useRef<HTMLDivElement>(null);
  const reduced  = useReducedMotion();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 28);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [profileOpen]);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);

  const closeAll = () => { setMobileOpen(false); setProfileOpen(false); };

  const handleSignOut = async () => {
    closeAll();
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  const mobileAccountLinks = [
    { href: '/dashboard',    label: 'Dashboard',   icon: <BarChart2 /> },
    { href: '/my-reviews',   label: 'My Reviews',  icon: <BookOpen /> },
    { href: '/products/new', label: 'Add Product', icon: <Plus /> },
    { href: '/profile',      label: 'Profile',     icon: <User /> },
    ...(isModerator ? [{ href: '/moderation', label: 'Moderation', icon: <Shield /> }] : []),
    ...(isAdmin     ? [{ href: '/admin',       label: 'Admin',      icon: <LayoutDashboard /> }] : []),
  ];

  return (
    <header className={cn(
      'sticky top-0 z-40 backdrop-blur-xl transition-all duration-300',
      scrolled
        ? 'bg-[var(--surface)]/98 shadow-md shadow-emerald-900/10 border-b border-[var(--border)]'
        : 'bg-[var(--surface)]/94 border-b border-[var(--border)] shadow-none',
    )}>
      <div className={cn(
        'mx-auto flex max-w-[1600px] items-center justify-between px-4 xs:px-5 sm:px-8 lg:px-20 transition-all duration-300',
        scrolled ? 'h-[44px]' : 'h-[48px]'
      )}>

        {/* ── Logo ─────────────────────────────────── */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} onClick={closeAll}
          className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            whileHover={reduced ? {} : { scale: 1.05, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="h-8 w-8 rounded-xl flex items-center justify-center shadow-md shadow-brand-700/20 dark:shadow-[0_0_16px_rgba(0,229,160,0.25)]"
            style={{ background: 'var(--signal)' }}
          >
            <Star className="h-4 w-4 fill-black text-black" aria-hidden="true" />
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-black tracking-[-0.03em] text-[var(--foreground)]">ReviewHub</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--signal)', opacity: 0.8 }}>
              Verified Reviews
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ──────────────────────────── */}
        <nav className="hidden md:flex items-center gap-0.5" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200',
                  active
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                  />
                )}
                <span className="relative" aria-hidden="true">{link.icon}</span>
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Right ────────────────────────────────── */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--surface-soft)]" />
          ) : isAuthenticated && user ? (
            <>
              {/* Add product — desktop */}
              <Link href="/products/new" onClick={closeAll} className="hidden sm:flex">
                <motion.button
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all bg-brand-50 dark:bg-[rgba(0,229,160,0.1)] border border-brand-200 dark:border-[rgba(0,229,160,0.2)] text-brand-700 dark:text-[#00E5A0]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </motion.button>
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropRef}>
                <motion.button
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all',
                    profileOpen
                      ? 'bg-[var(--surface-soft)]'
                      : 'hover:bg-[var(--surface-soft)]'
                  )}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Open profile menu"
                >
                  <div className="relative">
                    <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)]"
                      style={{ background: 'var(--signal)' }} />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-[var(--foreground)] max-w-[80px] truncate">
                    {user.username || user.full_name || 'Account'}
                  </span>
                  <motion.span animate={reduced ? {} : { rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-[var(--muted)]" />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      variants={reduced ? {} : dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className="absolute right-0 top-full mt-2.5 z-50 w-60 rounded-2xl py-2 overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-xl shadow-emerald-900/10"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 mb-1 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2.5 mb-2">
                          <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[var(--foreground)] truncate leading-tight">
                              {user.full_name || user.username}
                            </p>
                            <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                          </div>
                        </div>
                        <RoleBadge role={user.role} />
                      </div>

                      <div className="px-2 pb-1">
                        <DropItem href="/dashboard"  icon={<BarChart2 />}       label="Dashboard"   onClick={closeAll} />
                        <DropItem href="/profile"    icon={<User />}            label="Profile"     onClick={closeAll} />
                        <DropItem href="/my-reviews" icon={<BookOpen />}        label="My Reviews"  onClick={closeAll} />
                        {isModerator && <DropItem href="/moderation" icon={<Shield />}          label="Moderation"  onClick={closeAll} />}
                        {isAdmin     && <DropItem href="/admin"      icon={<LayoutDashboard />} label="Admin Panel" onClick={closeAll} />}
                      </div>

                      <div className="mx-3 my-1 h-px bg-[var(--border)]" />

                      <div className="px-2 pb-1">
                        <button onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl text-red-600 dark:text-[#FF6B6B] hover:bg-red-50 dark:hover:bg-[rgba(255,107,107,0.08)] transition-all">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-[rgba(255,107,107,0.1)]">
                            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { closeAll(); router.push('/login'); }}
                className="h-8 px-3.5 rounded-xl text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                Sign in
              </button>
              <motion.button
                whileHover={reduced ? {} : { scale: 1.02 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                onClick={() => { closeAll(); router.push('/register'); }}
                className="hidden sm:flex items-center justify-center h-8 px-3.5 rounded-xl text-sm font-bold text-black transition-all shadow-md shadow-brand-600/20"
                style={{ background: 'var(--signal)' }}
              >
                Get started
              </motion.button>
            </div>
          )}

          <ThemeToggle className="hidden md:flex" />

          {/* Mobile toggle */}
          <motion.button
            whileTap={reduced ? {} : { scale: 0.93 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'md:hidden h-9 w-9 rounded-xl flex items-center justify-center transition-all',
              mobileOpen
                ? 'bg-[var(--surface-soft)] text-[var(--foreground)]'
                : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]'
            )}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen
                ? <motion.div key="x"  initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.15 }}><X    className="h-4 w-4" /></motion.div>
                : <motion.div key="mb" initial={{ rotate:90,  opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90,opacity:0 }} transition={{ duration:0.15 }}><Menu className="h-4 w-4" /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── Mobile drawer ─────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: -8 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[var(--surface)] border-t border-[var(--border)]"
          >
            {/* User strip */}
            {isAuthenticated && user && (
              <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--border)]">
                <div className="relative">
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)]"
                    style={{ background: 'var(--signal)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--foreground)] truncate">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
            )}

            <div className="px-3 py-3 space-y-4">
              {/* Browse */}
              <div>
                <p className="text-label-mono text-[var(--muted)] px-3 mb-2">Discover</p>
                <div className="space-y-0.5">
                  {MOBILE_BROWSE.map(link => {
                    const active = pathname.startsWith(link.href);
                    return (
                      <Link key={link.href} href={link.href} onClick={closeAll}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                          active
                            ? 'bg-brand-50 dark:bg-[rgba(0,229,160,0.08)] text-brand-700 dark:text-[#00E5A0] border border-brand-200/60 dark:border-[rgba(0,229,160,0.15)]'
                            : 'text-[var(--muted)] hover:bg-[var(--surface-soft)]'
                        )}>
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4',
                          active
                            ? 'bg-brand-100 dark:bg-[rgba(0,229,160,0.12)] text-brand-600 dark:text-[#00E5A0]'
                            : 'bg-[var(--surface-soft)] text-[var(--muted)]'
                        )}>
                          {link.icon}
                        </span>
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account */}
              {isAuthenticated ? (
                <div>
                  <p className="text-label-mono text-[var(--muted)] px-3 mb-2">Account</p>
                  <div className="space-y-0.5">
                    {mobileAccountLinks.map(link => {
                      const active = pathname === link.href || pathname.startsWith(link.href + '/');
                      return (
                        <Link key={link.href} href={link.href} onClick={closeAll}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                            active
                              ? 'text-brand-700 dark:text-[#00E5A0]'
                              : 'text-[var(--muted)] hover:bg-[var(--surface-soft)]'
                          )}>
                          <span className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4',
                            active
                              ? 'bg-brand-100 dark:bg-[rgba(0,229,160,0.12)] text-brand-600 dark:text-[#00E5A0]'
                              : 'bg-[var(--surface-soft)] text-[var(--muted)]'
                          )}>
                            {link.icon}
                          </span>
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[var(--border)]">
                    <button onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-[#FF6B6B] hover:bg-red-50 dark:hover:bg-[rgba(255,107,107,0.08)] transition-all">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-[rgba(255,107,107,0.1)]">
                        <LogOut className="h-4 w-4" />
                      </span>
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={closeAll} className="flex-1">
                    <button className="w-full h-10 rounded-xl text-sm font-bold text-[var(--foreground)] bg-[var(--surface-soft)] border border-[var(--border)] transition-all">
                      Sign in
                    </button>
                  </Link>
                  <Link href="/register" onClick={closeAll} className="flex-1">
                    <button className="w-full h-10 flex items-center justify-center rounded-xl text-sm font-bold text-black shadow-md shadow-brand-600/20"
                      style={{ background: 'var(--signal)' }}>
                      Get started
                    </button>
                  </Link>
                </div>
              )}

              {/* Appearance */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--muted)]">Appearance</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] group">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5 bg-[var(--surface-soft)] text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}
