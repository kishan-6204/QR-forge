import { useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Zap } from 'lucide-react';
import LandingHero from './components/LandingHero';
import ThemeToggle from './components/ThemeToggle';
import GeneratorCard from './components/GeneratorCard';
import { initialState } from './lib/qrTypes';
import useTheme from './hooks/useTheme';

const withCustomization = (entry) => ({ ...entry, size: 512, darkColor: '#111827' });

const buildState = Object.fromEntries(Object.entries(initialState).map(([k, v]) => [k, withCustomization(v)]));

export default function App() {
  const { darkMode, setDarkMode } = useTheme();
  const [type, setType] = useState('url');
  const [values, setValues] = useState(buildState);
  const [loading, setLoading] = useState(false);
  const [qrImage, setQrImage] = useState('');

  const current = useMemo(() => values[type], [type, values]);

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
      const response = await fetch('/api/generate', {
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
      toast.success('QR code generated successfully!');
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.25),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.18),transparent_26%),radial-gradient(circle_at_50%_70%,rgba(34,211,238,0.16),transparent_30%)]" />

      <Toaster position="top-right" toastOptions={{ duration: 2500 }} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
            <Zap size={16} className="text-indigo-500" /> QR Forge
          </div>
          <ThemeToggle darkMode={darkMode} onToggle={() => setDarkMode((v) => !v)} />
        </header>

        <LandingHero onStart={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })} />

        <GeneratorCard
          type={type}
          setType={setType}
          form={current}
          onFieldChange={handleFieldChange}
          onSubmit={generate}
          loading={loading}
          qrImage={qrImage}
          onDownload={handleDownload}
          onCopy={handleCopy}
        />
      </main>
    </div>
  );
}
