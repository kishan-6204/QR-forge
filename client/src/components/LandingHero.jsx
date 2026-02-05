import { QrCode, Sparkles, ShieldCheck } from 'lucide-react';

export default function LandingHero({ onStart }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-indigo-500/20 via-fuchsia-400/10 to-cyan-300/20 p-8 shadow-glass backdrop-blur-xl dark:border-slate-700/60">
      <div className="absolute -left-24 top-16 h-56 w-56 animate-pulseGlow rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -right-24 top-0 h-64 w-64 animate-float rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/50 bg-white/70 px-4 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-700/60 dark:bg-slate-800/80 dark:text-indigo-300">
            <Sparkles size={16} />
            Production-ready QR workflow
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Forge polished QR codes for every scenario.
          </h1>

          <p className="max-w-xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
            Generate secure, scannable QR codes for websites, text, calls, email, Wi-Fi, and maps. Customize sizes and colors in a modern dashboard.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onStart} className="btn-primary">
              <QrCode size={18} />
              Start Generating
            </button>
            <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <ShieldCheck size={16} />
              Backend-powered, validation-first API
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            'Website URLs',
            'Plain text and notes',
            'Phone and email actions',
            'Wi-Fi onboarding',
            'Google Maps navigation'
          ].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
