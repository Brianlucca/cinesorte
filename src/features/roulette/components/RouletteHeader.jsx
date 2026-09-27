import { Dices } from "lucide-react";

export default function RouletteHeader({ isSpinning }) {
  return (
    <header className="border-b border-white/[0.06] pb-6 md:pb-8">
      <div className="max-w-3xl">
        <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <Dices size={14} className={`text-violet-400 ${isSpinning ? "animate-spin" : ""}`} />
          Descoberta CineSorte
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-zinc-100 sm:text-4xl">
          Sua próxima história, decidida pela sorte.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
          Escolha o catálogo, ajuste o gênero e deixe a roleta encontrar algo para assistir.
        </p>
      </div>
    </header>
  );
}
