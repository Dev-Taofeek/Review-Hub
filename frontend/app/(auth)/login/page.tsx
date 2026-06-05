'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Star, Eye, EyeOff, ArrowRight, Shield,
  ThumbsUp, BarChart2, CheckCircle, Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { staggerContainer, staggerItem, fadeInUp, slideInLeft, slideInRight } from '@/lib/animations';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: Star,      text: 'Write and manage product reviews',   color: 'bg-amber-500/20 text-amber-400' },
  { icon: ThumbsUp,  text: 'Vote on helpful reviews',            color: 'bg-brand-500/20  text-brand-400' },
  { icon: Shield,    text: 'Report suspicious content',          color: 'bg-blue-500/20   text-blue-400'  },
  { icon: BarChart2, text: 'Track your full review history',     color: 'bg-violet-500/20 text-violet-400'},
];

const STATS = [
  { value: '24K+',  label: 'Reviews' },
  { value: '4.8★',  label: 'Avg Rating' },
  { value: '847+',  label: 'Products' },
];

function LoginForm() {
  const { signIn }   = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirectTo') || '/dashboard';
  const reduced      = useReducedMotion();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email)                           e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email   = 'Invalid email address';
    if (!password)                        e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      window.location.href = redirectTo;
    } catch {
      toast.error('Invalid email or password');
      setErrors({ password: 'Invalid credentials — please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── Left: brand panel ──────────────────────────────── */}
      <motion.div
        variants={reduced ? {} : slideInLeft}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex lg:w-[54%] xl:w-[58%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #020917 0%, #040f1f 40%, #061629 100%)' }}
      >
        {/* Orbs */}
        {!reduced && (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(5,150,105,0.22) 0%, transparent 70%)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
              className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
            />
          </>
        )}

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative flex flex-col h-full px-12 xl:px-16 py-12">
          {/* Logo */}
          <motion.div variants={reduced ? {} : staggerItem}
            className="flex items-center gap-3 mb-auto">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={reduced ? {} : { scale: 1.08, rotate: -5 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/50"
              >
                <Star className="h-5 w-5 fill-white text-white" />
              </motion.div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">ReviewHub</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-400 -mt-0.5">Verified Reviews</p>
              </div>
            </Link>
          </motion.div>

          {/* Main copy */}
          <motion.div
            variants={reduced ? {} : staggerContainer}
            initial="hidden"
            animate="visible"
            className="py-16"
          >
            <motion.div variants={reduced ? {} : staggerItem} className="mb-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950/60 border border-brand-800/40 px-3 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                Trusted community
              </span>
            </motion.div>

            <motion.h1
              variants={reduced ? {} : staggerItem}
              className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-[0.95] mb-5"
            >
              Reviews from people<br />
              <span style={{
                background: 'linear-gradient(135deg, #34d399, #10b981, #059669)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                who actually bought it.
              </span>
            </motion.h1>

            <motion.p variants={reduced ? {} : staggerItem}
              className="text-slate-400 text-base leading-relaxed mb-10 max-w-sm">
              Join our community of verified reviewers helping millions of shoppers make smarter purchase decisions.
            </motion.p>

            {/* Perks */}
            <motion.ul
              variants={reduced ? {} : staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3.5 mb-12"
            >
              {PERKS.map((perk) => (
                <motion.li key={perk.text} variants={reduced ? {} : staggerItem}
                  className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${perk.color}`}>
                    <perk.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{perk.text}</span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Stats strip */}
            <motion.div variants={reduced ? {} : staggerItem}
              className="flex items-center gap-8 pt-8 border-t border-white/[0.08]">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-white tabular-nums">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Footer */}
          <p className="text-xs text-slate-600 mt-auto">
            &copy; {new Date().getFullYear()} ReviewHub. Built for trust.
          </p>
        </div>
      </motion.div>

      {/* ── Right: form panel ──────────────────────────────── */}
      <motion.div
        variants={reduced ? {} : slideInRight}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col justify-center px-4 xs:px-6 py-10 sm:px-12 lg:px-16 xl:px-20 bg-slate-50 dark:bg-[#060c1a]"
      >
        {/* Mobile logo */}
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
            <h2 className="text-2xl xs:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                Create one free →
              </Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div variants={reduced ? {} : staggerItem}>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />
            </motion.div>

            <motion.div variants={reduced ? {} : staggerItem}>
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
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
            </motion.div>

            <motion.div variants={reduced ? {} : staggerItem} className="pt-2">
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-900/25 font-bold text-base h-12 rounded-xl"
                iconRight={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={reduced ? {} : staggerItem}
            className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
            <span className="text-xs text-slate-400 font-medium">secure & encrypted</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
          </motion.div>

          <motion.p variants={reduced ? {} : staggerItem}
            className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
            By signing in you agree to our{' '}
            <Link href="/terms" className="text-brand-600 dark:text-brand-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-600 dark:text-brand-400 hover:underline">Privacy Policy</Link>.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
