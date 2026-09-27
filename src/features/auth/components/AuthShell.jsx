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
    <div className="min-h-screen bg-[#111216] px-4 py-4 text-white sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1240px] items-center justify-center sm:min-h-[calc(100vh-3rem)]">
        <div className="grid w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] lg:min-h-[700px] lg:grid-cols-[52%_48%]">
          <aside className="relative hidden min-h-[700px] overflow-hidden bg-[#111216] lg:block">
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
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,22,0.08)_0%,rgba(17,18,22,0.18)_52%,#181a20_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,18,22,0.96)_0%,rgba(17,18,22,0.16)_56%,rgba(17,18,22,0.05)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 z-[70] p-10 xl:p-12">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Sua história começa aqui</span>
              <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-[-0.035em] text-white">Descubra, registre e compartilhe o que vale assistir.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">Um espaço para suas listas, reviews e conversas sobre cinema e televisão.</p>
            </div>
          </aside>

          <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center bg-[#181a20] px-5 py-8 sm:min-h-[calc(100vh-3rem)] sm:px-10 lg:min-h-[700px] lg:border-l lg:border-white/[0.06] lg:px-14">
            <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="mb-9 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3" aria-label="CineSorte">
                  <Clapperboard size={27} strokeWidth={2.25} className="text-violet-400" />
                  <span className="text-xl font-semibold tracking-[-0.04em] text-white">
                    Cine<span className="text-violet-400">Sorte</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onHelp}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
                  aria-label="Preciso de ajuda"
                >
                  <HelpCircle size={18} />
                </button>
              </div>

              <div className="mb-7 text-left">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                  {eyebrow}
                </div>
                <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-[390px] text-sm leading-6 text-zinc-400">{description}</p>
              </div>

              <div>{children}</div>

              <div className="mt-5">{footer}</div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                <button
                  type="button"
                  onClick={onHelp}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-white"
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
