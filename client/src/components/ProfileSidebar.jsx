import { useEffect } from 'react';
import { LayoutDashboard, LogOut, QrCode, Settings, Star, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My QR Codes', path: '/my-qrcodes', icon: QrCode },
  { label: 'Favorites', path: '/favorites', icon: Star },
  { label: 'Profile', path: '/profile', icon: UserRound },
  { label: 'Settings', path: '/settings', icon: Settings }
];

const getInitials = (value) => {
  if (!value) return 'QF';
  const parts = value.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function ProfileSidebar({ open, onClose, onNavigate, currentPath }) {
  const { profile, session, signOut } = useAuth();
  const displayName = profile?.name || session?.displayName || session?.email?.split('@')[0] || 'QR Forge User';
  const email = profile?.email || session?.email || '';
  const avatarUrl = profile?.photoURL || session?.photoURL || '';

  useEffect(() => {
    if (!open) return;
    const onEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  const handleNavigate = (path) => {
    onNavigate(path);
    onClose();
  };

  const handleLogout = () => {
    signOut();
    onNavigate('/auth');
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col gap-6 border-l border-slate-200/80 bg-white/95 px-6 py-6 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:border-slate-700 dark:bg-slate-900/95 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-300">Account Center</div>
          <button type="button" className="btn-secondary px-3 py-2" onClick={onClose} aria-label="Close sidebar">
            <X size={16} />
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-sm font-semibold text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-200">
                {getInitials(displayName)}
              </span>
            )}
            <div>
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{email}</p>
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleNavigate(path)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button type="button" className="btn-secondary w-full justify-between" onClick={handleLogout}>
            <span className="flex items-center gap-2">
              <LogOut size={18} /> Logout
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Sign out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
