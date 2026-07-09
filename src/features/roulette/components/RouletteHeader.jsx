import { Dices, Sparkles } from "lucide-react";

export default function RouletteHeader({ isSpinning }) {
  return (
    <header className="border-b border-white/[0.07] pb-6 md:pb-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-400">
            <span className="grid h-6 w-6 place-items-center rounded-lg border border-violet-400/15 bg-violet-500/10">
              <Dices size={13} className={isSpinning ? "animate-spin" : ""} />
            </span>
            Roleta CineSorte
          </div>
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">Roleta</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
            Escolha a origem, refine por gênero e deixe o próximo título sair no sorteio.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-500/10 px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.1em] text-cyan-200">
          <Sparkles size={13} />
          Modo descoberta
        </span>
      </div>
    </header>
  );
}
