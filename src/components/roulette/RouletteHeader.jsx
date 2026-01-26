import { Dices, Sparkles } from 'lucide-react';

export default function RouletteHeader({ isSpinning }) {
  return (
    <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center relative">
            <div className={`absolute inset-0 bg-violet-600/40 blur-3xl rounded-full transition-all duration-700 ${isSpinning ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
            <div className="relative bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-2xl">
                <Dices size={56} className={`text-violet-500 transition-all duration-1000 ${isSpinning ? 'animate-bounce' : ''}`} />
                {isSpinning && (
                    <div className="absolute -top-2 -right-2">
                        <Sparkles className="text-yellow-400 animate-spin-slow" size={24} />
                    </div>
                )}
            </div>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                Roleta <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Cinematográfica</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                Indeciso sobre o que assistir? Deixe o destino escolher sua próxima grande história.
            </p>
        </div>
    </div>
  );
}