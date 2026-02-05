import { useState } from 'react';
import toast from 'react-hot-toast';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onAuthenticated }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn({ email, password });
        toast.success('Welcome back!');
      } else {
        await signUp({ email, password });
        toast.success('Account created successfully!');
      }
      onAuthenticated();
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-white/35 bg-white/70 p-6 shadow-glass backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80">
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-indigo-500/15 p-2 text-indigo-600 dark:text-indigo-300">
          <LockKeyhole size={18} />
        </span>
        <div>
          <h2 className="text-xl font-bold">{mode === 'signin' ? 'Sign in to QR Forge' : 'Create your QR Forge account'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Email/password authentication powered by Firebase.</p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Email</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Password</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>

        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))}
        className="mt-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
      >
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </section>
  );
}
