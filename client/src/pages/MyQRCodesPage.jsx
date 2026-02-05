import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Share2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { firestoreApi } from '../lib/firebaseClient';

const parseData = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export default function MyQRCodesPage({ onNavigate }) {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    try {
      const docs = await firestoreApi.getQrCodes({ idToken: session.idToken, uid: session.uid });
      setItems(docs);
    } catch (error) {
      toast.error(error.message || 'Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

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
      title: 'QR Forge Code',
      text: `QR Type: ${entry.type}`,
      url: entry.image
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(entry.image);
        toast.success('Share link copied to clipboard');
      }
    } catch {
      toast.error('Share action cancelled or unsupported');
    }
  };

  return (
    <section className="glass-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">My QR Codes</h2>
        <button type="button" className="btn-secondary" onClick={() => onNavigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading your QR history...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No QR codes saved yet. Generate one from your dashboard.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <img src={entry.image} alt={`QR ${entry.type}`} className="mb-3 w-full rounded-xl bg-white p-2" />
              <p className="text-sm font-semibold capitalize">Type: {entry.type}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-300">Data: {JSON.stringify(parseData(entry.data))}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{new Date(entry.createdAt).toLocaleString()}</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" className="btn-secondary" onClick={() => handleDownload(entry)}>
                  <Download size={14} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleShare(entry)}>
                  <Share2 size={14} />
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleDelete(entry.id)}>
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
