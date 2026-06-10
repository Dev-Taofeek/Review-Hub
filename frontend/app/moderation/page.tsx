'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Clock, Flag, XCircle, MessageSquare, AlertTriangle, ArrowRight, Shield, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { moderationApi } from '@/lib/api';
import type { ModerationStats } from '@/types';

const STAT_CARDS = [
  { key: 'total' as const, label: 'Total Reviews', desc: 'All review inventory', icon: <MessageSquare className="h-5 w-5" />, accent: 'var(--accent)' },
  { key: 'published' as const, label: 'Published', desc: 'Live buyer guidance', icon: <CheckCircle className="h-5 w-5" />, accent: 'var(--primary)' },
  { key: 'pending' as const, label: 'Pending', desc: 'Awaiting decision', icon: <Clock className="h-5 w-5" />, accent: 'var(--secondary)' },
  { key: 'flagged' as const, label: 'Flagged', desc: 'Suspicious content', icon: <AlertTriangle className="h-5 w-5" />, accent: '#F97316' },
  { key: 'rejected' as const, label: 'Rejected', desc: 'Removed from trust layer', icon: <XCircle className="h-5 w-5" />, accent: 'var(--danger)' },
  { key: 'pendingReports' as const, label: 'Open Reports', desc: 'Community reports', icon: <Flag className="h-5 w-5" />, accent: 'var(--secondary)' },
];

export default function ModerationOverviewPage() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moderationApi.getStats().then((res) => setStats(res.data ?? null)).finally(() => setLoading(false));
  }, []);

  const urgent = stats ? stats.pending + stats.flagged + stats.pendingReports : 0;

  return (
    <div className="space-y-5">
      <div className="forest-panel relative overflow-hidden rounded-lg p-5 sm:p-7">
        <div className="absolute inset-0 signal-grid opacity-20" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10">
              <Shield className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-label-mono text-amber-300">Moderation command center</p>
              <h1 className="mt-1 text-2xl font-black text-[#F7F2E8]">Trust operations queue</h1>
              <p className="mt-1 text-sm text-[#C8BFAE]">Prioritize risk, preserve useful opinions, and keep the audit trail visible.</p>
            </div>
          </div>
          <Link href="/moderation/reviews">
            <button className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-[#F7F2E8] transition hover:bg-white/15">
              Review Queue <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>

      {!loading && urgent > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300/40 bg-[var(--secondary-soft)] p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--secondary)]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-[var(--foreground)]">{urgent} queue item{urgent !== 1 ? 's' : ''} need attention</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {[
                stats!.pending > 0 && `${stats!.pending} pending`,
                stats!.flagged > 0 && `${stats!.flagged} flagged`,
                stats!.pendingReports > 0 && `${stats!.pendingReports} open reports`,
              ].filter(Boolean).join(' / ')}
            </p>
          </div>
          <Link href="/moderation/reviews" className="mt-1 flex items-center gap-1 whitespace-nowrap text-xs font-black text-[var(--primary)]">
            Act now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {STAT_CARDS.map((card) => {
            const value = stats[card.key];
            const pct = stats.total > 0 && card.key !== 'total' && card.key !== 'pendingReports' ? Math.round((value / stats.total) * 100) : null;
            return (
              <div key={card.key} className="trust-card rounded-lg p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${card.accent}18`, color: card.accent }}>
                    {card.icon}
                  </div>
                  {pct !== null && <span className="text-data text-xs font-black text-[var(--muted)]">{pct}%</span>}
                </div>
                <p className="text-data text-3xl font-black text-[var(--foreground)]">{value.toLocaleString()}</p>
                <p className="mt-1 text-sm font-black text-[var(--foreground)]">{card.label}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{card.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { href: '/moderation/reviews', icon: <Clock className="h-5 w-5" />, title: 'Priority Review Queue', desc: 'Approve, reject, or escalate reviews by risk signal', count: stats?.pending ?? 0, accent: 'var(--secondary)' },
          { href: '/moderation/reports', icon: <Activity className="h-5 w-5" />, title: 'Report Audit Trail', desc: 'Review community reports and reason chips', count: stats?.pendingReports ?? 0, accent: 'var(--accent)' },
        ].map((action) => (
          <Link key={action.title} href={action.href} className="trust-card trust-card-hover group flex items-center gap-4 rounded-lg p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: `${action.accent}18`, color: action.accent }}>{action.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-[var(--foreground)]">{action.title}</p>
                {action.count > 0 && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-black text-red-700">{action.count}</span>}
              </div>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
