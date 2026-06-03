import Link from 'next/link';
import { Shield, MessageSquare, Flag, Activity } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

const moderationNav = [
  { href: '/moderation',         label: 'Overview', icon: <Activity />,      exact: true },
  { href: '/moderation/reviews', label: 'Reviews',  icon: <MessageSquare /> },
  { href: '/moderation/reports', label: 'Reports',  icon: <Flag /> },
];

export default function ModerationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060c1a]">

      {/* Moderation mode indicator */}
      <div className="border-b border-violet-900/40 dark:border-violet-800/30"
        style={{ background: 'linear-gradient(90deg, #0d0a1a 0%, #120e22 50%, #0d0a1a 100%)' }}>
        <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 h-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse shadow-sm shadow-violet-400/50" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-400/90">Moderation Mode</span>
            </span>
            <span className="text-violet-900/60 text-xs select-none">|</span>
            <span className="text-[11px] text-violet-600/50 font-medium hidden sm:block">
              Community content moderation
            </span>
          </div>
          <Link href="/dashboard"
            className="text-[11px] font-medium text-violet-600/50 hover:text-violet-400 transition-colors">
            ← Exit moderation
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-3 xs:px-4 sm:px-6 lg:px-18 py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-10">

          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-[92px]">
              <div className="flex items-center gap-2 mb-4 px-3">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm shadow-violet-900/30">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Moderation</span>
              </div>
              <Sidebar items={moderationNav} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden mt-6 flex gap-2 overflow-x-auto pb-2">
          {moderationNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0c1526] border border-slate-200 dark:border-white/[0.07] text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-700 dark:hover:text-violet-300 transition-all shrink-0 shadow-sm"
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
