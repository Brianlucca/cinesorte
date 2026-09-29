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
  Users,
  X,
} from "lucide-react";
import { getDiscover, searchUsers } from "@shared/api/api";
import { useSearchLogic } from "@shared/hooks/useSearchLogic";
import { useAuth } from "@shared/context/useAuth";
import {
  cancelMovieDetailsPrefetch,
  prefetchMovieDetails,
  scheduleMovieDetailsPrefetch,
} from "@shared/lib/mediaDetailsPrefetch";

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
  { id: "user", label: "Usuários" },
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

function MediaSearchResultCard({ item, onClose }) {
  const type = getType(item);
  const title = item.title || item.name;
  const year = getYear(item);
  const imagePath = item.poster_path;
  const rating = Number(item.vote_average || 0).toFixed(1);

  return (
    <Link
      to={`/app/${type}/${item.id}`}
      onClick={onClose}
      onMouseEnter={() => scheduleMovieDetailsPrefetch(type, item.id)}
      onMouseLeave={() => cancelMovieDetailsPrefetch(type, item.id)}
      onFocus={() => prefetchMovieDetails(type, item.id)}
      onPointerDown={() => prefetchMovieDetails(type, item.id)}
      className="group/card min-w-0 rounded-xl transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <article className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.025]">
        {imagePath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${imagePath}`}
            className="h-full w-full object-cover"
            alt={title}
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-700">
            <Film size={30} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-40 transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100" />
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 backdrop-blur-md md:right-3 md:top-3">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] font-semibold text-white">{rating}</span>
        </div>
      </article>

      <div className="px-0.5 pt-2.5">
        <h3 className="truncate text-sm font-semibold text-zinc-100">{title}</h3>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
          {year && <span>{year}</span>}
          {year && <span>&bull;</span>}
          <span>{type === "tv" ? <>S&eacute;rie</> : "Filme"}</span>
        </div>
        <div className="hidden">
          {year && <span>{year}</span>}
          {year && <span className="order-2">&bull;</span>}
          <span className="order-3">{type === "tv" ? <>S&eacute;rie</> : "Filme"}</span>
          {year && <span>Â·</span>}
          <span>{type === "tv" ? "SÃ©rie" : "Filme"}</span>
        </div>
      </div>
    </Link>
  );
}

function SearchResultCard({ item, onClose }) {
  const type = getType(item);
  const isPerson = type === "person";

  if (!isPerson) return <MediaSearchResultCard item={item} onClose={onClose} />;

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
      className="group min-w-0 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] transition-colors hover:border-white/[0.13] hover:bg-white/[0.03]"
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
        <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/55 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-zinc-200 backdrop-blur-md">
          {isPerson ? "Artista" : type === "tv" ? "Série" : "Filme"}
        </span>
        {!isPerson && item.vote_average > 0 && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[9px] font-semibold text-yellow-300 backdrop-blur-md">
            <Star size={9} className="fill-current" />
            {Number(item.vote_average).toFixed(1)}
          </span>
        )}
        <ArrowUpRight
          size={17}
          className="absolute bottom-3 right-3 translate-y-2 text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
        />
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 tracking-[-0.015em] text-zinc-100 transition-colors group-hover:text-violet-200">
          {title}
        </h3>
        <p className="mt-1 truncate text-[10px] font-medium text-zinc-600">
          {isPerson
            ? knownFor || "Cinema e televisão"
            : getYear(item) || "Ano não informado"}
        </p>
      </div>
    </Link>
  );
}

function UserResultCard({ user, onClose }) {
  const displayName = user.name || user.displayName || user.username || "Usuário";
  const username = user.username || "";
  const avatar = user.photoURL || user.userPhoto || null;

  return (
    <Link
      to={username ? `/app/profile/${username}` : "/app/profile"}
      onClick={onClose}
      className="group flex min-h-20 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3 transition-colors hover:border-white/[0.13] hover:bg-white/[0.03]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/[0.08] bg-violet-500/10 text-sm font-semibold uppercase text-violet-200">
        {avatar ? (
          <img src={avatar} alt={displayName} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          displayName.charAt(0)
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-5 text-zinc-100 transition-colors group-hover:text-violet-200">
          {displayName}
        </span>
        {username && (
          <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-600">
            @{username.toLowerCase()}
          </span>
        )}
      </span>
      <ArrowUpRight
        size={17}
        className="ml-auto shrink-0 translate-y-2 text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
      />
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
  const { user } = useAuth();
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
  const [userResults, setUserResults] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
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
        setUserResults([]);
        setUsersLoading(false);
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

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!user || !isOpen || trimmedQuery.length < 3) {
      setUserResults([]);
      setUsersLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setUsersLoading(true);
      try {
        const data = await searchUsers(trimmedQuery, controller.signal);
        setUserResults(Array.isArray(data) ? data.filter((user) => user?.username) : []);
      } catch {
        if (!controller.signal.aborted) setUserResults([]);
      } finally {
        if (!controller.signal.aborted) setUsersLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, query, user]);

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
  const filteredUsers = useMemo(
    () => (user && (filter === "all" || filter === "user") ? userResults : []),
    [filter, user, userResults],
  );
  const totalResults = results.length + (user ? userResults.length : 0);
  const hasResults = totalResults > 0;
  const isSearching = loading || usersLoading;

  const handleQueryChange = (value) => {
    setQuery(value);
    setActiveGenre("");
    setFilter("all");
    if (!value.trim()) setUserResults([]);
  };

  const handleGenre = (genre) => {
    setActiveGenre(genre.name);
    setFilter("all");
    setUserResults([]);
    searchByGenre(genre.id);
  };

  const handleCategory = (categoryId) => {
    setActiveGenre("");
    setFilter(categoryId === "person" ? "person" : "all");
    setUserResults([]);
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
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-md"
        onClick={onClose}
      />

      <section
        className={`relative flex max-h-[88svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl border border-white/[0.06] bg-[#111216] shadow-[0_28px_90px_rgba(0,0,0,0.55)] transition-all duration-300 sm:rounded-xl ${
          isActive ? "translate-y-0 scale-100" : "translate-y-8 scale-[0.985]"
        }`}
      >
        <header className="relative shrink-0 border-b border-white/[0.06] px-4 py-4 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center text-violet-400">
                <Clapperboard size={19} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  Explorar CineSorte
                </h2>
                <p className="mt-0.5 text-[9px] font-medium text-zinc-600">
                  {user ? "Filmes, séries, artistas e usuários" : "Filmes, séries e artistas"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="group relative">
            <SearchIcon
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-violet-300"
            />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder={user
                ? "Busque filmes, séries, artistas ou usuários do CineSorte..."
                : "Busque filmes, séries ou artistas..."}
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.018] pl-11 pr-11 text-sm font-medium text-white outline-none transition-colors placeholder:font-normal placeholder:text-zinc-600 focus:border-violet-400/35 focus:bg-white/[0.03] sm:text-base"
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

        <div className="content-scrollbar relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {isSearching ? (
            <LoadingState />
          ) : hasResults ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">
                    {activeGenre ? "Seleção por gênero" : "Resultados da busca"}
                  </span>
                  <h3 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
                    {activeGenre ||
                      (query
                        ? `Encontramos ${totalResults} resultados`
                        : "Descobertas para você")}
                  </h3>
                </div>
                <div className="scrollbar-hide flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-white/[0.07] bg-black/20 p-1">
                  {FILTERS.filter((item) => user || item.id !== "user").map((item) => {
                    const count =
                      item.id === "all"
                        ? totalResults
                        : item.id === "user"
                          ? userResults.length
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

              {filteredUsers.length > 0 || filteredResults.length > 0 ? (
                <div className="space-y-7">
                  {filteredUsers.length > 0 && (
                    <section>
                      <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                        <Users size={12} /> Usuários CineSorte
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers.map((user) => (
                          <UserResultCard
                            key={user.username}
                            user={user}
                            onClose={onClose}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredResults.length > 0 && (
                    <section>
                      {filteredUsers.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-zinc-500">
                          <Clapperboard size={12} /> Filmes, séries e artistas
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {filteredResults.map((item) => (
                          <SearchResultCard
                            key={`${getType(item)}-${item.id}`}
                            item={item}
                            onClose={onClose}
                          />
                        ))}
                      </div>
                    </section>
                  )}
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
              <div className="grid gap-2 sm:grid-cols-3">
                {QUICK_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategory(category.id)}
                    className="group flex h-16 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3.5 text-left transition-colors hover:border-white/[0.13] hover:bg-white/[0.035]"
                  >
                    <div className="flex w-full items-center gap-3">
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300"
                      >
                        <category.icon size={17} />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{category.label}</h3>
                        <p className="mt-0.5 text-[10px] text-zinc-500">
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

              <div className="mt-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-400">
                      <Sparkles size={11} /> Explore por atmosfera
                    </span>
                    <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">
                      Que tipo de história combina com hoje?
                    </h3>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {SUGGESTED_GENRES.map((genre) => (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleGenre(genre)}
                      className="group relative min-h-20 overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] p-3.5 text-left transition-colors hover:border-white/[0.13]"
                    >
                      {activeGenreArtwork[genre.id]?.image && (
                        <img
                          src={`https://image.tmdb.org/t/p/w780${activeGenreArtwork[genre.id].image}`}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-25 transition-opacity duration-500 group-hover:opacity-35"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#181a20] via-[#181a20]/90 to-[#181a20]/45" />
                      <div className="relative pr-10">
                        <span className="text-sm font-semibold text-zinc-100 transition-colors group-hover:text-violet-200">
                          {genre.name}
                        </span>
                        <span className="mt-1 block text-[10px] text-zinc-300/75">
                          {genre.description}
                        </span>
                        {activeGenreArtwork[genre.id]?.title && (
                          <span className="mt-2 block max-w-full truncate text-[9px] font-medium text-zinc-500">
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
