import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { List, Zap } from 'lucide-react';
import LandingHero from '../components/LandingHero';
import GeneratorCard from '../components/GeneratorCard';
import { initialState } from '../lib/qrTypes';
import { useAuth } from '../context/AuthContext';
import { firestoreApi } from '../lib/firebaseClient';

const withCustomization = (entry, defaults) => ({ ...entry, size: defaults.size, darkColor: defaults.color });
const buildState = (defaults) =>
  Object.fromEntries(Object.entries(initialState).map(([k, v]) => [k, withCustomization(v, defaults)]));

export default function DashboardPage({ onNavigate }) {
  const { session, profile } = useAuth();
  const defaults = useMemo(
    () => ({
      size: profile?.defaultQrSize || 512,
      color: profile?.defaultQrColor || '#111827'
    }),
    [profile?.defaultQrColor, profile?.defaultQrSize]
  );
  const [type, setType] = useState('url');
  const [values, setValues] = useState(() => buildState(defaults));
  const [qrTitle, setQrTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState('');

  const current = useMemo(() => values[type], [type, values]);

  useEffect(() => {
    setValues((prev) => {
      const next = { ...prev };
      Object.keys(initialState).forEach((key) => {
        next[key] = {
          ...prev[key],
          size: defaults.size,
          darkColor: defaults.color
        };
      });
      return next;
    });
  }, [defaults.color, defaults.size]);

  const handleFieldChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const generate = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { size, darkColor, ...data } = current;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          options: { size, darkColor, lightColor: '#ffffff' }
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Could not generate QR code');
      }

      setQrImage(payload.image);

      const entry = {
        id: crypto.randomUUID(),
        title: qrTitle.trim() || 'Untitled QR',
        type,
        data: JSON.stringify(data),
        image: payload.image,
        createdAt: new Date().toISOString(),
        favorite: false
      };

      await firestoreApi.saveQrCode({
        idToken: session.idToken,
        uid: session.uid,
        entry
      });

      setQrTitle('');

      toast.success('QR code generated and saved!');
    } catch (error) {
      toast.error(error.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrImage) return;
    const anchor = document.createElement('a');
    anchor.href = qrImage;
    anchor.download = `qr-forge-${type}.png`;
    anchor.click();
    toast.success('Download started');
  };

  const handleCopy = async () => {
    if (!qrImage) return;

    try {
      const blob = await (await fetch(qrImage)).blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      toast.success('QR image copied to clipboard');
    } catch {
      toast.error('Clipboard copy not supported in this browser');
    }
  };

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
          <Zap size={16} className="text-indigo-500" /> QR Forge Dashboard
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
          <button type="button" className="btn-secondary col-span-2 sm:col-auto" onClick={() => onNavigate('/my-qrcodes')}>
            <List size={16} /> My QR Codes
          </button>
        </div>
      </header>

      <LandingHero onStart={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })} />

      <GeneratorCard
        type={type}
        setType={setType}
        form={current}
        onFieldChange={handleFieldChange}
        onSubmit={generate}
        loading={loading}
        qrTitle={qrTitle}
        onTitleChange={setQrTitle}
        qrImage={qrImage}
        onDownload={handleDownload}
        onCopy={handleCopy}
      />
    </>
  );
}
