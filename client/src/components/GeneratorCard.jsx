import { Copy, Download, LoaderCircle, WandSparkles } from 'lucide-react';
import { qrTypes } from '../lib/qrTypes';

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export default function GeneratorCard({
  type,
  setType,
  form,
  onFieldChange,
  onSubmit,
  loading,
  qrImage,
  onDownload,
  onCopy
}) {
  const renderFields = () => {
    switch (type) {
      case 'url':
        return (
          <Field label="Website URL">
            <input className="input" placeholder="https://example.com" value={form.url} onChange={(e) => onFieldChange('url', e.target.value)} />
          </Field>
        );
      case 'text':
        return (
          <Field label="Text / Note">
            <textarea className="input min-h-28" placeholder="Write your note here..." value={form.text} onChange={(e) => onFieldChange('text', e.target.value)} />
          </Field>
        );
      case 'phone':
        return (
          <Field label="Phone Number">
            <input className="input" placeholder="+1 555 000 1111" value={form.phone} onChange={(e) => onFieldChange('phone', e.target.value)} />
          </Field>
        );
      case 'email':
        return (
          <div className="grid gap-4">
            <Field label="Email Address">
              <input className="input" placeholder="hello@example.com" value={form.email} onChange={(e) => onFieldChange('email', e.target.value)} />
            </Field>
            <Field label="Subject (optional)">
              <input className="input" placeholder="Quick hello" value={form.subject} onChange={(e) => onFieldChange('subject', e.target.value)} />
            </Field>
            <Field label="Message (optional)">
              <textarea className="input min-h-24" placeholder="Your message" value={form.body} onChange={(e) => onFieldChange('body', e.target.value)} />
            </Field>
          </div>
        );
      case 'wifi':
        return (
          <div className="grid gap-4">
            <Field label="SSID / Network Name">
              <input className="input" placeholder="Office-WiFi" value={form.ssid} onChange={(e) => onFieldChange('ssid', e.target.value)} />
            </Field>
            <Field label="Security Type">
              <select className="input" value={form.security} onChange={(e) => onFieldChange('security', e.target.value)}>
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </Field>
            {form.security !== 'nopass' && (
              <Field label="Password">
                <input className="input" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => onFieldChange('password', e.target.value)} />
              </Field>
            )}
          </div>
        );
      case 'maps':
        return (
          <Field label="Google Maps Link or Query">
            <input className="input" placeholder="Eiffel Tower, Paris" value={form.location} onChange={(e) => onFieldChange('location', e.target.value)} />
          </Field>
        );
      default:
        return null;
    }
  };

  return (
    <section id="generator" className="glass-card">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">QR Generator</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Select a format and generate instantly.</p>
        </div>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {qrTypes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setType(item.key)}
            className={`rounded-2xl border p-3 text-left transition ${
              type === item.key
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'border-slate-200 bg-white/70 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/60'
            }`}
          >
            <p className="font-semibold">{item.label}</p>
            <p className="text-xs opacity-80">{item.hint}</p>
          </button>
        ))}
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        {renderFields()}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="QR Size">
            <select className="input" value={form.size} onChange={(e) => onFieldChange('size', Number(e.target.value))}>
              <option value={256}>256 x 256</option>
              <option value={512}>512 x 512</option>
              <option value={768}>768 x 768</option>
            </select>
          </Field>
          <Field label="QR Color">
            <input className="input h-12 p-2" type="color" value={form.darkColor} onChange={(e) => onFieldChange('darkColor', e.target.value)} />
          </Field>
        </div>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="animate-spin" size={18} /> : <WandSparkles size={18} />}
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      <div className="mt-8 space-y-4 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Preview</h3>

        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-6 dark:border-slate-600">
          {qrImage ? (
            <img src={qrImage} alt="Generated QR" className="w-full max-w-xs rounded-xl bg-white p-2 shadow" />
          ) : (
            <p className="text-sm text-slate-500">Your generated QR code appears here.</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn-secondary" onClick={onDownload} disabled={!qrImage}>
            <Download size={17} /> Download PNG
          </button>
          <button type="button" className="btn-secondary" onClick={onCopy} disabled={!qrImage}>
            <Copy size={17} /> Copy to Clipboard
          </button>
        </div>
      </div>
    </section>
  );
}
