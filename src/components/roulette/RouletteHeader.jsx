import { Dices } from 'lucide-react';

export default function RouletteHeader({ isSpinning }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="relative">
        <div className={`absolute inset-0 bg-violet-600 blur-3xl opacity-20 transition-all duration-1000 ${isSpinning ? 'scale-150 opacity-40' : ''}`} />
        <div className="relative p-5 bg-zinc-900 rounded-3xl border border-white/5 shadow-2xl">
          <Dices size={48} className={`text-violet-500 ${isSpinning ? 'animate-bounce' : ''}`} />
        </div>
      </div>
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
          Roleta
        </h1>
        <p className="text-zinc-400 font-medium">Deixe o destino escolher o que você vai assistir hoje.</p>
      </div>
    </div>
  );
}