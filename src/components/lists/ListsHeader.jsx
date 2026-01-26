import { Library, Plus } from 'lucide-react';

export default function ListsHeader({ lists, onCreate, children }) {
  const totalItems = lists.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 border-b border-white/5 pb-8 gap-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 mb-2">
              <Library className="text-violet-500" size={36} /> 
              Minhas Coleções
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
              Organize seus filmes e séries favoritos em listas personalizadas.
          </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="bg-zinc-900/50 px-6 py-3 rounded-xl border border-white/5 flex items-center justify-center gap-6 backdrop-blur-sm">
              <div className="text-center">
                  <span className="block text-2xl font-bold text-white">{lists.length}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Listas</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                  <span className="block text-2xl font-bold text-white">
                      {totalItems}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Itens</span>
              </div>
          </div>
          
          <button 
              onClick={onCreate}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-lg shadow-violet-900/20 active:scale-95"
          >
              <Plus size={20} />
              Nova Lista
          </button>

          {children}
      </div>
    </div>
  );
}