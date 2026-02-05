import { QrCode, Sparkles, ShieldCheck } from 'lucide-react';

export default function LandingHero({ onStart }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-indigo-500/20 via-fuchsia-400/10 to-cyan-300/20 p-5 shadow-glass backdrop-blur-xl dark:border-slate-700/60 sm:p-8 lg:p-10">
      <div className="absolute -left-24 top-16 h-56 w-56 animate-pulseGlow rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -right-24 top-0 h-64 w-64 animate-float rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-48 w-48 animate-float rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div className="space-y-6 lg:space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/50 bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-indigo-700 dark:border-indigo-700/60 dark:bg-slate-800/80 dark:text-indigo-300 sm:text-sm">
            <Sparkles size={16} />
            Production-ready QR workflow
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            QR generation that feels as premium as your brand.
          </h1>

          <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300 sm:text-base md:text-lg">
            Create secure, scannable QR codes for web, text, calls, email, Wi-Fi, and maps with a polished builder that looks great on desktop and mobile.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="button" onClick={onStart} className="btn-primary">
              <QrCode size={18} />
              Start Generating
            </button>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 sm:text-sm">
              <ShieldCheck size={16} />
              Backend-powered, validation-first API
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
            {[
              { label: '6 QR formats', value: 'Built in' },
              { label: 'Fast generation', value: '<1s UX' },
              { label: 'Secure history', value: 'Firebase auth' }
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/50 bg-white/65 px-4 py-3 dark:border-slate-700/70 dark:bg-slate-900/70">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[
            'Website URLs',
            'Plain text and notes',
            'Phone and email actions',
            'Wi-Fi onboarding',
            'Google Maps navigation'
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
