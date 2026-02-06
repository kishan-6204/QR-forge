import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera, Save, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreApi } from '../lib/firebaseClient';

const formatReadableDate = (value) => {
  if (!value) return 'Not yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, profileLoading, session, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, favorites: 0, lastCreated: '' });

  useEffect(() => {
    setName(profile?.name || session?.displayName || session?.email?.split('@')[0] || '');
    setPhotoURL(profile?.photoURL || session?.photoURL || '');
  }, [profile?.name, profile?.photoURL, session?.displayName, session?.email, session?.photoURL]);

  useEffect(() => {
    if (!session?.idToken) return;
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const docs = await firestoreApi.getQrCodes({ idToken: session.idToken, uid: session.uid });
        const total = docs.length;
        const favorites = docs.filter((entry) => entry.favorite).length;
        const lastCreated = docs[0]?.createdAt || '';
        setStats({ total, favorites, lastCreated });
      } catch (error) {
        toast.error(error.message || 'Could not load account stats');
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [session?.idToken, session?.uid]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), photoURL });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  const statsView = useMemo(() => {
    if (statsLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`stat-skeleton-${index}`} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total QRs" value={stats.total} />
        <StatCard label="Favorites" value={stats.favorites} />
        <StatCard label="Last QR Created" value={formatReadableDate(stats.lastCreated)} />
      </div>
    );
  }, [stats, statsLoading]);

  if (profileLoading && !profile) {
    return (
      <section className="glass-card space-y-6">
        <div className="h-8 w-1/3 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </section>
    );
  }

  return (
    <section className="glass-card space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Manage your public profile and account insights.</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoURL ? (
                <img src={photoURL} alt={name || 'Profile'} className="h-20 w-20 rounded-3xl object-cover shadow-md" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-500/20 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-200">
                  <UserRound size={32} />
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 flex cursor-pointer items-center justify-center rounded-full bg-indigo-500 p-2 text-white shadow-lg">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{profile?.email || session?.email}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Update your display details.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Display name</span>
              <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile photo URL (optional)</span>
              <input className="input" value={photoURL} onChange={(event) => setPhotoURL(event.target.value)} />
            </label>
          </div>

          <button type="button" className="btn-primary mt-6 w-full" onClick={handleSave} disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving changes...' : 'Save changes'}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Account stats</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">Track how your QR library is growing.</p>
          <div className="mt-6">{statsView}</div>
        </div>
      </div>
    </section>
  );
}
