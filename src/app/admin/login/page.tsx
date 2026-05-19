'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    params.get('error') === 'inactive'
      ? 'This account has been deactivated.'
      : params.get('error') === 'expired'
        ? 'This account has expired.'
        : params.get('error')
          ? 'Invalid credentials.'
          : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/admin');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-xs tracking-widest uppercase font-body font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase font-body font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border-b border-black py-2 text-sm font-body bg-transparent focus:outline-none"
        />
      </div>
      {error && (
        <p className="text-xs font-body text-black border border-black px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-3 bg-black text-white text-xs tracking-widest uppercase font-body hover:bg-black/80 transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <h1 className="font-display font-black text-4xl leading-none mb-12">
          SIDE
          <br />
          HUSTLE
        </h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
