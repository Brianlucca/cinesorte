import { Trash2, Film, Edit3, MoreHorizontal, CheckSquare, Share2, Copy, Bookmark, Calendar, User, ArrowRight } from "lucide-react";
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  };

  return (
    <div className="relative rounded-[2.5rem] overflow-hidden group/card border border-white/5 shadow-2xl transition-all duration-500 bg-zinc-950 animate-in fade-in duration-500">
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        
        {backdrops.length > 0 && (
          <div className={`w-full h-full absolute inset-0 opacity-40 blur-3xl scale-110 saturate-150 grid ${backdrops.length === 1 ? 'grid-cols-1' : 'grid-cols-2 grid-rows-2'}`}>
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

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
      </div>

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex justify-between items-start gap-6 mb-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-4xl md:text-5xl font-black text-white capitalize tracking-tighter leading-tight drop-shadow-2xl break-words line-clamp-2 pb-2">
                {list.name}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold uppercase tracking-widest">
                {list.description && (
                    <span className="bg-white/10 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                      Info
                    </span>
                )}

                {list.clonedFrom && (
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
                        <User size={12} className="text-zinc-500" />
                        <span className="text-zinc-400">Autor: <strong className="text-white">@{list.clonedFrom.owner}</strong></span>
                    </div>
                )}

                {list.updatedAt && (
                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
                        <Calendar size={12} className="text-zinc-500" />
                        <span className="text-zinc-400">Atualizada: <strong className="text-white">{formatDate(list.updatedAt)}</strong></span>
                    </div>
                )}
                
                {(list.savesCount > 0) && (
                    <div className="flex items-center gap-1.5 text-violet-400 bg-violet-600/20 px-3 py-1.5 rounded-lg border border-violet-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                        <Bookmark size={12} />
                        <span>{list.savesCount} {list.savesCount === 1 ? 'salvamento' : 'salvamentos'}</span>
                    </div>
                )}
            </div>

            <button
              onClick={() => navigate(`/app/lists/${user?.username}/${list.id}`)}
              className="mt-6 px-6 py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 w-full sm:w-fit"
            >
              Acessar Coleção <ArrowRight size={16} />
            </button>

            <p className="text-zinc-300 text-sm md:text-base max-w-3xl leading-relaxed drop-shadow-lg font-medium mt-6 line-clamp-2">
              {list.description ||
                `${list.items?.length || 0} títulos nesta coleção. Comece a explorar.`}
            </p>


          </div>

          {!selection.isActive && (
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-300 hover:text-white transition-all backdrop-blur-xl border border-white/5 shadow-xl active:scale-95"
              >
                <MoreHorizontal size={24} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-16 w-64 bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => {
                        setMenuOpen(false);
                        onShareList(list);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-white/5 text-xs font-black uppercase tracking-widest text-white flex items-center gap-4 transition-colors border-b border-white/5 group"
                  >
                    <Share2 size={16} className="text-zinc-500 group-hover:text-white transition-colors" /> Compartilhar
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEditList(list);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-white/5 text-xs font-black uppercase tracking-widest text-white flex items-center gap-4 transition-colors border-b border-white/5 group"
                  >
                    <Edit3 size={16} className="text-zinc-500 group-hover:text-white transition-colors" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onManageItems(list.id);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-white/5 text-xs font-black uppercase tracking-widest text-white flex items-center gap-4 transition-colors border-b border-white/5 group"
                  >
                    <CheckSquare size={16} className="text-zinc-500 group-hover:text-white transition-colors" /> Gerenciar Itens
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteList(list.id);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center gap-4 transition-colors group"
                  >
                    <Trash2 size={16} className="text-red-500/50 group-hover:text-red-400 transition-colors" /> Excluir
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
          <div className="bg-black/30 border border-white/5 rounded-3xl p-16 text-center border-dashed backdrop-blur-md shadow-inner">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/5">
                <Film className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-white font-black text-lg tracking-tight mb-1">Coleção Vazia</p>
            <p className="text-zinc-500 text-sm font-medium">
              Adicione filmes ou séries para ver a mágica acontecer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {list.items.map((item) => {
              const isSelected = selection.items.some(
                (s) => s.listId === list.id && s.mediaId === item.id,
              );

              const canSelect =
                selection.isActive &&
                (selection.activeListId === null ||
                  selection.activeListId === list.id);

              return (
                <div key={item.id} className="relative group/item animate-in fade-in zoom-in-95 duration-500">
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
                        className={`transition-all duration-300 h-full rounded-2xl overflow-hidden shadow-xl ${isSelected ? "opacity-30 scale-95 grayscale" : "hover:scale-105"}`}
                      >
                        <div className="pointer-events-none">
                          <MediaCard media={item} />
                        </div>
                      </div>

                      <div
                        className={`absolute inset-0 border-4 rounded-2xl pointer-events-none transition-all z-[55] ${isSelected ? "border-red-500 bg-red-500/20" : "border-transparent group-hover/item:border-white/10"}`}
                      />

                      <div className="absolute top-3 right-3 z-[60]">
                        {isSelected ? (
                          <div className="bg-red-500 text-white rounded-xl p-2 shadow-lg scale-110">
                            <Trash2 size={16} />
                          </div>
                        ) : (
                          <div className="bg-black/60 text-white/50 rounded-xl p-2 border border-white/20 backdrop-blur-md group-hover/item:text-white group-hover/item:bg-white/10 group-hover/item:border-white/50 transition-all shadow-lg">
                            <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => navigate(`/app/${item.media_type || "movie"}/${item.id}`)}
                      className="block transition-transform duration-500 hover:-translate-y-2 h-full hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] rounded-2xl cursor-pointer"
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