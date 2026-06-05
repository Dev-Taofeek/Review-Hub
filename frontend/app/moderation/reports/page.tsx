'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flag, CheckCircle } from 'lucide-react';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { reportsApi } from '@/lib/api';
import { formatRelativeTime, REPORT_REASONS } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Report } from '@/types';

const STATUS_OPTIONS = [
  { value: '',         label: 'All Reports'   },
  { value: 'pending',  label: 'Pending'       },
  { value: 'reviewed', label: 'Reviewed'      },
  { value: 'resolved', label: 'Resolved'      },
  { value: 'dismissed', label: 'Dismissed'    },
];

export default function ModerationReportsPage() {
  const [reports, setReports]   = useState<Report[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('pending');
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (status) params.status = status;
      const res = await reportsApi.getAll(params);
      setReports(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const updateStatus = async (reportId: string, newStatus: string) => {
    setUpdating(reportId);
    try {
      await reportsApi.update(reportId, newStatus);
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: newStatus as Report['status'] } : r));
      toast.success('Report updated');
    } catch { toast.error('Failed to update'); }
    finally { setUpdating(null); }
  };

  const getReasonLabel = (reason: string) => REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Reports <span className="text-slate-400 dark:text-slate-500 font-normal">({total})</span>
        </h2>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-44"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<CheckCircle />}
          title="No reports"
          description={status === 'pending' ? 'No pending reports. Community looks healthy!' : 'No reports match this filter.'}
        />
      ) : (
        <>
          {/* overflow-x-auto allows horizontal scroll on narrow screens */}
          <div className="rounded-xl bg-white dark:bg-[#0D1020] border border-slate-200/80 dark:border-white/[0.07] overflow-x-auto shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-white/[0.06]">
              <thead className="bg-slate-50 dark:bg-white/[0.03]">
                <tr>
                  {['Review', 'Reason', 'Reporter', 'Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/[0.04] bg-white dark:bg-[#0D1020]">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {(report.review as { title?: string })?.title ?? 'Deleted review'}
                      </p>
                      {report.message && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">"{report.message}"</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="danger" size="sm">
                        <Flag className="h-3 w-3" />
                        {getReasonLabel(report.reason)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {(report.reporter as { username?: string })?.username ?? 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatRelativeTime(report.created_at)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {report.status === 'pending' && (
                          <>
                            <Button size="xs" variant="outline"
                              loading={updating === report.id}
                              onClick={() => updateStatus(report.id, 'resolved')}>
                              Resolve
                            </Button>
                            <Button size="xs" variant="ghost"
                              loading={updating === report.id}
                              onClick={() => updateStatus(report.id, 'dismissed')}>
                              Dismiss
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
