'use client';

import { useState } from 'react';
import { Shield, ShieldOff, UserX, UserCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface UserTableProps {
  users: User[];
  currentUserId: string;
  onUpdate: (user: User) => void;
}

export function UserTable({ users, currentUserId, onUpdate }: UserTableProps) {
  const [confirm, setConfirm] = useState<{ user: User; action: 'promote' | 'demote' | 'ban' | 'unban' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      let updated: User;
      if (confirm.action === 'promote') {
        const res = await adminApi.updateRole(confirm.user.id, 'moderator');
        updated = res.data!;
        toast.success('User promoted to moderator');
      } else if (confirm.action === 'demote') {
        const res = await adminApi.updateRole(confirm.user.id, 'user');
        updated = res.data!;
        toast.success('User demoted to user');
      } else if (confirm.action === 'ban') {
        const res = await adminApi.banUser(confirm.user.id, true);
        updated = res.data!;
        toast.success('User banned');
      } else {
        const res = await adminApi.banUser(confirm.user.id, false);
        updated = res.data!;
        toast.success('User unbanned');
      }
      onUpdate(updated);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
      setConfirm(null);
    }
  };

  const confirmMessages: Record<string, { title: string; description: string; label: string; variant: 'primary' | 'danger' }> = {
    promote: { title: 'Promote to Moderator', description: 'This user will gain moderation privileges.', label: 'Promote', variant: 'primary' },
    demote:  { title: 'Demote to User',       description: 'This user will lose moderation privileges.', label: 'Demote', variant: 'danger' },
    ban:     { title: 'Ban User',              description: 'This user will be suspended from the platform.', label: 'Ban User', variant: 'danger' },
    unban:   { title: 'Unban User',            description: 'This user will regain access to the platform.', label: 'Unban', variant: 'primary' },
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-white/[0.07]">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/8">
          <thead className="bg-slate-50 dark:bg-white/5">
            <tr>
              {['User', 'Role', 'Reviews', 'Joined', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5 bg-white dark:bg-[#0D1020]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar_url} name={user.full_name || user.username} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.full_name || user.username || 'Unnamed'}
                      </p>
                      <p className="text-xs text-slate-400">{user.username && `@${user.username}`}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{user.review_count ?? 0}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{user.created_at ? formatDate(user.created_at) : '—'}</td>
                <td className="px-4 py-3">
                  {user.is_banned
                    ? <Badge variant="danger">Banned</Badge>
                    : <Badge variant="success">Active</Badge>}
                </td>
                <td className="px-4 py-3">
                  {user.id !== currentUserId && user.role !== 'admin' && (
                    <div className="flex items-center gap-1">
                      {user.role === 'user' ? (
                        <Button size="xs" variant="outline"
                          icon={<Shield className="h-3.5 w-3.5" />}
                          onClick={() => setConfirm({ user, action: 'promote' })}>
                          Promote
                        </Button>
                      ) : (
                        <Button size="xs" variant="outline"
                          icon={<ShieldOff className="h-3.5 w-3.5" />}
                          onClick={() => setConfirm({ user, action: 'demote' })}>
                          Demote
                        </Button>
                      )}
                      {user.is_banned ? (
                        <Button size="xs" variant="outline"
                          icon={<UserCheck className="h-3.5 w-3.5" />}
                          onClick={() => setConfirm({ user, action: 'unban' })}>
                          Unban
                        </Button>
                      ) : (
                        <Button size="xs" variant="outline"
                          icon={<UserX className="h-3.5 w-3.5" />}
                          className="text-red-500 hover:border-red-200"
                          onClick={() => setConfirm({ user, action: 'ban' })}>
                          Ban
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && (
        <ConfirmModal
          open={!!confirm}
          onClose={() => setConfirm(null)}
          onConfirm={handleConfirm}
          loading={loading}
          {...confirmMessages[confirm.action]}
        />
      )}
    </>
  );
}
