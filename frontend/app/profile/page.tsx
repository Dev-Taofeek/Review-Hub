'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Camera, Save, Edit2, X, Star, ThumbsUp,
  BookOpen, ShieldCheck, Calendar, Mail, AtSign,
  ArrowRight, Lock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/ui/Badge';
import { authApi, uploadsApi } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { staggerContainer, staggerItem, pageTransition } from '@/lib/animations';
import toast from 'react-hot-toast';

const ROLE_META: Record<string, { label: string; color: string; glow: string; desc: string }> = {
  admin:     { label: 'Admin',     color: '#0891B2', glow: '0 8px 32px rgba(8,145,178,0.18)', desc: 'Full platform access' },
  moderator: { label: 'Moderator', color: '#F59E0B', glow: '0 8px 32px rgba(245,158,11,0.18)', desc: 'Reviews & reports access' },
  user:      { label: 'Reviewer',  color: '#047857', glow: '0 8px 32px rgba(4,120,87,0.18)', desc: 'Community member' },
};

/* Reusable card */
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    'trust-card rounded-3xl',
    className
  )}>
    {children}
  </div>
);

export default function ProfilePage() {
  const { user, refetch } = useAuth();
  const [editing,      setEditing]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [avatarLoading,setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    username:  user?.username  ?? '',
    bio:       user?.bio       ?? '',
  });

  if (!user) return null;

  const role = ROLE_META[user.role] ?? ROLE_META.user;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarLoading(true);
    try { await uploadsApi.uploadAvatar(file); toast.success('Avatar updated'); refetch?.(); }
    catch { toast.error('Failed to upload avatar'); }
    finally { setAvatarLoading(false); }
  };

  const handleSave = async () => {
    if (!form.username.trim()) { toast.error('Username is required'); return; }
    setLoading(true);
    try { await authApi.updateProfile(form); toast.success('Profile saved'); refetch?.(); setEditing(false); }
    catch (err) { toast.error((err as Error).message); }
    finally { setLoading(false); }
  };

  const cancelEdit = () => {
    setForm({ full_name: user.full_name ?? '', username: user.username ?? '', bio: user.bio ?? '' });
    setEditing(false);
  };

  return (
    <motion.div
      variants={reduced ? {} : pageTransition}
      initial="hidden" animate="visible"
      className="min-h-screen bg-[var(--background)]"
    >
      {/* ── Cover hero ──────────────────────────────────── */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--surface)]" />
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: role.color }} />
      </div>

      <div className="mx-auto max-w-4xl px-4 xs:px-5 sm:px-8">

        {/* ── Identity card ───────────────────────────────── */}
        <motion.div
          variants={reduced ? {} : staggerItem}
          initial="hidden" animate="visible"
          className="relative -mt-16 sm:-mt-20 mb-6"
        >
          <Card className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 sm:items-end">
              {/* Avatar */}
              <div className="relative self-start shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-4 border-[var(--surface)] shadow-lg"
                  style={{ boxShadow: role.glow }}>
                  <Avatar src={user.avatar_url} name={user.full_name || user.username} size="xl" className="w-full h-full rounded-none" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  aria-label="Upload avatar"
                  className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-xl flex items-center justify-center text-black shadow-md transition-all disabled:opacity-60 hover:scale-110"
                  style={{ background: 'var(--signal)' }}
                >
                  {avatarLoading
                    ? <div className="h-3.5 w-3.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    : <Camera className="h-3.5 w-3.5" />
                  }
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {user.full_name || user.username || 'Unnamed'}
                  </h1>
                  <RoleBadge role={user.role} />
                  {user.is_banned && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 px-2 py-0.5 rounded-full">
                      Suspended
                    </span>
                  )}
                </div>
                {user.username && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <AtSign className="h-3.5 w-3.5" aria-hidden="true" /> {user.username}
                  </p>
                )}
                {user.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-lg">{user.bio}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:self-start shrink-0">
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
          </Card>
        </motion.div>

        {/* ── Main grid ───────────────────────────────────── */}
        <motion.div
          variants={reduced ? {} : staggerContainer}
          initial="hidden" animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 pb-12"
        >

          {/* ── Left sidebar ────────────────────────────── */}
          <div className="space-y-4">

            {/* Activity stats */}
            <motion.div variants={reduced ? {} : staggerItem}>
              <Card className="p-5">
                <p className="text-label-mono text-slate-400 dark:text-white/30 mb-4">Activity</p>
                <div className="space-y-3">
                  {[
                    { icon: <BookOpen className="h-4 w-4" />, label: 'Reviews written', value: user.review_count ?? 0, accent: '#00E5A0', bg: 'bg-brand-50 dark:bg-[rgba(0,229,160,0.08)] text-brand-700 dark:text-[#00E5A0]' },
                    { icon: <Star className="h-4 w-4" />,     label: 'Account status', value: user.is_banned ? 'Suspended' : 'Active', accent: user.is_banned ? '#FF6B6B' : '#00E5A0', bg: user.is_banned ? 'bg-red-50 dark:bg-[rgba(255,107,107,0.08)] text-red-600 dark:text-[#FF6B6B]' : 'bg-emerald-50 dark:bg-[rgba(52,211,153,0.08)] text-emerald-700 dark:text-emerald-400' },
                    { icon: <Calendar className="h-4 w-4" />, label: 'Member since', value: formatDate(user.created_at ?? ''), accent: '#A78BFA', bg: 'bg-violet-50 dark:bg-[rgba(167,139,250,0.08)] text-violet-700 dark:text-violet-400' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0 [&>svg]:h-4 [&>svg]:w-4', s.bg)}>
                        {s.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 dark:text-slate-500">{s.label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{String(s.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Role badge */}
            <motion.div variants={reduced ? {} : staggerItem}>
              <div className="trust-card rounded-3xl p-5 relative overflow-hidden" style={{ boxShadow: role.glow }}>
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: role.color }} />
                <div className="relative">
                  <ShieldCheck className="h-6 w-6 mb-2" style={{ color: role.color }} />
                  <p className="text-sm font-black text-[var(--foreground)]">{role.label}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{role.desc}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div variants={reduced ? {} : staggerItem}>
              <Card className="divide-y divide-slate-100 dark:divide-white/[0.05] overflow-hidden">
                {[
                  { href: '/my-reviews', icon: <BookOpen className="h-4 w-4" />, label: 'My Reviews' },
                  { href: '/dashboard',  icon: <ThumbsUp className="h-4 w-4" />, label: 'Dashboard' },
                  { href: '/products',   icon: <Star className="h-4 w-4" />,     label: 'Browse Products' },
                ].map((item) => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/[0.07] flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 text-slate-500 dark:text-slate-400 group-hover:bg-brand-50 dark:group-hover:bg-[rgba(0,229,160,0.08)] group-hover:text-brand-600 dark:group-hover:text-[#00E5A0] transition-all">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-[#00E5A0] flex-1 transition-colors">{item.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </Card>
            </motion.div>
          </div>

          {/* ── Right column ─────────────────────────────── */}
          <div className="space-y-4">

            {/* Account details / Edit form */}
            <motion.div variants={reduced ? {} : staggerItem}>
              <Card className="p-5 sm:p-6">
                <p className="text-label-mono text-slate-400 dark:text-white/30 mb-5">Account Details</p>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Full Name" placeholder="Your full name" value={form.full_name}
                        onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
                      <Input label="Username" placeholder="yourhandle" value={form.username}
                        onChange={(e) => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        hint="Letters, numbers, underscores only" />
                    </div>
                    <Textarea label="Bio" rows={4}
                      placeholder="Tell the community a bit about yourself — what you review, your expertise, etc."
                      value={form.bio}
                      onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                      hint={`${form.bio.length} / 300 characters`} />
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                      <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                      <Button loading={loading} icon={<Save className="h-4 w-4" />} onClick={handleSave}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                    {[
                      { icon: <Mail className="h-4 w-4" />,     label: 'Email',    value: user.email || '—' },
                      { icon: <AtSign className="h-4 w-4" />,   label: 'Username', value: user.username ? `@${user.username}` : '—' },
                      { icon: <Edit2 className="h-4 w-4" />,    label: 'Name',     value: user.full_name || '—' },
                      { icon: <BookOpen className="h-4 w-4" />, label: 'Bio',      value: user.bio || 'No bio yet — click Edit Profile to add one' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-white/[0.07] flex items-center justify-center [&>svg]:h-3.5 [&>svg]:w-3.5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                          {row.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{row.label}</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 break-all leading-relaxed">{row.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Security */}
            <motion.div variants={reduced ? {} : staggerItem}>
              <Card className="p-5 sm:p-6">
                <p className="text-label-mono text-slate-400 dark:text-white/30 mb-4">Security</p>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.07]">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Password</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Managed via your email provider — reset through the sign-in page</p>
                  </div>
                </div>
              </Card>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
