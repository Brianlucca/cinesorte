import { Search as SearchIcon, Film, X, User, Sparkles, Tv } from "lucide-react";
import { useSearchLogic } from "../../hooks/useSearchLogic";
import MediaCard from "../ui/MediaCard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const PersonCard = ({ item, onClose }) => (
  <Link
    to={`/app/person/${item.id}`}
    onClick={onClose}
    className="relative group bg-white/[0.02] rounded-[2rem] border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col items-center justify-center p-6 text-center cursor-pointer shadow-xl"
  >
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white/5 group-hover:border-violet-500/50 transition-all duration-500 mb-4 bg-zinc-900 shadow-inner">
      {item.profile_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${item.profile_path}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={item.name}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-700">
          <User size={32} />
        </div>
      )}
    </div>
    <h3 className="font-black text-white text-sm leading-tight group-hover:text-violet-400 transition-colors line-clamp-2 uppercase tracking-tight">
      {item.name}
    </h3>
  </Link>
);

const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="space-y-4 animate-pulse">
        <div className="aspect-[2/3] bg-white/5 rounded-[1.5rem] border border-white/5"></div>
        <div className="h-3 bg-white/5 rounded-full w-3/4 mx-auto"></div>
      </div>
    ))}
  </div>
);

const SUGGESTED_GENRES = [
  { id: 28, name: "Ação" },
  { id: 35, name: "Comédia" },
  { id: 27, name: "Terror" },
  { id: 878, name: "Ficção" },
  { id: 10749, name: "Romance" },
  { id: 16, name: "Animação" },
];

export default function SearchModal({ isOpen, onClose }) {
  const { query, setQuery, results, loading, clearSearch, searchByGenre } = useSearchLogic();
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setIsActive(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setIsActive(false);
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => {
        setIsMounted(false);
        clearSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, clearSearch]);

  if (!isMounted) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-start justify-center pt-10 md:pt-20 px-6 transition-all duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`relative w-full max-w-4xl bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden max-h-[85vh] flex flex-col transition-all duration-500 transform ${isActive ? "scale-100 translate-y-0" : "scale-95 -translate-y-8"}`}>
        
        <div className="p-7 border-b border-white/5 flex items-center gap-5 bg-white/[0.02]">
          <div className="p-2.5 bg-violet-600/20 rounded-xl shadow-inner ml-2">
            <SearchIcon className="w-6 h-6 text-violet-400" />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Pesquisar filmes, séries ou artistas..."
            className="flex-1 bg-transparent text-white text-xl md:text-2xl font-medium focus:outline-none placeholder:text-zinc-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all border border-white/5 mr-2">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {results.map((item) => (
                item.media_type === "person" || (item.profile_path && !item.poster_path) ? (
                  <PersonCard key={item.id} item={item} onClose={onClose} />
                ) : (
                  <div key={item.id} onClick={onClose} className="transition-transform hover:-translate-y-2 duration-300">
                    <MediaCard media={item} />
                  </div>
                )
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="py-24 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-dashed border-white/10">
                <SearchIcon size={32} className="text-zinc-700" />
              </div>
              <p className="text-2xl font-black text-white tracking-tight">Nenhum resultado encontrado</p>
              <p className="text-zinc-500 mt-2 font-medium">Tente buscar por termos mais genéricos.</p>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="grid grid-cols-3 gap-5">
                {[
                  { label: 'Filmes', icon: Film, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                  { label: 'Séries', icon: Tv, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                  { label: 'Artistas', icon: Sparkles, color: 'text-pink-500', bg: 'bg-pink-500/10' }
                ].map((cat, i) => (
                  <div key={i} className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 flex flex-col items-center gap-3 group hover:bg-white/[0.06] hover:scale-105 transition-all cursor-default">
                    <div className={`p-4 ${cat.bg} rounded-2xl shadow-inner`}>
                        <cat.icon className={cat.color} size={28} />
                    </div>
                    <span className="text-white font-black text-xs uppercase tracking-[0.2em]">{cat.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3 px-1">
                  <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                  <h4 className="text-white text-sm font-black uppercase tracking-[0.2em]">Sugestões de Gênero</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {SUGGESTED_GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => searchByGenre(genre.id)}
                      className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm font-black text-zinc-400 hover:border-violet-500/50 hover:text-white hover:bg-violet-600 transition-all active:scale-95 shadow-lg uppercase tracking-wider"
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}