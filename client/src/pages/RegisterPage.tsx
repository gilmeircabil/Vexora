import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Sparkles, Loader2, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        login(data.data.accessToken, data.data.user);
        showToast(`Account created! You have been granted 3 free daily AI credits.`, 'success');
        navigate(redirect);
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch {
      showToast('Network error during registration.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-black p-8 sm:p-10 shadow-[6px_6px_0px_#000000]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#FACC15] border-2 border-black text-black flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_#000000]">
            <Sparkles className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black">
            Create your VexoraTool Account
          </h1>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-2">
            Includes{' '}
            <span className="font-black text-black bg-[#4ADE80] px-1.5 py-0.5 rounded border border-black">
              3 free AI credits
            </span>{' '}
            refreshed every day at 00:00 UTC.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-black text-xs uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-black text-xs uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-black text-black text-xs uppercase tracking-wider mb-1.5">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-black bg-white text-xs font-bold text-black placeholder:text-neutral-400 shadow-[2.5px_2.5px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-2 border-black/10 text-center text-xs font-bold text-neutral-600">
          Already have an account?{' '}
          <Link
            to={`/login?redirect=${redirect}`}
            className="text-black font-black underline hover:text-neutral-700 ml-1"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
