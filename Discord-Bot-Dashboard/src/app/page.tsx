'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('bot_token', token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid bot token');
      }
    } catch (err) {
      setError('Failed to connect to Discord');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#1d0d66] via-[#2c2ea3] to-[#254dcf]">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute top-40 right-40 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 rounded-full bg-indigo-500/20 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Discord Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 71 55" fill="white">
            <g clipPath="url(#clip0)">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
            </g>
          </svg>
          <span className="text-white font-bold text-xl">Discord Bot Dashboard</span>
        </div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#313338] rounded-lg shadow-2xl p-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Welcome back!</h1>
          <p className="text-[#b5bac1] mb-6">Enter your bot token to continue</p>

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-xs font-medium text-[#b5bac1] uppercase mb-2">
                Bot Token <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-[#1e1f22] border-[#1e1f22] text-white placeholder:text-[#6d6f78] focus:border-[#00a8fc] h-11"
                placeholder="MTk4NjIyNDgzNDcxOTI1MjQ4.XXXXXX.XXXXXX"
                required
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white h-11 font-medium"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="mt-4 text-sm text-[#949ba4]">
              <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-[#00a8fc] hover:underline">
                Don't have a bot token?
              </a>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-[#949ba4]">
          <p>⚠️ Never share your bot token with anyone</p>
        </div>
      </div>
    </div>
  );
}
