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
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setSelected(updated);
  };

  const verifiedCount     = users.filter(u => u.is_verified).length;
  const bannedCount       = users.filter(u => u.is_banned).length;
  const restrictedCount   = users.filter(u => u.can_vote === false).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-500" />
            Users
            <span className="text-sm font-normal text-gray-400">({total.toLocaleString()})</span>
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Click any row to view full details and manage permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111c30] text-sm text-gray-700 dark:text-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="w-52">
            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Summary strip */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <BadgeCheck className="h-4 w-4" />, label: 'Verified Reviewers', value: verifiedCount,   color: 'text-[#1D9BF0] bg-blue-50 dark:bg-blue-950/30' },
            { icon: <Ban className="h-4 w-4" />,        label: 'Banned',             value: bannedCount,     color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
            { icon: <ShieldAlert className="h-4 w-4" />,label: 'Vote Restricted',    value: restrictedCount, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted p-3.5 shadow-card">
              <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', s.color)}>{s.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
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
        <div className="py-16 text-center rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card">
          <p className="text-gray-400">No users match your search</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-white/8 overflow-hidden shadow-card">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-white/8">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {['User', 'Role', 'Status', 'Reviews', 'Joined', ''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 bg-white dark:bg-surface-dark-muted">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelected(user)}
                  className="hover:bg-brand-50/50 dark:hover:bg-brand-950/20 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                        {user.is_verified && (
                          <span className="absolute -bottom-0.5 -right-0.5"><VerifiedBadge size="xs" /></span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {user.full_name || user.username || 'Unnamed'}
                          </p>
                          {user.is_verified && <VerifiedBadge size="xs" />}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{user.review_count ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{user.created_at ? formatDate(user.created_at) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium whitespace-nowrap">
                    View details →
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

      {/* User detail slide-over */}
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
