'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex h-8 w-[3.25rem] items-center rounded-full border transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        isDark
          ? 'bg-[#0d1e3d] border-[#1e3a5f]'
          : 'bg-gray-100 border-gray-200',
        className
      )}
    >
      {/* Sun icon — left side */}
      <Sun className={cn(
        'absolute left-1.5 h-3.5 w-3.5 transition-all duration-300',
        isDark ? 'opacity-25 text-slate-500 scale-90' : 'opacity-100 text-amber-500 scale-100'
      )} />

      {/* Moon icon — right side */}
      <Moon className={cn(
        'absolute right-1.5 h-3.5 w-3.5 transition-all duration-300',
        isDark ? 'opacity-100 text-blue-400 scale-100' : 'opacity-25 text-gray-400 scale-90'
      )} />

      {/* Sliding thumb */}
      <span className={cn(
        'absolute h-6 w-6 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center',
        isDark
          ? 'translate-x-[1.5rem] bg-[#1e3a5f] border border-[#2d5a8e]'
          : 'translate-x-0.5 bg-white border border-gray-200 shadow-xs'
      )}>
        {isDark
          ? <Moon className="h-3 w-3 text-blue-300" />
          : <Sun className="h-3 w-3 text-amber-500" />
        }
      </span>
    </button>
  );
}
