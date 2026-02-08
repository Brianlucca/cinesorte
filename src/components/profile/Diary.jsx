import { Link } from "react-router-dom";
import { Calendar, Film } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { getMovieDetails } from "../../services/api";

export default function Diary({ items }) {
  const [mode, setMode] = useState("genre");
  const cacheRef = useRef({});
  const [cacheVersion, setCacheVersion] = useState(0);
  const [loadingGenres, setLoadingGenres] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
        <Calendar className="mx-auto text-zinc-700 mb-4" size={48} />
        <p className="text-zinc-500 italic text-lg">
          Seu diário de bordo está vazio.
        </p>
        <p className="text-zinc-600 text-sm mt-2">
          Marque filmes como assistidos para preencher sua linha do tempo.
        </p>
      </div>
    );
  }

  const getSafeDate = (timestamp) => {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return new Date();
  };

  useEffect(() => {
    const unique = [];
    items.forEach((item) => {
      const key = `${item.mediaType || "movie"}:${item.mediaId}`;
      if (!unique.some((u) => `${u.mediaType}:${u.mediaId}` === key))
        unique.push({
          mediaType: item.mediaType || "movie",
          mediaId: item.mediaId,
        });
    });

    const toFetch = unique.filter(
      (i) => !cacheRef.current[`${i.mediaType}:${i.mediaId}`],
    );
    if (toFetch.length === 0) return;
    setLoadingGenres(true);
    Promise.all(
      toFetch.map((i) =>
        getMovieDetails(i.mediaType, i.mediaId).catch(() => null),
      ),
    )
      .then((results) => {
        results.forEach((res, idx) => {
          const key = `${toFetch[idx].mediaType}:${toFetch[idx].mediaId}`;
          cacheRef.current[key] = res || null;
        });
        setCacheVersion((v) => v + 1);
      })
      .finally(() => setLoadingGenres(false));
  }, [items]);

  const groupedByGenre = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const key = `${item.mediaType || "movie"}:${item.mediaId}`;
      const details = cacheRef.current[key];
      const genres =
        details && details.genres ? details.genres : item.genres || [];
      if (genres && genres.length > 0) {
        const primary = genres[0].name || genres[0];
        if (!map[primary]) map[primary] = [];
        map[primary].push({
          ...item,
          posterPath: item.posterPath || item.poster_path,
        });
      } else {
        if (!map["Sem gênero"]) map["Sem gênero"] = [];
        map["Sem gênero"].push({
          ...item,
          posterPath: item.posterPath || item.poster_path,
        });
      }
    });
    return map;
  }, [items, cacheVersion]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 justify-between">
        <div className="text-sm text-zinc-400">
          Total: <span className="font-bold text-white">{items.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("genre")}
            className={`px-3 py-2 rounded-lg text-sm font-bold ${mode === "genre" ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-300"}`}
          >
            Por gênero
          </button>
          <button
            onClick={() => setMode("all")}
            className={`px-3 py-2 rounded-lg text-sm font-bold ${mode === "all" ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-300"}`}
          >
            Todos
          </button>
        </div>
      </div>

      {mode === "genre" &&
        (loadingGenres ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl">
            Carregando gêneros...
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedByGenre)
              .sort()
              .map((genre) => {
                const list = groupedByGenre[genre] || [];
                return (
                  <div key={genre}>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      {genre}{" "}
                      <span className="text-zinc-600 text-sm font-normal">
                        ({list.length})
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {list.map((item, idx) => {
                        return (
                          <div
                            key={`${item.mediaId}-${idx}`}
                            className="group relative"
                          >
                            <Link
                              to={`/app/${item.mediaType || "movie"}/${item.mediaId}`}
                            >
                              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-zinc-800 relative">
                                {item.posterPath ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                                    alt={item.mediaTitle}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    <Film size={24} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                  <span className="text-white font-bold text-sm line-clamp-2 leading-tight">
                                    {item.mediaTitle}
                                  </span>
                                  <span className="text-zinc-400 text-xs mt-1">
                                    {item.timestamp && item.timestamp._seconds
                                      ? new Date(
                                          item.timestamp._seconds * 1000,
                                        ).toLocaleDateString("pt-BR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                        })
                                      : "Recente"}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}

      {mode === "all" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item, idx) => (
            <div key={`${item.mediaId}-${idx}`} className="group relative">
              <Link to={`/app/${item.mediaType || "movie"}/${item.mediaId}`}>
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-zinc-800 relative">
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                      alt={item.mediaTitle}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Film size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-sm line-clamp-2 leading-tight">
                      {item.mediaTitle}
                    </span>
                    <span className="text-zinc-400 text-xs mt-1">
                      {item.timestamp && item.timestamp._seconds
                        ? new Date(
                            item.timestamp._seconds * 1000,
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "Recente"}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
