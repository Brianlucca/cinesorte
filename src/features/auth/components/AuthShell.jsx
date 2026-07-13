import { Clapperboard, HelpCircle, ShieldCheck } from 'lucide-react';

const POSTER_COLLAGE = [
  {
    src: 'https://image.tmdb.org/t/p/w500/vetwfKSMJ1yqfuI98k6XExu7GFH.jpg',
    className: 'left-[-1%] top-[3%] z-20 h-[51%] w-[36%] -rotate-2',
  },
  {
    src: 'https://image.tmdb.org/t/p/w500/lDqMDI3xpbB9UQRyeXfei0MXhqb.jpg',
    className: 'left-[28%] top-[1%] z-30 h-[51%] w-[35%] rotate-1',
  },
  {
    src: 'https://image.tmdb.org/t/p/w500/tH64gzAHDFg7EFcgfkkZyHdGM5P.jpg',
    className: 'left-[56%] top-[4%] z-40 h-[63%] w-[38%] rotate-2',
  },
  {
    src: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    className: 'left-[0%] top-[43%] z-[35] h-[47%] w-[45%] rotate-[-3deg]',
  },
  {
    src: 'https://image.tmdb.org/t/p/w500/b089YkBDJjOGDQxXkOXBR06Lz2Y.jpg',
    className: 'left-[41%] top-[40%] z-50 h-[45%] w-[30%] rotate-[2deg]',
  },
  {
    src: 'https://image.tmdb.org/t/p/w500/i996T0lI1fGtFEowiH3V6eZthL0.jpg',
    className: 'left-[66%] top-[44%] z-30 h-[47%] w-[34%] -rotate-1',
  },
  {
    src: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    className: 'left-[27%] top-[72%] z-[60] h-[33%] w-[43%] rotate-1',
  },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  onHelp,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(124,58,237,0.12),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(14,165,233,0.055),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1180px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11] shadow-[0_34px_110px_rgba(0,0,0,0.48)] lg:min-h-[690px] lg:grid-cols-[56%_44%]">
          <aside className="relative hidden min-h-[690px] overflow-hidden bg-[#050507] lg:block">
            <div className="absolute inset-0 overflow-hidden bg-[#101014]">
              {POSTER_COLLAGE.map((poster, index) => (
                <div
                  key={poster.src}
                  className={`absolute overflow-hidden border border-white/[0.08] bg-zinc-900 shadow-[0_24px_70px_rgba(0,0,0,0.65)] ${poster.className}`}
                >
                  <img src={poster.src} alt="" className="h-full w-full object-cover object-top" loading={index < 4 ? 'eager' : 'lazy'} />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,11,0.02)_0%,rgba(8,8,11,0.10)_52%,rgba(13,13,17,0.88)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_8%,rgba(124,58,237,0.18),transparent_34%),linear-gradient(0deg,rgba(8,8,11,0.78)_0%,transparent_32%,rgba(8,8,11,0.08)_100%)]" />
          </aside>

          <section className="relative flex min-h-[calc(100vh-3rem)] items-center justify-center border-l border-white/[0.07] bg-[#0d0d11] px-5 py-8 sm:px-8 lg:min-h-[690px] lg:px-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.10),transparent_34%)]" />
            <div className="w-full max-w-[390px] animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="mb-8 flex items-center justify-between gap-4 lg:justify-center">
                <div className="flex items-center gap-3" aria-label="CineSorte">
                  <Clapperboard size={27} strokeWidth={2.25} className="text-violet-400" />
                  <span className="text-2xl font-black tracking-[-0.05em] text-white">
                    Cine<span className="text-violet-400">Sorte</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onHelp}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white lg:hidden"
                  aria-label="Preciso de ajuda"
                >
                  <HelpCircle size={18} />
                </button>
              </div>

              <div className="mb-7 text-center">
                <div className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">
                  {eyebrow}
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white">
                  {title}
                </h2>
                <p className="mx-auto mt-3 max-w-[350px] text-sm font-medium leading-6 text-zinc-400">{description}</p>
              </div>

              <div>{children}</div>

              <div className="mt-5">{footer}</div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                <button
                  type="button"
                  onClick={onHelp}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
                >
                  <HelpCircle size={16} />
                  Preciso de ajuda
                </button>

                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                  <ShieldCheck size={13} />
                  Acesso protegido
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
