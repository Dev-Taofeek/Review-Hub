'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
import { dropdownVariants, drawerVariants, staggerContainer, staggerItem } from '@/lib/animations';
import toast from 'react-hot-toast';

const mobileLink = (active: boolean) => cn(
  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
  active
    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
    : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/[0.06]'
);

const mobileIcon = (active: boolean) => cn(
  'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 [&>svg]:h-4 [&>svg]:w-4 transition-colors',
  active
    ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400'
    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400'
);

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isModerator, signOut, loading } = useAuth();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname   = usePathname();
  const router     = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reduced    = useReducedMotion();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [pathname]);

  const closeAll = () => { setMobileOpen(false); setProfileOpen(false); };

  const handleSignOut = async () => {
    closeAll();
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  const navLinks = [
    { href: '/products',   label: 'Products' },
    { href: '/categories', label: 'Categories' },
  ];

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
      <div className="mx-auto flex h-[60px] max-w-[1600px] items-center justify-between px-3 xs:px-4 sm:px-6 lg:px-18">

        {/* Logo */}
        <Link href={isAuthenticated ? '/dashboard' : '/'} onClick={closeAll}
          className="flex items-center gap-2.5 shrink-0 group">
          <motion.div
            whileHover={reduced ? {} : { scale: 1.05, rotate: -5 }}
            whileTap={reduced ? {} : { scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30"
          >
            <Star className="h-4 w-4 fill-current" aria-hidden="true" />
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-black tracking-tight text-slate-900 dark:text-white">ReviewHub</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-brand-600 dark:text-brand-400">Verified Reviews</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-200',
                  active
                    ? 'text-brand-700 dark:text-brand-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-950/40 ring-1 ring-brand-200/60 dark:ring-brand-800/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          ) : isAuthenticated && user ? (
            <>
              <Link href="/products/new" className="hidden sm:block" onClick={closeAll}>
                <motion.div whileHover={reduced ? {} : { scale: 1.02 }} whileTap={reduced ? {} : { scale: 0.97 }}>
                  <Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}
                    className="border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/30 font-semibold">
                    Add Product
                  </Button>
                </motion.div>
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-label="Open account menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  whileHover={reduced ? {} : { scale: 1.01 }}
                  whileTap={reduced ? {} : { scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors',
                    profileOpen ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-100 dark:hover:bg-white/8'
                  )}
                >
                  <div className="relative">
                    <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#060c1a]" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[96px] truncate">
                    {user.username || user.full_name || 'Account'}
                  </span>
                  <motion.div
                    animate={reduced ? {} : { rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden sm:block"
                  >
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      variants={reduced ? {} : dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      role="menu"
                      className="absolute right-0 top-full mt-2.5 z-50 w-60 rounded-2xl border border-slate-100 dark:border-white/[0.07] bg-white dark:bg-[#0c1526] py-2 shadow-2xl shadow-slate-900/15 dark:shadow-black/40 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="relative px-4 py-3.5 mb-1 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-transparent dark:from-brand-950/30 dark:to-transparent" />
                        <div className="relative flex items-center gap-2.5 mb-2">
                          <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.full_name || user.username}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <RoleBadge role={user.role} />
                      </div>
                      <div className="px-2 pb-1">
                        {[
                          { href: '/dashboard',  icon: <BarChart2 />,      label: 'Dashboard' },
                          { href: '/profile',    icon: <User />,           label: 'Profile' },
                          { href: '/my-reviews', icon: <BookOpen />,       label: 'My Reviews' },
                          ...(isModerator ? [{ href: '/moderation', icon: <Shield />,         label: 'Moderation' }] : []),
                          ...(isAdmin     ? [{ href: '/admin',      icon: <LayoutDashboard />, label: 'Admin Panel' }] : []),
                        ].map((item) => (
                          <DropdownItem key={item.href} href={item.href} icon={item.icon} onClick={closeAll}>
                            {item.label}
                          </DropdownItem>
                        ))}
                      </div>
                      <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-white/[0.06]" />
                      <div className="px-2 pb-1">
                        <button onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
                            <LogOut className="h-3.5 w-3.5 text-red-500" />
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
              <Button variant="ghost" size="sm" onClick={() => { closeAll(); router.push('/login'); }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold">
                Sign in
              </Button>
              <motion.div whileHover={reduced ? {} : { scale: 1.03 }} whileTap={reduced ? {} : { scale: 0.97 }} className="hidden sm:block">
                <Button size="sm" onClick={() => { closeAll(); router.push('/register'); }}
                  className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-md shadow-brand-600/25 font-semibold">
                  Get started
                </Button>
              </motion.div>
            </div>
          )}

          <ThemeToggle className="hidden md:flex" />

          <motion.button
            whileTap={reduced ? {} : { scale: 0.92 }}
            className={cn(
              'md:hidden p-2 rounded-xl transition-colors',
              mobileOpen ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={reduced ? {} : drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden border-t border-slate-100 dark:border-white/[0.06] bg-white dark:bg-[#0c1526]"
          >
            {isAuthenticated && user && (
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-3">
                <div className="relative">
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1526]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.full_name || user.username}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
            )}

            <motion.div
              variants={reduced ? {} : { visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              initial="hidden"
              animate="visible"
              className="px-3 py-3 space-y-4"
            >
              <div>
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Discover</p>
                <div className="space-y-0.5">
                  {browseLinks.map((link) => {
                    const active = pathname.startsWith(link.href);
                    return (
                      <motion.div key={link.href} variants={reduced ? {} : staggerItem}>
                        <Link href={link.href} onClick={closeAll} className={mobileLink(active)}>
                          <span className={mobileIcon(active)}>{link.icon}</span>
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {isAuthenticated ? (
                <div>
                  <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">My Account</p>
                  <div className="space-y-0.5">
                    {accountLinks.map((link) => {
                      const active = pathname === link.href || pathname.startsWith(link.href + '/');
                      return (
                        <motion.div key={link.href} variants={reduced ? {} : staggerItem}>
                          <Link href={link.href} onClick={closeAll} className={mobileLink(active)}>
                            <span className={mobileIcon(active)}>{link.icon}</span>
                            {link.label}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                    <motion.div variants={reduced ? {} : staggerItem}>
                      <button onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 shrink-0">
                          <LogOut className="h-4 w-4 text-red-500" />
                        </span>
                        Sign out
                      </button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <motion.div variants={reduced ? {} : staggerItem} className="flex gap-2 pt-1">
                  <Link href="/login" onClick={closeAll} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full font-semibold">Sign in</Button>
                  </Link>
                  <Link href="/register" onClick={closeAll} className="flex-1">
                    <Button size="sm" className="w-full font-semibold bg-gradient-to-r from-brand-600 to-brand-700">Get started</Button>
                  </Link>
                </motion.div>
              )}

              <motion.div variants={reduced ? {} : staggerItem}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Appearance</span>
                </div>
                <ThemeToggle />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropdownItem({ href, icon, children, onClick }: {
  href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div whileHover={reduced ? {} : { x: 2 }} transition={{ duration: 0.15 }}>
      <Link href={href} onClick={onClick} role="menuitem"
        className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors group">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/40 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
        {children}
      </Link>
    </motion.div>
  );
}
