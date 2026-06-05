'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Star, Menu, X, ChevronDown, User, LogOut,
  Shield, BookOpen, LayoutDashboard, BarChart2, Plus,
  Package, Layers, Search,
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
  const pathname  = usePathname();
  const router    = useRouter();
  const dropRef   = useRef<HTMLDivElement>(null);
  const reduced   = useReducedMotion();

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
    <header className="sticky top-0 z-40"
      style={{
        background: 'rgba(6,8,15,0.92)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="mx-auto flex h-[58px] max-w-[1600px] items-center justify-between px-4 xs:px-5 sm:px-8 lg:px-20">

        {/* ── Logo ─────────────────────────────────── */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} onClick={closeAll}
          className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            whileHover={reduced ? {} : { scale: 1.05, rotate: -3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--signal)',
              boxShadow: '0 0 0 1px rgba(0,229,160,0.4), 0 0 16px rgba(0,229,160,0.25)',
            }}
          >
            <Star className="h-4 w-4 fill-black text-black" aria-hidden="true" />
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-black tracking-[-0.03em] text-white">ReviewHub</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(0,229,160,0.6)' }}>
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
                    ? 'text-white'
                    : 'hover:text-white transition-colors'
                )}
                style={{ color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
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
            <div className="h-8 w-8 animate-pulse rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
          ) : isAuthenticated && user ? (
            <>
              {/* Add product — desktop */}
              <Link href="/products/new" onClick={closeAll} className="hidden sm:flex">
                <motion.button
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: 'var(--signal)' }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </motion.button>
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropRef}>
                <motion.button
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all"
                  style={{ background: profileOpen ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Open profile menu"
                >
                  <div className="relative">
                    <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                      style={{ background: 'var(--signal)', borderColor: '#06080F', boxShadow: '0 0 6px rgba(0,229,160,0.5)' }} />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-white max-w-[80px] truncate">
                    {user.username || user.full_name || 'Account'}
                  </span>
                  <motion.span animate={reduced ? {} : { rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="hidden sm:block h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </motion.span>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      variants={reduced ? {} : dropdownVariants}
                      initial="hidden" animate="visible" exit="exit"
                      className="absolute right-0 top-full mt-2.5 z-50 w-60 rounded-2xl py-2 overflow-hidden"
                      style={{
                        background: '#131520',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.03) inset, 0 24px 56px rgba(0,0,0,0.6)',
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2.5 mb-2">
                          <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate leading-tight">{user.full_name || user.username}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-2)' }}>{user.email}</p>
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

                      <div className="mx-3 my-1" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                      <div className="px-2 pb-1">
                        <button onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all group"
                          style={{ color: '#FF6B6B' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{ background: 'rgba(255,107,107,0.1)' }}>
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
                className="h-8 px-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                Sign in
              </button>
              <motion.button
                whileHover={reduced ? {} : { scale: 1.02 }}
                whileTap={reduced ? {} : { scale: 0.97 }}
                onClick={() => { closeAll(); router.push('/register'); }}
                className="hidden sm:flex h-8 px-3.5 rounded-xl text-sm font-bold text-black transition-all"
                style={{ background: 'var(--signal)', boxShadow: '0 0 0 1px rgba(0,229,160,0.4), 0 0 16px rgba(0,229,160,0.2)' }}
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
            className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center transition-all"
            style={{ background: mobileOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', color: '#fff' }}
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
            className="md:hidden"
            style={{ background: '#0D1020', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* User strip */}
            {isAuthenticated && user && (
              <div className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="relative">
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                    style={{ background: 'var(--signal)', borderColor: '#0D1020' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{user.full_name || user.username}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
            )}

            <div className="px-3 py-3 space-y-4">
              {/* Browse */}
              <div>
                <p className="text-label-mono px-3 mb-2" style={{ color: 'var(--text-3)' }}>Discover</p>
                <div className="space-y-0.5">
                  {MOBILE_BROWSE.map(link => {
                    const active = pathname.startsWith(link.href);
                    return (
                      <Link key={link.href} href={link.href} onClick={closeAll}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: active ? 'rgba(0,229,160,0.08)' : 'transparent',
                          color: active ? 'var(--signal)' : 'rgba(255,255,255,0.6)',
                          border: active ? '1px solid rgba(0,229,160,0.15)' : '1px solid transparent',
                        }}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4"
                          style={{ background: active ? 'rgba(0,229,160,0.12)' : 'rgba(255,255,255,0.06)', color: active ? 'var(--signal)' : 'rgba(255,255,255,0.4)' }}>
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
                  <p className="text-label-mono px-3 mb-2" style={{ color: 'var(--text-3)' }}>Account</p>
                  <div className="space-y-0.5">
                    {mobileAccountLinks.map(link => {
                      const active = pathname === link.href || pathname.startsWith(link.href + '/');
                      return (
                        <Link key={link.href} href={link.href} onClick={closeAll}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                          style={{ color: active ? 'var(--signal)' : 'rgba(255,255,255,0.55)' }}>
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-4 [&>svg]:w-4"
                            style={{ background: active ? 'rgba(0,229,160,0.12)' : 'rgba(255,255,255,0.06)', color: active ? 'var(--signal)' : 'rgba(255,255,255,0.35)' }}>
                            {link.icon}
                          </span>
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ color: '#FF6B6B' }}>
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'rgba(255,107,107,0.1)' }}>
                        <LogOut className="h-4 w-4" />
                      </span>
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={closeAll} className="flex-1">
                    <button className="w-full h-10 rounded-xl text-sm font-bold transition-all"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                      Sign in
                    </button>
                  </Link>
                  <Link href="/register" onClick={closeAll} className="flex-1">
                    <button className="w-full h-10 rounded-xl text-sm font-bold text-black"
                      style={{ background: 'var(--signal)', boxShadow: '0 0 12px rgba(0,229,160,0.2)' }}>
                      Get started
                    </button>
                  </Link>
                </div>
              )}

              {/* Appearance */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-sm font-medium text-white/50">Appearance</span>
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
      className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all group"
      style={{ color: 'rgba(255,255,255,0.65)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5"
        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
        {icon}
      </span>
      {label}
    </Link>
  );
}
