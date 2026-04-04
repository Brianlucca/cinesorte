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
      <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] rounded-[2rem] border border-white/5 border-dashed shadow-inner animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-white/5 shadow-inner">
          <Calendar size={28} className="text-zinc-600" />
        </div>
        <p className="text-white font-black text-xl tracking-tight mb-2">Diário Vazio</p>
        <p className="text-zinc-500 font-medium text-sm">Marque filmes como assistidos para preencher sua linha do tempo.</p>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
          Total de Itens: <span className="text-white text-sm ml-1">{items.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
          <button
            onClick={() => setMode("genre")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === "genre" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            Por gênero
          </button>
          <button
            onClick={() => setMode("all")}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${mode === "all" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}
          >
            Todos
          </button>
        </div>
      </div>

      {mode === "genre" &&
        (loadingGenres ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-violet-600/30 border-t-violet-500 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Carregando gêneros...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.keys(groupedByGenre)
              .sort()
              .map((genre) => {
                const list = groupedByGenre[genre] || [];
                return (
                  <div key={genre} className="animate-in fade-in duration-500">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-6 flex items-center gap-4 tracking-tight capitalize">
                      {genre}
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 text-zinc-300 px-3 py-1.5 rounded-lg border border-white/5 shadow-inner">
                        {list.length} {list.length === 1 ? 'item' : 'itens'}
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                      {list.map((item, idx) => {
                        return (
                          <div
                            key={`${item.mediaId}-${idx}`}
                            className="group relative"
                          >
                            <Link
                              to={`/app/${item.mediaType || "movie"}/${item.mediaId}`}
                              className="block"
                            >
                              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)] bg-black relative border border-white/5">
                                {item.posterPath ? (
                                  <img
                                    src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                                    alt={item.mediaTitle}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-white/5">
                                    <Film size={28} />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-5">
                                  <span className="text-white font-black text-sm md:text-base line-clamp-2 leading-tight tracking-tight mb-1">
                                    {item.mediaTitle}
                                  </span>
                                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 animate-in fade-in duration-500">
          {items.map((item, idx) => (
            <div key={`${item.mediaId}-${idx}`} className="group relative">
              <Link to={`/app/${item.mediaType || "movie"}/${item.mediaId}`} className="block">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)] bg-black relative border border-white/5">
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                      alt={item.mediaTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-white/5">
                      <Film size={28} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-5">
                    <span className="text-white font-black text-sm md:text-base line-clamp-2 leading-tight tracking-tight mb-1">
                      {item.mediaTitle}
                    </span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
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