'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, BadgeCheck, Ban, ShieldAlert } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge, Badge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { UserDetailModal } from '@/components/admin/UserDetailModal';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, cn } from '@/lib/utils';
import type { User } from '@/types';

const ROLE_OPTIONS = [
  { value: '',          label: 'All roles'  },
  { value: 'admin',     label: 'Admin'      },
  { value: 'moderator', label: 'Moderator'  },
  { value: 'user',      label: 'User'       },
];

/* Shared card class */
const CARD = 'bg-[var(--surface)] border border-[var(--border)] ';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users,      setUsers]      = useState<User[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const res = await adminApi.getUsers(params);
      setUsers(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setSelected(updated);
  };

  const verifiedCount   = users.filter(u => u.is_verified).length;
  const bannedCount     = users.filter(u => u.is_banned).length;
  const restrictedCount = users.filter(u => u.can_vote === false).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600 dark:text-[#00E5A0]" />
            Users
            <span className="text-sm font-normal text-[var(--muted)]">({total.toLocaleString()})</span>
          </h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">Click any row to view full details and manage permissions</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="w-48 xs:w-52">
            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Summary strip — responsive: stacks on tiny, row on xs+ */}
      {!loading && (
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
          {[
            { icon: <BadgeCheck className="h-4 w-4" />, label: 'Verified',       value: verifiedCount,   color: 'text-[#1D9BF0] bg-blue-50 dark:bg-blue-950/30',        border: 'border-blue-200/60 dark:border-blue-800/30' },
            { icon: <Ban className="h-4 w-4" />,        label: 'Banned',         value: bannedCount,     color: 'text-red-600 bg-red-50 dark:bg-red-950/30',            border: 'border-red-200/60 dark:border-red-800/30' },
            { icon: <ShieldAlert className="h-4 w-4" />,label: 'Vote Restricted', value: restrictedCount, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',  border: 'border-orange-200/60 dark:border-orange-800/30' },
          ].map((s) => (
            <div key={s.label} className={cn('flex items-center gap-3 rounded-xl border p-3.5', CARD, s.border.replace('border-', 'border-').split(' ').join(' '))}>
              {/* icon — always shows */}
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0 [&>svg]:h-4 [&>svg]:w-4', s.color)}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-black text-[var(--foreground)] tabular-nums">{s.value}</p>
                <p className="text-xs text-[var(--muted)] leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[60px] rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <div className={cn('py-16 text-center rounded-lg', CARD)}>
          <p className="text-[var(--muted)]">No users match your search</p>
        </div>
      ) : (
        /* overflow-x-auto allows horizontal scroll when table is too wide */
        <div className={cn('rounded-lg overflow-x-auto', CARD)}>
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--surface-soft)]">
              <tr>
                {['User', 'Role', 'Status', 'Reviews', 'Joined', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-bold text-[var(--muted)] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelected(user)}
                  className="hover:bg-[var(--surface-soft)] transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                        {user.is_verified && (
                          <span className="absolute -bottom-0.5 -right-0.5"><VerifiedBadge size="xs" /></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-brand-600 dark:group-hover:text-[#00E5A0] transition-colors whitespace-nowrap">
                          {user.full_name || user.username || 'Unnamed'}
                        </p>
                        <p className="text-xs text-[var(--muted)] truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {user.is_banned
                        ? <Badge variant="danger">Banned</Badge>
                        : <Badge variant="success">Active</Badge>
                      }
                      {user.can_vote === false && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Vote restricted</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[var(--foreground)] whitespace-nowrap">{user.review_count ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)] whitespace-nowrap">{user.created_at ? formatDate(user.created_at) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-brand-600 dark:text-[#00E5A0] opacity-0 group-hover:opacity-100 transition-opacity font-semibold whitespace-nowrap">
                    View →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {selected && (
        <UserDetailModal
          user={selected}
          currentUserId={currentUser?.id ?? ''}
          onUpdate={handleUpdate}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
