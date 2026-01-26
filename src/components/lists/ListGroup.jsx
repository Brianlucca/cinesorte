import { Trash2, Film, Edit3, MoreHorizontal, CheckSquare, Share2, Copy, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MediaCard from "../ui/MediaCard";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ListGroup({
  list,
  index,
  onDeleteList,
  onEditList,
  onManageItems,
  onShareList,
  selection,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const backdrops = list.items
    ?.filter(item => item.backdrop_path)
    .slice(0, 4)
    .map(item => `https://image.tmdb.org/t/p/w780${item.backdrop_path}`) || [];

  return (
    <div className="relative rounded-3xl overflow-hidden group/card border border-white/5 shadow-2xl transition-all duration-500">
      
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950" />
        
        {backdrops.length > 0 && (
          <div className={`w-full h-full absolute inset-0 opacity-50 blur-3xl scale-125 saturate-150 grid ${backdrops.length === 1 ? 'grid-cols-1' : 'grid-cols-2 grid-rows-2'}`}>
            {backdrops.map((img, i) => (
              <div key={i} className="relative w-full h-full overflow-hidden">
                 <img
                  src={img}
                  className="w-full h-full object-cover transform scale-150"
                  alt=""
                />
              </div>
            ))}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30" />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex flex-col gap-1.5 mb-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white capitalize tracking-tight leading-none drop-shadow-lg cursor-pointer" onClick={() => navigate(`/app/lists/${user?.username}/${list.id}`)}>
                    {list.name}
                </h2>
                {list.description && (
                    <span className="bg-white/10 backdrop-blur-md text-zinc-100 text-[10px] px-2 py-0.5 rounded border border-white/20 uppercase font-bold tracking-wider shadow-sm">
                    Info
                    </span>
                )}
              </div>
              
              <div className="flex items-center gap-3 text-xs font-medium">
                  {list.clonedFrom && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                          <Copy size={12} />
                          <span>Copiado de <strong className="text-zinc-300">@{list.clonedFrom.owner}</strong></span>
                      </div>
                  )}
                  
                  {(list.savesCount > 0) && (
                      <div className="flex items-center gap-1.5 text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 backdrop-blur-sm">
                          <Bookmark size={12} />
                          <span>{list.savesCount} {list.savesCount === 1 ? 'salvamento' : 'salvamentos'}</span>
                      </div>
                  )}
              </div>
            </div>

            <p className="text-zinc-200 text-sm max-w-lg leading-relaxed drop-shadow-md font-medium text-shadow mt-2">
              {list.description ||
                `${list.items?.length || 0} títulos nesta coleção.`}
            </p>
          </div>

          {!selection.isActive && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-white/10 rounded-xl text-zinc-200 hover:text-white transition-all backdrop-blur-md border border-white/10 hover:border-white/30 shadow-lg"
              >
                <MoreHorizontal size={24} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-64 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/5 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                        setMenuOpen(false);
                        onShareList(list);
                    }}
                    className="w-full text-left px-4 py-3.5 hover:bg-violet-500/20 text-sm font-bold text-violet-400 hover:text-violet-300 flex items-center gap-3 transition-colors border-b border-white/5"
                  >
                    <Share2 size={18} /> Compartilhar no Feed
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditList(list);
                    }}
                    className="w-full text-left px-4 py-3.5 hover:bg-white/5 text-sm font-medium text-zinc-200 flex items-center gap-3 transition-colors border-b border-white/5"
                  >
                    <Edit3 size={18} /> Editar Detalhes
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onManageItems(list.id);
                    }}
                    className="w-full text-left px-4 py-3.5 hover:bg-white/5 text-sm font-medium text-zinc-200 flex items-center gap-3 transition-colors border-b border-white/5"
                  >
                    <CheckSquare size={18} /> Gerenciar Itens
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteList(list.id);
                    }}
                    className="w-full text-left px-4 py-3.5 hover:bg-red-500/10 text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-3 transition-colors"
                  >
                    <Trash2 size={18} /> Excluir Lista
                  </button>
                </div>
              )}

              {menuOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                ></div>
              )}
            </div>
          )}
        </div>

        {!list.items || list.items.length === 0 ? (
          <div className="bg-black/20 border border-white/10 rounded-2xl p-12 text-center border-dashed backdrop-blur-sm">
            <Film className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-300 font-medium">Esta lista está vazia.</p>
            <p className="text-zinc-400 text-sm mt-1">
              Adicione filmes ou séries para começar a personalizar o visual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {list.items.map((item) => {
              const isSelected = selection.items.some(
                (s) => s.listId === list.id && s.mediaId === item.id,
              );

              const canSelect =
                selection.isActive &&
                (selection.activeListId === null ||
                  selection.activeListId === list.id);

              return (
                <div key={item.id} className="relative group/item animate-in fade-in duration-500">
                  {canSelect ? (
                    <div
                      className="cursor-pointer relative h-full select-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        selection.toggleItem(list.id, item.id);
                      }}
                    >
                      <div
                        className={`transition-all duration-200 h-full rounded-xl overflow-hidden shadow-lg ${isSelected ? "opacity-40 scale-95 grayscale" : ""}`}
                      >
                        <div className="pointer-events-none">
                          <MediaCard media={item} />
                        </div>
                      </div>

                      <div
                        className={`absolute inset-0 border-4 rounded-xl pointer-events-none transition-colors z-[55] ${isSelected ? "border-red-500 bg-red-500/10" : "border-transparent group-hover/item:bg-white/10"}`}
                      />

                      <div className="absolute top-2 right-2 z-[60]">
                        {isSelected ? (
                          <div className="bg-red-500 text-white rounded-full p-1.5 shadow-lg scale-110">
                            <Trash2 size={16} />
                          </div>
                        ) : (
                          <div className="bg-black/50 text-white/50 rounded-full p-1.5 border border-white/20 backdrop-blur-sm group-hover/item:text-white group-hover/item:bg-black/70 group-hover/item:border-white/50 transition-all">
                            <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => navigate(`/app/${item.media_type || "movie"}/${item.id}`)}
                      className="block transition-transform hover:scale-105 h-full hover:shadow-2xl hover:shadow-black/50 rounded-xl cursor-pointer"
                    >
                      <MediaCard media={item} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}