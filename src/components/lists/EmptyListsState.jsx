import { Link } from 'react-router-dom';
import { Layers, Plus } from 'lucide-react';

export default function EmptyListsState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-white/[0.01] rounded-[2.5rem] border border-white/5 border-dashed relative overflow-hidden group animate-in zoom-in-95 duration-500 shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5 backdrop-blur-sm">
            <Layers className="text-zinc-600 group-hover:text-violet-400 transition-colors duration-500" size={40} />
        </div>
        <h3 className="text-3xl font-black text-white mb-4 relative z-10 tracking-tight">Sua biblioteca está vazia</h3>
        <p className="text-zinc-500 text-sm font-medium max-w-md text-center mb-10 relative z-10 leading-relaxed">
            Para criar uma lista, navegue pelos filmes ou séries e clique no botão <span className="inline-flex items-center justify-center w-7 h-7 bg-white/10 rounded-lg text-white mx-1 shadow-inner"><Plus size={14}/></span> para adicionar.
        </p>
        <Link to="/app" className="px-10 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200 active:scale-95 relative z-10">
            Explorar Catálogo
        </Link>
    </div>
  );
}