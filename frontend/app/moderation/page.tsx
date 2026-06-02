'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Clock, Flag, XCircle, MessageSquare,
  AlertTriangle, ArrowRight, Shield,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { moderationApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ModerationStats } from '@/types';

const STAT_CARDS = [
  { key: 'total' as const,          label: 'Total Reviews',   desc: 'All reviews in the system',     icon: <MessageSquare className="h-5 w-5" />, gradient: 'from-blue-600 to-indigo-600',     glow: 'shadow-[0_4px_20px_rgba(59,130,246,0.3)]' },
  { key: 'published' as const,      label: 'Published',       desc: 'Live and visible to shoppers',  icon: <CheckCircle className="h-5 w-5" />,   gradient: 'from-emerald-600 to-teal-600',    glow: 'shadow-[0_4px_20px_rgba(5,150,105,0.3)]' },
  { key: 'pending' as const,        label: 'Pending',         desc: 'Awaiting moderation',           icon: <Clock className="h-5 w-5" />,         gradient: 'from-amber-500 to-orange-500',    glow: 'shadow-[0_4px_20px_rgba(245,158,11,0.3)]' },
  { key: 'flagged' as const,        label: 'Flagged',         desc: 'Marked as suspicious',          icon: <AlertTriangle className="h-5 w-5" />, gradient: 'from-red-500 to-rose-600',        glow: 'shadow-[0_4px_20px_rgba(239,68,68,0.3)]' },
  { key: 'rejected' as const,       label: 'Rejected',        desc: 'Removed from platform',         icon: <XCircle className="h-5 w-5" />,       gradient: 'from-gray-600 to-gray-700',       glow: '' },
  { key: 'pendingReports' as const, label: 'Open Reports',    desc: 'Community reports to action',   icon: <Flag className="h-5 w-5" />,          gradient: 'from-violet-600 to-purple-700',   glow: 'shadow-[0_4px_20px_rgba(139,92,246,0.3)]' },
];

export default function ModerationOverviewPage() {
  const [stats,   setStats]   = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moderationApi.getStats()
      .then((res) => setStats(res.data ?? null))
      .finally(() => setLoading(false));
  }, []);

  const urgent = stats ? stats.pending + stats.flagged + stats.pendingReports : 0;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-800 p-5 sm:p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Moderation Center</h1>
              <p className="text-sm text-gray-400">Review queue and content governance</p>
            </div>
          </div>
          <Link href="/moderation/reviews">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm font-medium text-white hover:bg-white/20 transition-colors">
              Review Queue <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* Urgent alert */}
      {!loading && urgent > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {urgent} item{urgent !== 1 ? 's' : ''} need your attention
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              {[
                stats!.pending > 0 && `${stats!.pending} pending`,
                stats!.flagged > 0 && `${stats!.flagged} flagged`,
                stats!.pendingReports > 0 && `${stats!.pendingReports} open reports`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
          <Link href="/moderation/reviews" className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline whitespace-nowrap flex items-center gap-1 mt-0.5">
            Act now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STAT_CARDS.map((card) => {
            const value = stats[card.key];
            const pct   = stats.total > 0 && card.key !== 'total' && card.key !== 'pendingReports'
              ? Math.round((value / stats.total) * 100) : null;
            return (
              <div key={card.key} className={cn('relative overflow-hidden rounded-2xl p-4 sm:p-5', `bg-gradient-to-br ${card.gradient}`, card.glow)}>
                <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
                <div className="relative">
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white mb-3">{card.icon}</div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                      <p className="text-xs text-white/80 font-medium">{card.label}</p>
                      <p className="text-xs text-white/50 mt-0.5 hidden sm:block">{card.desc}</p>
                    </div>
                    {pct !== null && <span className="text-xs font-bold text-white/60">{pct}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { href: '/moderation/reviews', icon: <Clock className="h-5 w-5" />,        title: 'Review Pending Queue',  desc: 'Approve or reject reviews awaiting moderation',   count: stats?.pending ?? 0,        color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' },
          { href: '/moderation/reviews', icon: <AlertTriangle className="h-5 w-5" />, title: 'Investigate Flagged',   desc: 'Review content flagged for suspicious activity',   count: stats?.flagged ?? 0,        color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400' },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card card-hover">
            <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', action.color)}>{action.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.title}</p>
                {action.count > 0 && <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">{action.count}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        ))}
      </div>

    </div>
  );
}
