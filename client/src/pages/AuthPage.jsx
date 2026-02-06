import { useState } from 'react';
import toast from 'react-hot-toast';
import { Chrome, LockKeyhole, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onAuthenticated }) {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Signed in with Google!');
      onAuthenticated();
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/35 bg-white/70 shadow-glass backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-cyan-400/20 p-8 lg:block">
        <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-indigo-500/35 blur-3xl" />
        <div className="absolute bottom-2 right-2 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:bg-slate-900/70 dark:text-indigo-300">
            <Sparkles size={14} /> Premium QR Toolkit
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            Launch beautifully branded QR campaigns in minutes.
          </h1>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            A clean, secure workspace for creating and managing all your QR assets.
          </p>
          <div className="space-y-3">
            {['Beautiful generator UI', 'Mobile-ready dashboard', 'Secure cloud history'].map((item) => (
              <div key={item} className="inline-flex w-full items-center gap-2 rounded-2xl border border-white/50 bg-white/65 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                <ShieldCheck size={15} className="text-indigo-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="p-5 sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="rounded-full bg-indigo-500/15 p-2 text-indigo-600 dark:text-indigo-300">
            {mode === 'signin' ? <LockKeyhole size={18} /> : <QrCode size={18} />}
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{mode === 'signin' ? 'Sign in to QR Forge' : 'Create your QR Forge account'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">Email/password authentication powered by Firebase.</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-secondary w-full"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          <Chrome size={18} />
          {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </button>

        <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          or
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
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

          <button className="btn-primary mt-2 w-full" disabled={loading} type="submit">
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))}
          className="mt-4 text-sm font-medium text-indigo-600 transition hover:opacity-80 dark:text-indigo-300"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </section>
  );
}
