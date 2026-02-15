import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react';

const features = [
  '6 QR formats',
  'Firebase authentication',
  'Download & share',
  'History dashboard',
  'Custom colors',
  'Fast backend'
];

const steps = ['Sign in', 'Choose QR type', 'Download'];

const previewImages = [
  {
    title: 'Dashboard overview',
    src: 'https://placehold.co/1200x760/1e293b/e2e8f0?text=Dashboard+Preview'
  },
  {
    title: 'QR builder form',
    src: 'https://placehold.co/1200x760/312e81/e0e7ff?text=QR+Builder+Preview'
  },
  {
    title: 'Mobile experience',
    src: 'https://placehold.co/1200x760/4c1d95/f5d0fe?text=Mobile+Preview'
  }
];

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="space-y-8 pb-4 sm:space-y-10 lg:space-y-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-white/60 px-6 py-10 shadow-glass backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <div className="absolute -left-16 top-6 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="relative space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/60 bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-indigo-700 dark:border-indigo-700/60 dark:bg-slate-800/80 dark:text-indigo-300 sm:text-sm">
            <Sparkles size={16} />
            QR Forge
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Generate Beautiful QR Codes in Seconds
          </h1>

          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Create QR codes for URLs, WiFi, phone, email & more — instantly.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a href="/auth" className="btn-primary">
              Start Generating
              <ArrowRight size={18} />
            </a>
            <a href="#preview" className="btn-secondary">
              <PlayCircle size={18} />
              View Demo
            </a>
          </div>
        </div>
      </section>

      <section className="glass-card space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Everything you need to create QR codes</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature}
              className="rounded-2xl border border-white/45 bg-white/70 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200"
            >
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                {feature}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-card space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step}
              className="rounded-2xl border border-white/45 bg-white/70 p-5 dark:border-slate-700/70 dark:bg-slate-900/70"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section id="preview" className="glass-card space-y-6 scroll-mt-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Preview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          Explore the polished QR Forge experience before creating your first code.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {previewImages.map((image) => (
            <article
              key={image.title}
              className="overflow-hidden rounded-2xl border border-white/50 bg-white/70 dark:border-slate-700/70 dark:bg-slate-900/70"
            >
              <img src={image.src} alt={image.title} className="h-48 w-full object-cover" loading="lazy" />
              <p className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">{image.title}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="glass-card flex flex-col items-start justify-between gap-3 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center">
        <p>© {year} Kishan Shukla</p>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}