import { Link } from 'react-router-dom';
import { Layers, Plus } from 'lucide-react';

export default function EmptyListsState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
            <Layers className="text-zinc-500 group-hover:text-violet-400 transition-colors" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Sua biblioteca está vazia</h3>
        <p className="text-zinc-400 max-w-md text-center mb-8 relative z-10">
            Para criar uma lista, navegue pelos filmes ou séries e clique no botão <span className="inline-flex items-center justify-center w-6 h-6 bg-zinc-800 rounded text-xs mx-1"><Plus size={14}/></span> para adicionar.
        </p>
        <Link to="/app" className="px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all hover:scale-105 relative z-10">
            Explorar Catálogo
        </Link>
    </div>
  );
}