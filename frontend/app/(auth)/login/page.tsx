'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Eye, EyeOff, ArrowRight, Shield, ThumbsUp, BarChart2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const PERKS = [
  { icon: <Star className="h-4 w-4" />,      text: 'Write and manage product reviews' },
  { icon: <ThumbsUp className="h-4 w-4" />,  text: 'Vote on helpful reviews' },
  { icon: <Shield className="h-4 w-4" />,    text: 'Report suspicious content' },
  { icon: <BarChart2 className="h-4 w-4" />, text: 'Track your review history' },
];

function LoginForm() {
  const { signIn }   = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get('redirectTo') || '/dashboard';

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
      router.push(redirectTo);
    } catch {
      toast.error('Invalid email or password');
      setErrors({ password: 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-between bg-brand-600 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 h-[500px] w-[500px] rounded-full bg-white/5" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-white font-bold text-lg relative z-10">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Star className="h-5 w-5 fill-current" />
          </div>
          ReviewHub
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            The platform for<br />honest reviews
          </h2>
          <p className="text-brand-100 mb-8 text-sm leading-relaxed">
            Join thousands of real shoppers sharing genuine product experiences.
          </p>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk.text} className="flex items-center gap-3 text-sm text-brand-100">
                <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-white">
                  {perk.icon}
                </div>
                {perk.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom note */}
        <p className="text-xs text-brand-200 relative z-10">
          &copy; {new Date().getFullYear()} ReviewHub. Trusted by real shoppers.
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in</h1>
            <p className="mt-2 text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
            />
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
              Sign In
            </Button>
          </form>
        </div>
      </div>
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
