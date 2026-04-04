import { Dices } from 'lucide-react';

export default function RouletteHeader({ isSpinning }) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative group">
        <div className={`absolute inset-0 bg-violet-600 blur-[60px] rounded-full transition-all duration-1000 ${isSpinning ? 'scale-150 opacity-50' : 'opacity-20 group-hover:opacity-30'}`} />
        <div className="relative p-6 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl">
          <Dices size={56} className={`text-violet-500 transition-all duration-700 ${isSpinning ? 'animate-spin scale-110 text-violet-400' : ''}`} />
        </div>
      </div>
      <div className="max-w-2xl space-y-3">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
          Roleta
        </h1>
        <p className="text-zinc-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
          Deixe o destino escolher o que você vai assistir hoje
        </p>
      </div>
    </div>
  );
}