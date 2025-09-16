'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const user = await signIn(formData.email, formData.password);

      if (!user) {
        setStatus({ loading: false, error: 'Invalid email or password' });
      } else {
        // Redirect to the intended page or default to polls
        const redirectTo = searchParams.get('redirect') || '/polls';
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setStatus({
        loading: false,
        error: 'Unable to sign in. Please try again.',
      });
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <section className="w-full max-w-md space-y-8">
        <header>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-sm">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </header>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="relative block w-full rounded-t-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="Email address"
                aria-invalid={!!status.error}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="relative block w-full rounded-b-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {status.error && (
            <p className="text-red-500 text-sm text-center" role="alert">
              {status.error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={status.loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 py-2 px-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {status.loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
