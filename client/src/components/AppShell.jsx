import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from './ProfileSidebar';

const getInitials = (value) => {
  if (!value) return 'QF';
  const parts = value.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function AppShell({ children, onNavigate, currentPath }) {
  const { profile, session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = useMemo(() => {
    return profile?.name || session?.displayName || session?.email?.split('@')[0] || 'QR Forge User';
  }, [profile?.name, session?.displayName, session?.email]);

  const avatarUrl = profile?.photoURL || session?.photoURL || '';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/70 px-4 py-4 shadow-glass backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-indigo-500/30 dark:bg-slate-900/60 dark:text-indigo-200"
        >
          <span className="text-lg">⚡</span> QR Forge
        </button>

        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary hidden sm:inline-flex" onClick={() => onNavigate('/my-qrcodes')}>
            My QR Codes
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-200">
                {getInitials(displayName)}
              </span>
            )}
            <span className="hidden sm:flex sm:items-center sm:gap-1">
              {displayName}
              <ChevronDown size={16} className="opacity-70" />
            </span>
          </button>
        </div>
      </header>

      {children}

      <ProfileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        currentPath={currentPath}
      />
    </div>
  );
}
