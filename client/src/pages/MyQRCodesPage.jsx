import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Copy, Download, Share2, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreApi } from '../lib/firebaseClient';

const FILTERS = ['all', 'favorites', 'url', 'text', 'phone', 'wifi', 'maps'];

const parseData = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const formatOriginalData = (value) => {
  const parsed = parseData(value);
  if (typeof parsed === 'string') {
    return parsed;
  }

  return JSON.stringify(parsed, null, 2);
};

const formatReadableDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

const normalizeEntry = (entry) => ({
  ...entry,
  title: entry.title?.trim() || 'Untitled QR',
  favorite: Boolean(entry.favorite)
});

function LoadingSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="mb-4 h-48 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="mb-2 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mb-4 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((__, buttonIndex) => (
              <div key={`skeleton-btn-${buttonIndex}`} className="h-10 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyQRCodesPage({ onNavigate }) {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingId, setEditingId] = useState('');
  const [editingTitle, setEditingTitle] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const docs = await firestoreApi.getQrCodes({ idToken: session.idToken, uid: session.uid });
      setItems(docs.map(normalizeEntry));
    } catch (error) {
      toast.error(error.message || 'Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((entry) => {
      const title = (entry.title || 'Untitled QR').toLowerCase();
      const data = String(entry.data || '').toLowerCase();
      const searchMatch = !term || title.includes(term) || data.includes(term);
      if (!searchMatch) {
        return false;
      }

      if (activeFilter === 'all') return true;
      if (activeFilter === 'favorites') return entry.favorite;
      return entry.type === activeFilter;
    });
  }, [items, search, activeFilter]);

  const handleDelete = async (id) => {
    try {
      await firestoreApi.deleteQrCode({ idToken: session.idToken, uid: session.uid, id });
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      toast.success('QR code deleted');
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  const handleDownload = (entry) => {
    const anchor = document.createElement('a');
    anchor.href = entry.image;
    anchor.download = `qr-forge-${entry.type}-${entry.id}.png`;
    anchor.click();
  };

  const handleShare = async (entry) => {
    const shareData = {
      title: entry.title || 'Untitled QR',
      text: `QR Type: ${entry.type}`,
      url: entry.image
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        toast.error('Share action cancelled or unsupported');
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(entry.image || formatOriginalData(entry.data));
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Clipboard not supported in this browser');
    }
  };

  const handleCopyData = async (entry) => {
    try {
      await navigator.clipboard.writeText(formatOriginalData(entry.data));
      toast.success('Original data copied');
    } catch {
      toast.error('Clipboard not supported in this browser');
    }
  };

  const handleFavoriteToggle = async (entry) => {
    const nextFavorite = !entry.favorite;

    setItems((prev) => prev.map((item) => (item.id === entry.id ? { ...item, favorite: nextFavorite } : item)));

    try {
      await firestoreApi.updateQrCode({
        idToken: session.idToken,
        uid: session.uid,
        id: entry.id,
        updates: { favorite: nextFavorite }
      });
      toast.success(nextFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      setItems((prev) => prev.map((item) => (item.id === entry.id ? { ...item, favorite: entry.favorite } : item)));
      toast.error(error.message || 'Could not update favorite');
    }
  };

  const startEditingTitle = (entry) => {
    setEditingId(entry.id);
    setEditingTitle(entry.title || 'Untitled QR');
  };

  const saveTitle = async (entry) => {
    const nextTitle = editingTitle.trim() || 'Untitled QR';
    setEditingId('');

    if (nextTitle === entry.title) {
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === entry.id ? { ...item, title: nextTitle } : item)));

    try {
      await firestoreApi.updateQrCode({
        idToken: session.idToken,
        uid: session.uid,
        id: entry.id,
        updates: { title: nextTitle }
      });
      toast.success('Title updated');
    } catch (error) {
      setItems((prev) => prev.map((item) => (item.id === entry.id ? { ...item, title: entry.title } : item)));
      toast.error(error.message || 'Could not update title');
    }
  };

  const showEmptyLibrary = !loading && items.length === 0;
  const showNoResults = !loading && items.length > 0 && filteredItems.length === 0;

  return (
    <section className="glass-card space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">My QR Codes</h2>
        <button type="button" className="btn-secondary" onClick={() => onNavigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <input
          className="input"
          placeholder="Search by title or data"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.charAt(0).toUpperCase() + filter.slice(1)}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                activeFilter === filter
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                  : 'border-slate-300/80 bg-white/80 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeletons />
      ) : showEmptyLibrary ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <div className="mb-4 text-5xl">🧭</div>
          <h3 className="text-xl font-semibold">Create your first QR code 🚀</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Your personal QR library will appear here once you generate a code.</p>
          <button type="button" className="btn-primary mt-6" onClick={() => onNavigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      ) : showNoResults ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          No QR codes matched your current search/filter.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((entry) => (
            <article
              key={entry.id}
              className="group rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="relative mb-3 rounded-xl bg-white p-2">
                <img src={entry.image} alt={`QR ${entry.type}`} className="w-full rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleFavoriteToggle(entry)}
                  className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-500 transition hover:text-amber-500 dark:border-slate-700 dark:bg-slate-900/80"
                >
                  <Star size={16} className={entry.favorite ? 'fill-amber-400 text-amber-500' : ''} />
                </button>
              </div>

              {editingId === entry.id ? (
                <input
                  className="input py-2 text-base font-semibold"
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => saveTitle(entry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveTitle(entry);
                    }
                    if (e.key === 'Escape') {
                      setEditingId('');
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="text-left text-lg font-semibold text-slate-800 transition hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-300"
                  onClick={() => startEditingTitle(entry)}
                >
                  {entry.title || 'Untitled QR'}
                </button>
              )}

              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-indigo-500">{entry.type}</p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{formatOriginalData(entry.data)}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Created {formatReadableDate(entry.createdAt)}</p>

              <div className="mt-4 grid grid-cols-5 gap-2">
                <button type="button" className="btn-secondary" onClick={() => handleDownload(entry)} title="Download QR">
                  <Download size={14} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleShare(entry)} title="Share QR">
                  <Share2 size={14} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleCopyData(entry)} title="Copy original data">
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleFavoriteToggle(entry)}
                  title={entry.favorite ? 'Remove favorite' : 'Add favorite'}
                >
                  <Star size={14} className={entry.favorite ? 'fill-amber-400 text-amber-500' : ''} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleDelete(entry.id)} title="Delete QR">
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
