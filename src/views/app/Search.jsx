import {
  Search as SearchIcon,
  Film,
  X,
  User,
  Sparkles,
  Tv,
} from "lucide-react";
import { useSearchLogic } from "../../hooks/useSearchLogic";
import MediaCard from "../../components/ui/MediaCard";
import { Link } from "react-router-dom";

const PersonCard = ({ item }) => (
  <Link
    to={`/app/person/${item.id}`}
    className="relative group aspect-[2/3] bg-zinc-900/30 rounded-xl border border-white/5 hover:border-violet-500/50 transition-all hover:-translate-y-1 overflow-hidden flex flex-col items-center justify-center p-4 text-center cursor-pointer shadow-lg hover:shadow-violet-900/20"
  >
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-violet-500 transition-colors shadow-2xl mb-4 bg-zinc-950">
      {item.profile_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w185${item.profile_path}`}
          className="w-full h-full object-cover"
          alt={item.name}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600">
          <User size={40} />
        </div>
      )}
    </div>
    <h3 className="font-bold text-white text-base leading-tight group-hover:text-violet-400 transition-colors line-clamp-2">
      {item.name}
    </h3>
    <div className="mt-2 px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-wider font-bold text-zinc-500 group-hover:text-violet-300 group-hover:bg-violet-500/10 transition-colors">
      {item.known_for_department || "Artista"}
    </div>
  </Link>
);

const SearchHeader = ({ query, setQuery, clearSearch }) => (
  <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
    <div className="space-y-4">
      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
        Explore o{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
          Universo
        </span>
      </h1>
      <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto">
        Busque por seus filmes favoritos, séries do momento ou descubra
        filmografias de atores.
      </p>
    </div>

    <div className="relative w-full group z-20">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 group-focus-within:opacity-100 group-focus-within:blur-md"></div>
      <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl">
        <div className="pl-6 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
          <SearchIcon className="w-6 h-6" />
        </div>
        <input
          type="text"
          autoFocus
          placeholder="Vingadores, Breaking Bad, Wagner Moura..."
          className="w-full bg-transparent text-white px-4 py-5 rounded-2xl text-lg md:text-xl focus:outline-none placeholder:text-zinc-600"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="pr-6 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  </div>
);

const InitialState = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
    {[
      {
        icon: Film,
        title: "Filmes",
        desc: "Busque clássicos ou lançamentos.",
        color: "text-violet-500",
        bg: "bg-violet-500/10",
      },
      {
        icon: Tv,
        title: "Séries",
        desc: "Encontre sua próxima maratona.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
      },
      {
        icon: Sparkles,
        title: "Artistas",
        desc: "Descubra a filmografia dos astros.",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
      },
    ].map((item, idx) => (
      <div
        key={idx}
        className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:bg-zinc-900/50 transition-colors cursor-default group"
      >
        <div
          className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color} mb-4 group-hover:scale-110 transition-transform`}
        >
          <item.icon />
        </div>
        <h3 className="text-white font-bold mb-1">{item.title}</h3>
        <p className="text-sm text-zinc-500">{item.desc}</p>
      </div>
    ))}
  </div>
);

const EmptyState = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-white/5 rounded-3xl bg-zinc-900/30">
    <div className="bg-zinc-900 p-6 rounded-full mb-6 border border-white/5 shadow-inner">
      <Film size={64} className="opacity-30" />
    </div>
    <p className="text-2xl font-bold text-white mb-2">Ops, nada encontrado.</p>
    <p className="text-base text-zinc-400">
      Não encontramos resultados para "
      <span className="text-white">{query}</span>".
    </p>
    <p className="text-sm mt-2 text-zinc-600">
      Verifique a ortografia ou tente outro termo.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="space-y-3 animate-pulse">
        <div className="aspect-[2/3] bg-zinc-900/50 rounded-xl border border-white/5"></div>
        <div className="h-4 bg-zinc-900 rounded w-3/4"></div>
        <div className="h-3 bg-zinc-900 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

export default function Search() {
  const { query, setQuery, results, loading, clearSearch } = useSearchLogic();

  return (
    <div className="min-h-screen animate-in fade-in pb-20 pt-8 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-[1600px] mx-auto space-y-12">
        <SearchHeader
          query={query}
          setQuery={setQuery}
          clearSearch={clearSearch}
        />

        <div className="min-h-[400px]">
          {loading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              {results.map((item) => {
                const isPerson =
                  item.media_type === "person" ||
                  (item.profile_path && !item.poster_path);

                return isPerson ? (
                  <PersonCard key={item.id} item={item} />
                ) : (
                  <MediaCard key={item.id} media={item} />
                );
              })}
            </div>
          ) : query.length > 1 ? (
            <EmptyState query={query} />
          ) : (
            <InitialState />
          )}
        </div>
      </div>
    </div>
  );
}
