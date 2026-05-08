import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Film } from "lucide-react";

function parseDate(value) {
  if (!value) return null;
  if (value._seconds) return new Date(value._seconds * 1000);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getItemDate(item) {
  return (
    parseDate(item.watchedAt) ||
    parseDate(item.actionDate) ||
    parseDate(item.timestamp) ||
    parseDate(item.createdAt) ||
    parseDate(item.updatedAt) ||
    parseDate(item.sortDate)
  );
}

function getItemGenres(item) {
  const genres = item.genres || item.genreNames || item.mediaGenres || [];
  if (Array.isArray(genres) && genres.length > 0) {
    const normalized = genres.map((genre) => genre?.name || genre).filter(Boolean);
    if (normalized.length > 0) return normalized;
  }

  if (typeof item.genre === "string" && item.genre.trim()) {
    return [item.genre.trim()];
  }

  return ["Sem genero"];
}

function PosterGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-5 animate-in fade-in duration-500 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item, idx) => (
        <div key={`${item.mediaId}-${idx}`} className="group relative">
          <Link to={`/app/${item.mediaType || "movie"}/${item.mediaId}`} className="block">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 bg-black shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
              {item.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                  alt={item.mediaTitle}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-zinc-600">
                  <Film size={28} />
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:opacity-100 md:p-5">
                <span className="mb-1 line-clamp-2 text-sm font-black leading-tight tracking-tight text-white md:text-base">
                  {item.mediaTitle}
                </span>
                {item.displayDate && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {item.displayDate}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function Diary({ items }) {
  const [mode, setMode] = useState("all");

  const normalizedItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    return [...safeItems]
      .map((item) => ({
        ...item,
        posterPath: item.posterPath || item.poster_path,
        displayDate: getItemDate(item)
          ? getItemDate(item).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : null,
      }))
      .sort((a, b) => (getItemDate(b)?.getTime() || 0) - (getItemDate(a)?.getTime() || 0));
  }, [items]);

  const groupedByGenre = useMemo(() => {
    return normalizedItems.reduce((groups, item) => {
      const primaryGenre = getItemGenres(item)[0] || "Sem genero";
      if (!groups[primaryGenre]) groups[primaryGenre] = [];
      groups[primaryGenre].push(item);
      return groups;
    }, {});
  }, [normalizedItems]);

  if (normalizedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01] py-24 shadow-inner animate-in zoom-in-95 duration-500">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/5 shadow-inner">
          <Calendar size={28} className="text-zinc-600" />
        </div>
        <p className="mb-2 text-xl font-black tracking-tight text-white">Diario vazio</p>
        <p className="text-sm font-medium text-zinc-500">Marque filmes como assistidos para preencher sua linha do tempo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-between gap-6 border-b border-white/5 pb-6 md:flex-row">
        <div className="text-xs font-black uppercase tracking-widest text-zinc-500">
          Total de itens: <span className="ml-1 text-sm text-white">{normalizedItems.length}</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-black/40 p-1.5 shadow-inner">
          <button
            onClick={() => setMode("all")}
            className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              mode === "all" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:bg-white/5 hover:text-white"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setMode("genre")}
            className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              mode === "genre" ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:bg-white/5 hover:text-white"
            }`}
          >
            Por genero
          </button>
        </div>
      </div>

      {mode === "all" && <PosterGrid items={normalizedItems} />}

      {mode === "genre" && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {Object.keys(groupedByGenre)
            .sort((a, b) => a.localeCompare(b, "pt-BR"))
            .map((genre) => {
              const list = groupedByGenre[genre] || [];
              return (
                <div key={genre}>
                  <h3 className="mb-6 flex items-center gap-4 text-2xl font-black capitalize tracking-tight text-white md:text-3xl">
                    {genre}
                    <span className="rounded-lg border border-white/5 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-300 shadow-inner">
                      {list.length} {list.length === 1 ? "item" : "itens"}
                    </span>
                  </h3>
                  <PosterGrid items={list} />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
