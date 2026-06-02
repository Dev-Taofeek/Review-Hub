'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Star, Menu, X, ChevronDown, User, LogOut,
  Shield, BookOpen, LayoutDashboard, BarChart2, Plus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isModerator, signOut, loading } = useAuth();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  // Close both menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
    setProfileOpen(false);
  };

  const navLinks = [
    { href: '/products', label: 'Products' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/90 backdrop-blur-md dark:bg-[#080d1a]/95 dark:border-white/8">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-14">

        {/* Logo */}
        <Link
          href={isAuthenticated ? '/dashboard' : '/'}
          className="flex items-center gap-2 font-bold text-gray-900 dark:text-white shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Star className="h-4 w-4 fill-current" />
          </div>
          <span className="text-sm tracking-tight">ReviewHub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
          ) : isAuthenticated && user ? (
            <>
              {/* Add product shortcut */}
              <Link href="/products/new" className="hidden sm:block">
                <Button variant="outline" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                  Add Product
                </Button>
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {user.username || user.full_name || 'Account'}
                  </span>
                  <ChevronDown className={cn(
                    'hidden sm:block h-4 w-4 text-gray-400 transition-transform duration-200',
                    profileOpen && 'rotate-180'
                  )} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-gray-100 bg-white py-2 shadow-dropdown dark:bg-[#0d1526] dark:border-white/8 animate-scale-in">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.full_name || user.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-2">
                        <RoleBadge role={user.role} />
                      </div>
                    </div>

                    <DropdownItem href="/dashboard"  icon={<BarChart2 />}     onClick={() => setProfileOpen(false)}>Dashboard</DropdownItem>
                    <DropdownItem href="/profile"    icon={<User />}          onClick={() => setProfileOpen(false)}>Profile</DropdownItem>
                    <DropdownItem href="/my-reviews" icon={<BookOpen />}      onClick={() => setProfileOpen(false)}>My Reviews</DropdownItem>
                    {isModerator && (
                      <DropdownItem href="/moderation" icon={<Shield />}     onClick={() => setProfileOpen(false)}>Moderation</DropdownItem>
                    )}
                    {isAdmin && (
                      <DropdownItem href="/admin"   icon={<LayoutDashboard />} onClick={() => setProfileOpen(false)}>Admin Panel</DropdownItem>
                    )}

                    <div className="my-1.5 border-t border-gray-100 dark:border-white/10" />
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg mx-auto"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => router.push('/register')} className="hidden sm:inline-flex">
                Get started
              </Button>
            </div>
          )}

          {/* Theme toggle — desktop only (mobile version is in the drawer) */}
          <ThemeToggle className="hidden md:flex" />

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-white/8 bg-white dark:bg-[#0d1526] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <>
              <Link href="/products/new" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                <Plus className="h-4 w-4" /> Add Product
              </Link>
              <Link href="/dashboard"  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                <BarChart2 className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/my-reviews" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                <BookOpen className="h-4 w-4" /> My Reviews
              </Link>
              {isModerator && (
                <Link href="/moderation" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                  <Shield className="h-4 w-4" /> Moderation
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5">
                  <LayoutDashboard className="h-4 w-4" /> Admin Panel
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button size="sm" className="w-full">Get started</Button>
              </Link>
            </div>
          )}

          {/* Theme toggle row — mobile only */}
          <div className="flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Appearance</span>
            </div>
            <ThemeToggle />
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
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5 transition-colors [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400"
    >
      {icon}
      {children}
    </Link>
  );
}
