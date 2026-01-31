import { Search as SearchIcon, Film, X, User, Sparkles, Tv } from "lucide-react";
import { useSearchLogic } from "../../hooks/useSearchLogic";
import MediaCard from "../ui/MediaCard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const PersonCard = ({ item, onClose }) => (
  <Link
    to={`/app/person/${item.id}`}
    onClick={onClose}
    className="relative group aspect-[2/3] bg-zinc-900/30 rounded-xl border border-white/5 hover:border-violet-500/50 transition-all hover:-translate-y-1 overflow-hidden flex flex-col items-center justify-center p-4 text-center cursor-pointer shadow-lg"
  >
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-violet-500 transition-colors mb-3 bg-zinc-950">
      {item.profile_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${item.profile_path}`}
          className="w-full h-full object-cover"
          alt={item.name}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600">
          <User size={32} />
        </div>
      )}
    </div>
    <h3 className="font-bold text-white text-sm leading-tight group-hover:text-violet-400 transition-colors line-clamp-2">
      {item.name}
    </h3>
  </Link>
);

const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="space-y-3 animate-pulse">
        <div className="aspect-[2/3] bg-zinc-800/50 rounded-xl border border-white/5"></div>
        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
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
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div className={`fixed inset-0 z-[999] flex items-start justify-center pt-4 md:pt-20 px-4 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col transition-all duration-300 transform ${isActive ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"}`}>
        <div className="p-6 border-b border-white/10 flex items-center gap-4">
          <SearchIcon className="w-6 h-6 text-violet-500" />
          <input
            autoFocus
            type="text"
            placeholder="O que você quer assistir hoje?"
            className="flex-1 bg-transparent text-white text-xl focus:outline-none placeholder:text-zinc-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
          {loading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((item) => (
                item.media_type === "person" || (item.profile_path && !item.poster_path) ? (
                  <PersonCard key={item.id} item={item} onClose={onClose} />
                ) : (
                  <div key={item.id} onClick={onClose}>
                    <MediaCard media={item} />
                  </div>
                )
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="py-20 text-center text-zinc-500">
              <p className="text-xl font-bold text-white">Nenhum resultado encontrado</p>
              <p className="text-sm">Tente buscar por termos mais genéricos.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                  <Film className="text-violet-500 mb-2" />
                  <span className="text-white font-medium text-sm">Filmes</span>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                  <Tv className="text-indigo-500 mb-2" />
                  <span className="text-white font-medium text-sm">Séries</span>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                  <Sparkles className="text-pink-500 mb-2" />
                  <span className="text-white font-medium text-sm">Artistas</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-1">Sugestões de Gênero</h4>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => searchByGenre(genre.id)}
                      className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-full text-sm text-zinc-300 hover:border-violet-500/50 hover:text-white hover:bg-zinc-800 transition-all active:scale-95"
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