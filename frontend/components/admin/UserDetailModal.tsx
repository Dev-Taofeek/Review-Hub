'use client';

import { useState } from 'react';
import {
  X, Shield, ShieldOff, UserX, UserCheck, BadgeCheck,
  BadgeX, VoteIcon, Ban, Mail, AtSign, Calendar,
  BookOpen, Star, Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge, Badge } from '@/components/ui/Badge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { User } from '@/types';

interface UserDetailModalProps {
  user: User;
  currentUserId: string;
  onUpdate: (user: User) => void;
  onClose: () => void;
}

interface Action {
  label: string;
  loadingLabel: string;
  icon: React.ReactNode;
  variant: 'primary' | 'outline' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
  execute: () => Promise<User>;
  confirmMessage?: string;
}

export function UserDetailModal({ user, currentUserId, onUpdate, onClose }: UserDetailModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<Action | null>(null);

  const isSelf   = user.id === currentUserId;
  const isAdmin  = user.role === 'admin';

  const execute = async (action: Action) => {
    if (action.confirmMessage) {
      setConfirmAction(action);
      return;
    }
    await runAction(action);
  };

  const runAction = async (action: Action) => {
    setLoading(action.label);
    setConfirmAction(null);
    try {
      const updated = await action.execute();
      onUpdate(updated);
      toast.success(`Done — ${action.label.toLowerCase()}`);
    } catch (err) {
      toast.error((err as Error).message || 'Action failed');
    } finally {
      setLoading(null);
    }
  };

  const actions: Action[] = [
    // Verification
    user.is_verified
      ? {
          label: 'Remove Verification',
          loadingLabel: 'Removing…',
          icon: <BadgeX className="h-4 w-4" />,
          variant: 'outline',
          disabled: isSelf || isAdmin,
          disabledReason: isSelf ? 'Cannot modify yourself' : 'Cannot modify admins',
          execute: async () => (await adminApi.verifyUser(user.id, false)).data!,
          confirmMessage: `Remove verification from @${user.username || 'this user'}? Their reviews will no longer be pinned to the top.`,
        }
      : {
          label: 'Verify User',
          loadingLabel: 'Verifying…',
          icon: <BadgeCheck className="h-4 w-4" />,
          variant: 'primary',
          disabled: isSelf || isAdmin,
          disabledReason: isSelf ? 'Cannot modify yourself' : 'Cannot modify admins',
          execute: async () => (await adminApi.verifyUser(user.id, true)).data!,
          confirmMessage: `Verify @${user.username || 'this user'}? Their reviews will always appear at the top of product listings.`,
        },

    // Vote restriction
    user.can_vote === false
      ? {
          label: 'Restore Voting',
          loadingLabel: 'Restoring…',
          icon: <VoteIcon className="h-4 w-4" />,
          variant: 'outline',
          disabled: isSelf || isAdmin,
          execute: async () => (await adminApi.setVotePermission(user.id, true)).data!,
        }
      : {
          label: 'Restrict Voting',
          loadingLabel: 'Restricting…',
          icon: <Ban className="h-4 w-4" />,
          variant: 'outline',
          className: 'text-orange-600 border-orange-200 hover:bg-orange-50',
          disabled: isSelf || isAdmin,
          disabledReason: isSelf ? 'Cannot modify yourself' : 'Cannot modify admins',
          execute: async () => (await adminApi.setVotePermission(user.id, false)).data!,
          confirmMessage: `Restrict @${user.username || 'this user'} from voting on reviews? They will no longer be able to mark reviews as helpful.`,
        },

    // Role
    user.role === 'user'
      ? {
          label: 'Promote to Moderator',
          loadingLabel: 'Promoting…',
          icon: <Shield className="h-4 w-4" />,
          variant: 'outline',
          disabled: isSelf || isAdmin,
          execute: async () => (await adminApi.updateRole(user.id, 'moderator')).data!,
        }
      : user.role === 'moderator'
      ? {
          label: 'Demote to User',
          loadingLabel: 'Demoting…',
          icon: <ShieldOff className="h-4 w-4" />,
          variant: 'outline',
          className: 'text-amber-600 border-amber-200 hover:bg-amber-50',
          disabled: isSelf,
          execute: async () => (await adminApi.updateRole(user.id, 'user')).data!,
          confirmMessage: `Demote @${user.username || 'this user'} to regular user? They will lose moderation privileges.`,
        }
      : null,

    // Ban
    user.is_banned
      ? {
          label: 'Unban User',
          loadingLabel: 'Unbanning…',
          icon: <UserCheck className="h-4 w-4" />,
          variant: 'outline',
          disabled: isSelf || isAdmin,
          execute: async () => (await adminApi.banUser(user.id, false)).data!,
        }
      : {
          label: 'Ban User',
          loadingLabel: 'Banning…',
          icon: <UserX className="h-4 w-4" />,
          variant: 'danger' as const,
          disabled: isSelf || isAdmin,
          disabledReason: isSelf ? 'Cannot ban yourself' : 'Cannot ban admins',
          execute: async () => (await adminApi.banUser(user.id, true)).data!,
          confirmMessage: `Ban @${user.username || 'this user'}? They will be suspended from the platform immediately.`,
        },
  ].filter(Boolean) as Action[];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[var(--surface)] shadow-modal animate-slide-down flex flex-col overflow-hidden border-l border-[var(--border)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--foreground)]">User Details</h2>
          <button
            onClick={onClose}
            aria-label="Close user details"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--muted)] hover:bg-[var(--surface-soft)] dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Identity */}
          <div className="px-6 py-5 border-b border-[var(--border)]">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <Avatar src={user.avatar_url} name={user.full_name || user.username} size="lg" />
                {user.is_verified && (
                  <span className="absolute -bottom-1 -right-1">
                    <VerifiedBadge size="md" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-[var(--foreground)] truncate">
                    {user.full_name || user.username || 'Unnamed User'}
                  </h3>
                  {user.is_verified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-sm text-[var(--muted)] mb-2">@{user.username || 'no username'}</p>
                <div className="flex flex-wrap gap-1.5">
                  <RoleBadge role={user.role} />
                  {user.is_banned
                    ? <Badge variant="danger">Banned</Badge>
                    : <Badge variant="success">Active</Badge>
                  }
                  {user.is_verified && (
                    <Badge variant="info">
                      <BadgeCheck className="h-2.5 w-2.5" />
                      Verified
                    </Badge>
                  )}
                  {user.can_vote === false && (
                    <Badge variant="warning">
                      <Ban className="h-2.5 w-2.5" />
                      Vote restricted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-6 py-4 space-y-3 border-b border-[var(--border)]">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">Account Information</h4>
            {[
              { icon: <Mail className="h-4 w-4" />,     label: 'Email',        value: user.email || '—' },
              { icon: <AtSign className="h-4 w-4" />,   label: 'Username',     value: user.username ? `@${user.username}` : '—' },
              { icon: <Shield className="h-4 w-4" />,   label: 'Role',         value: user.role },
              { icon: <BookOpen className="h-4 w-4" />, label: 'Reviews',      value: `${user.review_count ?? 0} review${(user.review_count ?? 0) !== 1 ? 's' : ''}` },
              { icon: <Calendar className="h-4 w-4" />, label: 'Joined',       value: user.created_at ? formatDate(user.created_at) : '—' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)] shrink-0">
                  {row.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted)]">{row.label}</p>
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{row.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Permissions summary */}
          <div className="px-6 py-4 space-y-2 border-b border-[var(--border)]">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Permissions</h4>
            {[
              { icon: <Star className="h-4 w-4" />,         label: 'Write reviews',   allowed: !user.is_banned },
              { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Vote on reviews', allowed: user.can_vote !== false && !user.is_banned },
              { icon: <Shield className="h-4 w-4" />,       label: 'Moderation access', allowed: user.role === 'moderator' || user.role === 'admin' },
              { icon: <BadgeCheck className="h-4 w-4" />,   label: 'Verified reviewer (pinned reviews)', allowed: !!user.is_verified },
            ].map((perm) => (
              <div key={perm.label} className="flex items-center gap-3 py-1">
                <div className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0 [&>svg]:h-3 [&>svg]:w-3', perm.allowed ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600' : 'bg-[var(--surface-soft)] text-[var(--muted)]')}>
                  {perm.icon}
                </div>
                <span className={cn('text-sm', perm.allowed ? 'text-[var(--foreground)]' : 'text-[var(--muted)] line-through')}>{perm.label}</span>
                {perm.allowed
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" />
                  : <AlertTriangle className="h-3.5 w-3.5 text-[var(--muted)] dark:text-[var(--muted)] ml-auto shrink-0" />
                }
              </div>
            ))}
          </div>

          {/* Admin actions */}
          {!isSelf && !isAdmin && (
            <div className="px-6 py-5 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Admin Actions</h4>
              {actions.map((action) => (
                <div key={action.label}>
                  <Button
                    variant={action.variant}
                    size="sm"
                    icon={action.icon}
                    loading={loading === action.label}
                    disabled={!!loading || action.disabled}
                    className={cn('w-full justify-start', action.className)}
                    onClick={() => execute(action)}
                  >
                    {loading === action.label ? action.loadingLabel : action.label}
                  </Button>
                  {action.disabled && action.disabledReason && (
                    <p className="text-xs text-[var(--muted)] mt-0.5 pl-1">{action.disabledReason}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {(isSelf || isAdmin) && (
            <div className="px-6 py-5">
              <p className="text-sm text-[var(--muted)] text-center">
                {isSelf ? 'You cannot modify your own account from here.' : 'Admin accounts cannot be modified.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inline confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmAction(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-modal p-6 animate-scale-in">
            <h3 className="text-base font-bold text-[var(--foreground)] mb-2">Confirm Action</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">{confirmAction.confirmMessage}</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setConfirmAction(null)}>Cancel</Button>
              <Button
                variant={confirmAction.variant === 'danger' ? 'danger' : 'primary'}
                size="sm"
                loading={loading === confirmAction.label}
                onClick={() => runAction(confirmAction)}
              >
                {confirmAction.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
