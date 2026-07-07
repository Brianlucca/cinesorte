import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Clapperboard,
  Film,
  Hash,
  Search as SearchIcon,
  Sparkles,
  Star,
  Tv,
  User,
  X,
} from "lucide-react";
import { getDiscover } from "@shared/api/api";
import { useSearchLogic } from "@shared/hooks/useSearchLogic";

const ARTWORK_ROTATION_MS = 10 * 60 * 1000;

const SUGGESTED_GENRES = [
  {
    id: 28,
    name: "Ação",
    description: "Ritmo e adrenalina",
    tone: "from-orange-500/30 via-orange-400/10",
    mediaType: "movie",
  },
  {
    id: 35,
    name: "Comédia",
    description: "Histórias para respirar",
    tone: "from-amber-400/30 via-yellow-300/10",
    mediaType: "movie",
  },
  {
    id: 27,
    name: "Terror",
    description: "Para assistir no escuro",
    tone: "from-red-600/30 via-rose-400/10",
    mediaType: "movie",
  },
  {
    id: 878,
    name: "Ficção",
    description: "Além do que conhecemos",
    tone: "from-sky-500/30 via-cyan-300/10",
    mediaType: "movie",
  },
  {
    id: 10749,
    name: "Romance",
    description: "Encontros que ficam",
    tone: "from-pink-500/30 via-fuchsia-300/10",
    mediaType: "movie",
  },
  {
    id: 16,
    name: "Animação",
    description: "Mundos sem limites",
    tone: "from-violet-500/30 via-indigo-300/10",
    mediaType: "movie",
  },
];

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "movie", label: "Filmes" },
  { id: "tv", label: "Séries" },
  { id: "person", label: "Artistas" },
];

const QUICK_CATEGORIES = [
  {
    id: "movie",
    label: "Filmes",
    description: "Do clássico à estreia",
    icon: Film,
    tone: "text-violet-200",
    overlay: "from-violet-500/55 via-violet-500/10",
  },
  {
    id: "tv",
    label: "Séries",
    description: "Uma temporada de cada vez",
    icon: Tv,
    tone: "text-cyan-200",
    overlay: "from-cyan-500/55 via-cyan-500/10",
  },
  {
    id: "person",
    label: "Artistas",
    description: "Elencos e trajetórias",
    icon: User,
    tone: "text-rose-200",
    overlay: "from-rose-500/55 via-rose-500/10",
  },
];

const getType = (item) => {
  if (item.media_type) return item.media_type;
  if (item.profile_path && !item.poster_path) return "person";
  return item.title ? "movie" : "tv";
};

const getYear = (item) =>
  (item.release_date || item.first_air_date || "").toString().split("-")[0];

