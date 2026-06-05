'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Star, Eye, EyeOff, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { staggerContainer, staggerItem, slideInLeft, slideInRight } from '@/lib/animations';
import toast from 'react-hot-toast';

const STEPS = [
  { label: 'Create your free account',    done: true  },
  { label: 'Add products you own',         done: false },
  { label: 'Write honest reviews',         done: false },
  { label: 'Help others shop smarter',     done: false },
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router     = useRouter();
  const reduced    = useReducedMotion();

  const [form, setForm]       = useState({ email: '', password: '', username: '', full_name: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const update = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name.trim())                          e.full_name = 'Full name is required';
    if (!form.username.trim())                           e.username  = 'Username is required';
    else if (!/^[a-z0-9_]{3,20}$/i.test(form.username)) e.username  = '3–20 chars: letters, numbers, _';
    if (!form.email)                                     e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))          e.email     = 'Invalid email address';
    if (!form.password)                                  e.password  = 'Password is required';
    else if (form.password.length < 8)                   e.password  = 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.username, form.full_name);
      toast.success('Welcome to ReviewHub!');
      router.push('/dashboard');
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes('already registered')) setErrors({ email: 'Email already in use — try signing in' });
      else toast.error(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = form.password.length === 0 ? null : form.password.length < 8 ? 'weak' : form.password.length < 12 ? 'good' : 'strong';

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left: brand panel ──────────────────────────────── */}
      <motion.div
        variants={reduced ? {} : slideInLeft}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex lg:w-[52%] xl:w-[56%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #020917 0%, #040f1f 40%, #061629 100%)' }}
      >
        {/* Orbs */}
        {!reduced && (
          <>
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-20 right-0 w-[450px] h-[450px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.2) 0%, transparent 70%)' }} />
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-32 -left-16 w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
          </>
        )}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit mb-auto">
            <motion.div whileHover={reduced ? {} : { scale: 1.08, rotate: -5 }}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/50">
              <Star className="h-5 w-5 fill-white text-white" />
            </motion.div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">ReviewHub</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-400 -mt-0.5">Verified Reviews</p>
            </div>
          </Link>

          {/* Main copy */}
          <motion.div variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible" className="py-16">
            <motion.div variants={reduced ? {} : staggerItem} className="mb-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 border border-brand-800/40 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                Free forever
              </span>
            </motion.div>
            <motion.h1 variants={reduced ? {} : staggerItem}
              className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-[0.95] mb-5">
              Start sharing your<br />
              <span style={{
                background: 'linear-gradient(135deg, #34d399, #10b981, #059669)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                honest experiences.
              </span>
            </motion.h1>
            <motion.p variants={reduced ? {} : staggerItem}
              className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
              Join thousands of reviewers making online shopping better for everyone. It takes 60 seconds.
            </motion.p>

            {/* Steps */}
            <motion.ol variants={reduced ? {} : staggerContainer} initial="hidden" animate="visible" className="space-y-4 mb-12">
              {STEPS.map((step, i) => (
                <motion.li key={step.label} variants={reduced ? {} : staggerItem} className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                    i === 0
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-900/50'
                      : 'bg-white/[0.06] border border-white/10 text-slate-500'
                  }`}>
                    {i === 0 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                </motion.li>
              ))}
            </motion.ol>

            <motion.div variants={reduced ? {} : staggerItem}
              className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <div className="flex -space-x-2">
                {['JD', 'AS', 'MK'].map((init, i) => (
                  <div key={init} className={`h-7 w-7 rounded-full border-2 border-[#040f1f] flex items-center justify-center text-[9px] font-bold text-white ${['bg-brand-600', 'bg-violet-600', 'bg-amber-500'][i]}`}>{init}</div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-white font-semibold">12,000+</span> reviewers already joined
              </p>
            </motion.div>
          </motion.div>

          <p className="text-xs text-slate-600 mt-auto">&copy; {new Date().getFullYear()} ReviewHub. Built for trust.</p>
        </div>
      </motion.div>

      {/* ── Right: form panel ──────────────────────────────── */}
      <motion.div
        variants={reduced ? {} : slideInRight}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col justify-center px-4 xs:px-6 py-10 sm:px-12 lg:px-16 xl:px-20 bg-slate-50 dark:bg-[#060c1a] overflow-y-auto"
      >
        <div className="lg:hidden mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
              <Star className="h-4.5 w-4.5 fill-white text-white" />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white">ReviewHub</span>
          </Link>
        </div>

        <motion.div
          variants={reduced ? {} : staggerContainer}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm mx-auto"
        >
          <motion.div variants={reduced ? {} : staggerItem} className="mb-8">
            <h2 className="text-2xl xs:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                Sign in →
              </Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div variants={reduced ? {} : staggerItem} className="grid grid-cols-2 gap-3">
              <Input label="Full Name" required placeholder="Jane Smith"
                value={form.full_name} onChange={(e) => update('full_name', e.target.value)} error={errors.full_name} />
              <Input label="Username" required placeholder="janesmith"
                value={form.username} onChange={(e) => update('username', e.target.value.toLowerCase())} error={errors.username} />
            </motion.div>

            <motion.div variants={reduced ? {} : staggerItem}>
              <Input label="Email address" type="email" required autoComplete="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
            </motion.div>

            <motion.div variants={reduced ? {} : staggerItem}>
              <Input label="Password" required type={showPw ? 'text' : 'password'} autoComplete="new-password"
                placeholder="Min. 8 characters" value={form.password}
                onChange={(e) => update('password', e.target.value)} error={errors.password}
                hint={
                  pwStrength === null ? 'At least 8 characters' :
                  pwStrength === 'weak' ? `${8 - form.password.length} more chars needed` :
                  pwStrength === 'good' ? '✓ Good password' : '✓ Strong password'
                }
                iconRight={
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <AnimatePresence mode="wait" initial={false}>
                      {showPw
                        ? <motion.div key="hide" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}><EyeOff className="h-4 w-4" /></motion.div>
                        : <motion.div key="show" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}><Eye className="h-4 w-4" /></motion.div>
                      }
                    </AnimatePresence>
                  </button>
                }
              />
              {/* Password strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: pwStrength === 'weak' ? '33%' : pwStrength === 'good' ? '66%' : '100%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`h-full rounded-full ${pwStrength === 'weak' ? 'bg-red-500' : pwStrength === 'good' ? 'bg-amber-500' : 'bg-brand-500'}`}
                  />
                </div>
              )}
            </motion.div>

            <motion.div variants={reduced ? {} : staggerItem} className="pt-2">
              <Button type="submit" loading={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-900/25 font-bold text-base h-12 rounded-xl"
                iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}>
                {loading ? 'Creating account…' : 'Create free account'}
              </Button>
            </motion.div>
          </form>

          <motion.p variants={reduced ? {} : staggerItem}
            className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-brand-600 dark:text-brand-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">Privacy Policy</Link>.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
