import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Palette, Save, Settings2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage({ darkMode, setDarkMode }) {
  const { profile, profileLoading, updateProfile } = useAuth();
  const [defaultQrColor, setDefaultQrColor] = useState('#111827');
  const [defaultQrSize, setDefaultQrSize] = useState(512);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDefaultQrColor(profile.defaultQrColor || '#111827');
    setDefaultQrSize(profile.defaultQrSize || 512);
  }, [profile]);

  const handleThemeToggle = async () => {
    const nextTheme = darkMode ? 'light' : 'dark';
    const previous = darkMode;
    setDarkMode(!darkMode);
    try {
      await updateProfile({ theme: nextTheme });
      toast.success(`Theme set to ${nextTheme}`);
    } catch (error) {
      setDarkMode(previous);
      toast.error(error.message || 'Failed to update theme');
    }
  };

  const handleSaveDefaults = async () => {
    setSaving(true);
    try {
      await updateProfile({ defaultQrColor, defaultQrSize });
      toast.success('Default QR preferences saved');
    } catch (error) {
      toast.error(error.message || 'Could not save preferences');
    } finally {
      setSaving(false);
    }
  };

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
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300">Tune the workspace to your preferences.</p>
        </div>
        <div className="rounded-full bg-indigo-500/15 p-3 text-indigo-600 dark:text-indigo-300">
          <Settings2 size={18} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-300">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Theme</h3>
              <p className="text-sm text-slate-500 dark:text-slate-300">Switch between light and dark mode.</p>
            </div>
          </div>
          <div className="mt-6">
            <ThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Default QR preferences</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">Applied automatically to new QR codes.</p>

          <div className="mt-6 grid gap-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default QR size</span>
              <select className="input" value={defaultQrSize} onChange={(event) => setDefaultQrSize(Number(event.target.value))}>
                <option value={256}>256 x 256</option>
                <option value={512}>512 x 512</option>
                <option value={768}>768 x 768</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default QR color</span>
              <input
                className="input h-12 p-2"
                type="color"
                value={defaultQrColor}
                onChange={(event) => setDefaultQrColor(event.target.value)}
              />
            </label>
          </div>

          <button type="button" className="btn-primary mt-6 w-full" onClick={handleSaveDefaults} disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving preferences...' : 'Save preferences'}
          </button>
        </div>
      </div>
    </section>
  );
}