function SearchResultCard({ item, onClose }) {
  const type = getType(item);
  const isPerson = type === "person";
  const title = item.title || item.name;
  const imagePath = isPerson ? item.profile_path : item.poster_path;
  const route = isPerson ? `/app/person/${item.id}` : `/app/${type}/${item.id}`;
  const knownFor =
    item.known_for_department ||
    item.known_for
      ?.slice(0, 2)
      .map((work) => work.title || work.name)
      .filter(Boolean)
      .join(" · ");

  return (
    <Link
      to={route}
      onClick={onClose}
      className="group min-w-0 overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-white/[0.025] transition-all duration-500 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.045]"
    >
      <div
        className={`relative overflow-hidden bg-zinc-900 ${
          isPerson ? "aspect-[4/5]" : "aspect-[2/3]"
        }`}
      >
        {imagePath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${imagePath}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            alt={title}
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">
            {isPerson ? <User size={30} /> : <Film size={30} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10 opacity-70" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-xl">
          {isPerson ? "Artista" : type === "tv" ? "Série" : "Filme"}
        </span>
        {!isPerson && item.vote_average > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-yellow-300/15 bg-black/40 px-2.5 py-1 text-[9px] font-black text-yellow-300 backdrop-blur-xl">
            <Star size={9} className="fill-current" />
            {Number(item.vote_average).toFixed(1)}
          </span>
        )}
        <ArrowUpRight
          size={17}
          className="absolute bottom-3 right-3 translate-y-2 text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
        />
      </div>

      <div className="p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-black leading-5 tracking-[-0.015em] text-zinc-100 transition-colors group-hover:text-violet-200">
          {title}
        </h3>
        <p className="mt-2 truncate text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-600">
          {isPerson
            ? knownFor || "Cinema e televisão"
            : getYear(item) || "Ano não informado"}
        </p>
      </div>
    </Link>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-[1.4rem] border border-white/[0.05] bg-white/[0.02]"
        >
          <div className="aspect-[2/3] bg-white/[0.045]" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-4/5 rounded-full bg-white/[0.05]" />
            <div className="h-2 w-2/5 rounded-full bg-white/[0.035]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchModal({ isOpen, onClose }) {
  const {
    query,
    setQuery,
    results,
    loading,
    clearSearch,
    searchByGenre,
    searchByCategory,
  } = useSearchLogic();

  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [filter, setFilter] = useState("all");
  const [activeGenre, setActiveGenre] = useState("");
  const [genreArtworkPool, setGenreArtworkPool] = useState({});
  const [rotationBucket, setRotationBucket] = useState(
    Math.floor(Date.now() / ARTWORK_ROTATION_MS),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRotationBucket(Math.floor(Date.now() / ARTWORK_ROTATION_MS));
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      const timer = window.setTimeout(() => {
        setIsMounted(false);
        clearSearch();
        setFilter("all");
        setActiveGenre("");
      }, 400);
      return () => window.clearTimeout(timer);
    }

    setIsMounted(true);
    const timer = window.setTimeout(() => setIsActive(true), 10);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, clearSearch, onClose]);

  useEffect(() => {
    if (!isOpen || Object.keys(genreArtworkPool).length > 0) return;

    let cancelled = false;

    const loadGenreArtwork = async () => {
      try {
        const artworks = await Promise.all(
          SUGGESTED_GENRES.map(async (genre) => {
            const data = await getDiscover({
              media_type: genre.mediaType,
              with_genres: genre.id,
              sort_by: "popularity.desc",
              "vote_count.gte": 80,
            });

            const items = (Array.isArray(data) ? data : [])
              .filter((item) => item.backdrop_path || item.poster_path)
              .slice(0, 8)
              .map((item) => ({
                image: item.backdrop_path || item.poster_path,
                title: item.title || item.name || genre.name,
              }));

            return [genre.id, items];
          }),
        );

        if (!cancelled) {
          setGenreArtworkPool(
            Object.fromEntries(artworks.filter(([, value]) => value.length > 0)),
          );
        }
      } catch {
        if (!cancelled) setGenreArtworkPool({});
      }
    };

    loadGenreArtwork();

    return () => {
      cancelled = true;
    };
  }, [genreArtworkPool, isOpen]);

  const activeGenreArtwork = useMemo(() => {
    return Object.fromEntries(
      Object.entries(genreArtworkPool).map(([genreId, items]) => {
        if (!items.length) return [genreId, null];
        return [genreId, items[rotationBucket % items.length]];
      }),
    );
  }, [genreArtworkPool, rotationBucket]);

  const filteredResults = useMemo(
    () => results.filter((item) => filter === "all" || getType(item) === filter),
    [filter, results],
  );

  const atmosphere = results.find((item) => item.backdrop_path)?.backdrop_path;

  const handleQueryChange = (value) => {
    setQuery(value);
    setActiveGenre("");
    setFilter("all");
  };

  const handleGenre = (genre) => {
    setActiveGenre(genre.name);
    setFilter("all");
    searchByGenre(genre.id);
  };

  const handleCategory = (categoryId) => {
    setActiveGenre("");
    setFilter(categoryId === "person" ? "person" : "all");
    searchByCategory(categoryId);
  };

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end justify-center transition-opacity duration-400 sm:items-center sm:p-5 ${
        isActive ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Fechar busca"
        className="absolute inset-0 cursor-default bg-black/85 backdrop-blur-xl"
        onClick={onClose}
      />

      <section
        className={`relative flex max-h-[94svh] min-h-[72svh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#0b0b0e]/98 shadow-[0_40px_120px_rgba(0,0,0,0.75)] backdrop-blur-2xl transition-all duration-500 sm:rounded-[2rem] ${
          isActive ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.985]"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.006)_28%,transparent_55%,rgba(0,0,0,0.18)_100%)]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {atmosphere && (
            <img
              src={`https://image.tmdb.org/t/p/w1280${atmosphere}`}
              className="h-full w-full scale-110 object-cover opacity-[0.02] grayscale blur-2xl"
              alt=""
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,19,0.20),rgba(10,10,13,0.12)_45%,rgba(5,5,7,0.06)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-[linear-gradient(180deg,transparent,rgba(8,8,11,0.1))]" />
        </div>

        <header className="relative shrink-0 border-b border-white/[0.07] bg-transparent px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center text-violet-400">
                <Clapperboard size={21} />
              </span>
              <div>
                <h2 className="text-sm font-black text-white sm:text-base">
                  Explorar CineSorte
                </h2>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                  Filmes, séries e pessoas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-500 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="group relative">
            <SearchIcon
              size={21}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-300 sm:left-5"
            />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Busque uma história, uma série ou alguém do elenco..."
              className="w-full rounded-[1.25rem] border border-white/[0.09] bg-black/25 py-4 pl-12 pr-12 text-sm font-semibold text-white outline-none transition-all placeholder:font-normal placeholder:text-zinc-600 focus:border-violet-400/30 focus:bg-black/35 sm:py-5 sm:pl-14 sm:text-lg"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-zinc-600 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </header>

        <div className="content-scrollbar relative min-h-0 flex-1 overflow-y-auto bg-transparent px-5 py-6 sm:px-7 sm:py-7">
          {loading ? (
            <LoadingState />
          ) : results.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">
                    {activeGenre ? "Seleção por gênero" : "Resultados da busca"}
                  </span>
                  <h3 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
                    {activeGenre ||
                      (query
                        ? `Encontramos ${results.length} resultados`
                        : "Descobertas para você")}
                  </h3>
                </div>
                <div className="scrollbar-hide flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white/[0.07] bg-black/20 p-1">
                  {FILTERS.map((item) => {
                    const count =
                      item.id === "all"
                        ? results.length
                        : results.filter((result) => getType(result) === item.id).length;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFilter(item.id)}
                        className={`shrink-0 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition-colors ${
                          filter === item.id
                            ? "bg-white text-zinc-950"
                            : "text-zinc-500 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {item.label}{" "}
                        <span className={filter === item.id ? "text-zinc-500" : "text-zinc-700"}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredResults.map((item) => (
                    <SearchResultCard
                      key={`${getType(item)}-${item.id}`}
                      item={item}
                      onClose={onClose}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid min-h-64 place-items-center rounded-[1.75rem] border border-dashed border-white/[0.08] bg-white/[0.015] text-center">
                  <div>
                    <Hash size={25} className="mx-auto text-zinc-700" />
                    <p className="mt-3 text-sm font-black text-zinc-400">
                      Nenhum resultado neste filtro
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : query.trim().length > 1 ? (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div className="max-w-md">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-zinc-700">
                  <SearchIcon size={27} />
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight text-white">
                  Essa busca não encontrou uma história
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Confira a escrita ou tente usar apenas uma parte do título ou nome.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid gap-3 sm:grid-cols-3">
                {QUICK_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategory(category.id)}
                    className="group relative overflow-hidden rounded-[1.4rem] border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-all duration-500 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04] sm:p-5"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.overlay} to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-100`}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)] opacity-70" />
                    <div className="relative flex items-center gap-4">
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl ${category.tone}`}
                      >
                        <category.icon size={19} />
                      </span>
                      <div>
                        <h3 className="text-sm font-black text-white">{category.label}</h3>
                        <p className="mt-1 text-[10px] text-zinc-300/80">
                          {category.description}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="ml-auto text-white/45 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">
                      <Sparkles size={11} /> Explore por atmosfera
                    </span>
                    <h3 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
                      Que tipo de história combina com hoje?
                    </h3>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {SUGGESTED_GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleGenre(genre)}
                      className="group relative overflow-hidden rounded-[1.35rem] border border-white/[0.07] bg-[#0f0f16] p-4 text-left transition-all duration-500 hover:-translate-y-1 hover:border-white/15"
                    >
                      {activeGenreArtwork[genre.id]?.image && (
                        <img
                          src={`https://image.tmdb.org/t/p/w780${activeGenreArtwork[genre.id].image}`}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-[transform,opacity] duration-700 group-hover:scale-[1.06] group-hover:opacity-70"
                          loading="lazy"
                        />
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-br ${genre.tone} to-black/65`} />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-black/55" />
                      <div className="relative pr-10">
                        <span className="text-sm font-black text-zinc-100 transition-colors group-hover:text-white">
                          {genre.name}
                        </span>
                        <span className="mt-1 block text-[10px] text-zinc-300/75">
                          {genre.description}
                        </span>
                        {activeGenreArtwork[genre.id]?.title && (
                          <span className="mt-3 inline-flex max-w-full rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-200/85 backdrop-blur-xl">
                            Inspirado por {activeGenreArtwork[genre.id].title}
                          </span>
                        )}
                      </div>
                      <ArrowUpRight
                        size={15}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-all group-hover:-translate-y-[60%] group-hover:translate-x-0.5 group-hover:text-white"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
