import { Dices } from "lucide-react";

export default function RouletteHeader({ isSpinning }) {
  return (
    <div className="flex flex-col items-center space-y-6 pt-4 text-center animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative group">
        <div
          className={`absolute inset-0 rounded-full bg-violet-600 blur-[60px] transition-all duration-1000 ${
            isSpinning ? "scale-150 opacity-50" : "opacity-20 group-hover:opacity-30"
          }`}
        />
        <div className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-xl">
          <Dices
            size={56}
            className={`text-violet-500 transition-all duration-700 ${isSpinning ? "animate-spin scale-110 text-violet-400" : ""}`}
          />
        </div>
      </div>

      <div className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-2xl md:text-5xl">Roleta</h1>
        <p className="text-sm font-medium tracking-[0.08em] text-zinc-500 md:text-base">
          Deixe o destino escolher o que você vai assistir hoje
        </p>
      </div>
    </div>
  );
}
