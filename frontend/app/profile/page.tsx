'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Camera, Save, Edit2, X, Star, ThumbsUp,
  BookOpen, ShieldCheck, Calendar, Mail, AtSign,
  ArrowRight, Lock, Upload,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { authApi, uploadsApi } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLE_LEVELS: Record<string, { label: string; color: string; desc: string }> = {
  admin:     { label: 'Admin',      color: 'from-purple-500 to-violet-600',   desc: 'Full platform access' },
  moderator: { label: 'Moderator',  color: 'from-blue-500 to-indigo-600',     desc: 'Reviews & reports access' },
  user:      { label: 'Reviewer',   color: 'from-brand-500 to-teal-500',      desc: 'Community member' },
};

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    username:  user?.username  ?? '',
    bio:       user?.bio       ?? '',
  });

  if (!user) return null;

  const roleLevel = ROLE_LEVELS[user.role] ?? ROLE_LEVELS.user;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarLoading(true);
    try {
      await uploadsApi.uploadAvatar(file);
      toast.success('Avatar updated');
      refetch?.();
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.username.trim()) { toast.error('Username is required'); return; }
    setLoading(true);
    try {
      await authApi.updateProfile(form);
      toast.success('Profile saved');
      refetch?.();
      setEditing(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setForm({ full_name: user.full_name ?? '', username: user.username ?? '', bio: user.bio ?? '' });
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">

      {/* ── Cover / Hero ─────────────────────────────────── */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        {/* Gradient cover */}
        <div className={cn('absolute inset-0 bg-gradient-to-br', roleLevel.color)} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)' }} />
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute right-20 top-5 h-32 w-32 rounded-full bg-white/5" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* ── Identity card ────────────────────────────────── */}
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-end">

              {/* Avatar */}
              <div className="relative self-start sm:self-end shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl ring-4 ring-white dark:ring-surface-dark-muted shadow-lg overflow-hidden">
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="xl" className="w-full h-full rounded-none" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-brand-sm flex items-center justify-center transition-colors disabled:opacity-60"
                >
                  {avatarLoading ? (
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {user.full_name || user.username || 'Unnamed'}
                  </h1>
                  <RoleBadge role={user.role} />
                  {user.is_banned && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Suspended</span>
                  )}
                </div>
                {user.username && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <AtSign className="h-3.5 w-3.5" /> {user.username}
                  </p>
                )}
                {user.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{user.bio}</p>
                )}
              </div>

              {/* Edit / Save actions */}
              <div className="flex gap-2 sm:self-start">
                {editing ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} icon={<X className="h-4 w-4" />}>Cancel</Button>
                    <Button size="sm" loading={loading} icon={<Save className="h-4 w-4" />} onClick={handleSave}>Save</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" icon={<Edit2 className="h-4 w-4" />} onClick={() => setEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-10">

          {/* ── Left column: Stats + Role ─────────────────── */}
          <div className="space-y-4">

            {/* Stats */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Activity</h2>
              <div className="space-y-3">
                {[
                  { icon: <BookOpen className="h-4 w-4" />, label: 'Reviews written', value: user.review_count ?? 0, color: 'text-brand-600 bg-brand-50 dark:bg-brand-950/30' },
                  { icon: <Star className="h-4 w-4" />,     label: 'Account status', value: user.is_banned ? 'Suspended' : 'Active', color: user.is_banned ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
                  { icon: <Calendar className="h-4 w-4" />, label: 'Member since', value: formatDate(user.created_at ?? ''), color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', s.color)}>
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviewer level badge */}
            <div className={cn('rounded-2xl p-5 text-white bg-gradient-to-br relative overflow-hidden', roleLevel.color)}>
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <ShieldCheck className="h-6 w-6 mb-2 relative" />
              <p className="text-sm font-bold relative">{roleLevel.label}</p>
              <p className="text-xs text-white/75 mt-0.5 relative">{roleLevel.desc}</p>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card divide-y divide-gray-100 dark:divide-white/8 overflow-hidden">
              {[
                { href: '/my-reviews',   icon: <BookOpen className="h-4 w-4" />,   label: 'My Reviews' },
                { href: '/dashboard',    icon: <ThumbsUp className="h-4 w-4" />,   label: 'Dashboard' },
                { href: '/products',     icon: <Star className="h-4 w-4" />,       label: 'Browse Products' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/8 flex items-center justify-center text-gray-500 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/30 group-hover:text-brand-600 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 flex-1">{item.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right column: Edit form + Account info ─────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Account details / Edit form */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">Account Details</h2>

              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      placeholder="Your full name"
                      value={form.full_name}
                      onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    />
                    <Input
                      label="Username"
                      placeholder="yourhandle"
                      value={form.username}
                      onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      hint="Letters, numbers, underscores only"
                    />
                  </div>
                  <Textarea
                    label="Bio"
                    placeholder="Tell the community a bit about yourself — what you review, your expertise, etc."
                    rows={4}
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    hint={`${form.bio.length} / 300 characters`}
                  />
                  <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
                    <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    <Button loading={loading} icon={<Save className="h-4 w-4" />} onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-0 divide-y divide-gray-100 dark:divide-white/8">
                  {[
                    { icon: <Mail className="h-4 w-4" />,    label: 'Email',    value: user.email || '—' },
                    { icon: <AtSign className="h-4 w-4" />,  label: 'Username', value: user.username ? `@${user.username}` : '—' },
                    { icon: <Edit2 className="h-4 w-4" />,   label: 'Name',     value: user.full_name || '—' },
                    { icon: <BookOpen className="h-4 w-4" />,label: 'Bio',      value: user.bio || 'No bio yet — click Edit Profile to add one' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                      <div className="h-7 w-7 rounded-lg bg-gray-100 dark:bg-white/8 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                        {row.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all leading-relaxed">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security section */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-surface-dark-muted shadow-card p-5 sm:p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Security</h2>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <div className="h-9 w-9 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
                  <p className="text-xs text-gray-400 mt-0.5">Managed via your email provider — reset through the sign-in page</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
