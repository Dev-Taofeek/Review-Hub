'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const STEPS = [
  'Create your free account',
  'Add products you own',
  'Write honest reviews',
  'Help others shop smarter',
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router     = useRouter();

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
    if (!form.full_name.trim())                         e.full_name = 'Full name is required';
    if (!form.username.trim())                          e.username  = 'Username is required';
    else if (!/^[a-z0-9_]{3,20}$/i.test(form.username)) e.username = '3–20 chars: letters, numbers, _';
    if (!form.email)                                    e.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))         e.email     = 'Invalid email';
    if (!form.password)                                 e.password  = 'Password is required';
    else if (form.password.length < 8)                  e.password  = 'At least 8 characters';
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
      if (msg.includes('already registered')) setErrors({ email: 'Email already in use' });
      else toast.error(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between bg-gray-900 p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-600/10" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-brand-600/10" />

        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white relative z-10">
          <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Star className="h-5 w-5 fill-current text-white" />
          </div>
          ReviewHub
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Start sharing your<br />honest experiences
          </h2>
          <p className="text-gray-400 mb-10 text-sm">
            It only takes a minute. No credit card required.
          </p>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-center gap-4">
                <div className="h-7 w-7 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs text-gray-600 relative z-10">
          &copy; {new Date().getFullYear()} ReviewHub
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Star className="h-4 w-4 fill-current text-white" />
            </div>
            ReviewHub
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full Name" required
                placeholder="Jane Smith"
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
                error={errors.full_name}
              />
              <Input
                label="Username" required
                placeholder="janesmith"
                value={form.username}
                onChange={(e) => update('username', e.target.value.toLowerCase())}
                error={errors.username}
              />
            </div>
            <Input
              label="Email" type="email" required
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
            />
            <Input
              label="Password" required
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
              hint={form.password.length > 0 ? (form.password.length < 8 ? `${8 - form.password.length} more chars needed` : '✓ Strong enough') : 'At least 8 characters'}
              iconRight={
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-1"
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-xs text-gray-400 text-center leading-relaxed">
            By signing up you agree to our{' '}
            <Link href="/terms"   className="underline hover:text-gray-600">Terms</Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
