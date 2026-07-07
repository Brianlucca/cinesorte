import { Film, HelpCircle, ShieldCheck } from 'lucide-react';

export default function AuthShell({
  eyebrow,
  title,
  description,
  sideTitle,
  sideDescription,
  children,
  footer,
  onHelp,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.12),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.07),transparent_28%)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.78fr)]">
        <aside className="relative hidden min-h-screen overflow-hidden border-r border-white/[0.07] lg:block">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1800&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,11,0.98)_0%,rgba(8,8,11,0.82)_42%,rgba(8,8,11,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#08080b_0%,rgba(8,8,11,0.72)_28%,rgba(8,8,11,0.32)_100%)]" />
          <div className="pointer-events-none absolute -bottom-20 left-[18%] h-80 w-[36rem] rounded-full bg-violet-700/10 blur-[120px]" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between px-10 py-10 xl:px-14">
            <div className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-300/15 bg-violet-500/10 text-violet-200">
                <Film size={21} />
              </span>
              <span className="text-2xl font-black tracking-[-0.03em] text-white">CineSorte</span>
            </div>

            <div className="max-w-xl space-y-6">
              <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.045em] text-white xl:text-6xl">
                {sideTitle}
              </h1>
              <p className="max-w-lg text-base font-medium leading-7 text-zinc-300 xl:text-lg">
                {sideDescription}
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
              <span className="h-px w-10 bg-white/15" />
              CineSorte
            </div>
          </div>
        </aside>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-[520px] animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-violet-300/15 bg-violet-500/10 text-violet-200">
                  <Film size={20} />
                </span>
                <span className="text-xl font-black tracking-[-0.03em] text-white">CineSorte</span>
              </div>
              <button
                type="button"
                onClick={onHelp}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-white"
                aria-label="Preciso de ajuda"
              >
                <HelpCircle size={18} />
              </button>
            </div>

            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.24em] text-violet-400">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
                {eyebrow}
              </div>
              <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">{description}</p>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0d0d11]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-5 md:p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.11),transparent_40%)]" />
              <div className="relative">{children}</div>
            </div>

            <div className="mt-6">{footer}</div>

            <button
              type="button"
              onClick={onHelp}
              className="mx-auto mt-6 hidden items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white lg:flex"
            >
              <HelpCircle size={16} />
              Preciso de ajuda
            </button>

            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700">
              <ShieldCheck size={13} />
              Acesso protegido
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
