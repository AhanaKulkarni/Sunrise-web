'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setSession, getUser } from '@/lib/auth';
import { Sun, Phone, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getUser()) router.replace('/dashboard');
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: any }>(
        '/auth/login',
        { phone: phone.trim(), password }
      );
      setSession(res.token, res.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message?.includes('401') || err?.message?.includes('invalid')
        ? 'Invalid phone or password'
        : 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="clay w-full max-w-md p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="clay-sm w-16 h-16 flex items-center justify-center mb-4">
            <Sun className="w-8 h-8 text-primary" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold text-text">Sunrise OS</h1>
          <p className="text-sm text-textSecondary mt-1">Workforce &amp; Operations</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wide">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone"
                className="clay-input w-full pl-11 text-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="clay-input w-full pl-11 text-text"
              />
            </div>
          </div>

          {error && (
            <div className="clay-sm p-3 text-sm text-danger bg-dangerSoft/40">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="clay-btn w-full py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-textMuted text-center mt-6">
          Sunrise OS &middot; Web Console
        </p>
      </div>
    </div>
  );
}
