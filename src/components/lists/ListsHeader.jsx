import { Library, Plus } from 'lucide-react';

export default function ListsHeader({ lists, onCreate, children }) {
  const totalItems = lists.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 border-b border-white/5 pb-10 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 mb-3 tracking-tighter">
              <div className="p-3 bg-violet-600/10 rounded-2xl border border-violet-500/20 shadow-inner">
                <Library className="text-violet-500" size={32} /> 
              </div>
              Minhas Coleções
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-bold uppercase tracking-widest max-w-2xl">
              Organize seus filmes e séries favoritos.
          </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 w-full xl:w-auto">
          <div className="bg-white/[0.02] px-8 py-4 rounded-[1.5rem] border border-white/5 flex items-center justify-center gap-8 backdrop-blur-xl shadow-inner">
              <div className="text-center">
                  <span className="block text-2xl font-black text-white drop-shadow-md">{lists.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1 block">Listas</span>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                  <span className="block text-2xl font-black text-white drop-shadow-md">
                      {totalItems}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mt-1 block">Itens</span>
              </div>
          </div>
          
          <button 
              onClick={onCreate}
              className="px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 border border-transparent hover:border-white/10 group"
          >
              <div className="bg-black/20 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              Nova Lista
          </button>

          {children}
      </div>
    </div>
  );
}