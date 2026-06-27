import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Film, Star } from 'lucide-react';

const DIARY_PER_PAGE = 10;

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

function mediaLink(item) {
  const mediaId = String(item.mediaId || item.id || '').replace(/^(movie-|tv-)/, '');
  return `/app/${item.mediaType || 'movie'}/${mediaId}`;
}

function formatDisplayDate(date) {
  if (!date) return null;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Diary({ items }) {
  const [page, setPage] = useState(0);

  const normalizedItems = useMemo(() => {
    const safeItems = Array.isArray(items) ? items : [];
    return [...safeItems]
      .map((item) => {
        const itemDate = getItemDate(item);
        return {
          ...item,
          mediaId: String(item.mediaId || item.id || '').replace(/^(movie-|tv-)/, ''),
          mediaType: item.mediaType || item.media_type || 'movie',
          posterPath: item.posterPath || item.poster_path,
          backdropPath: item.backdropPath || item.backdrop_path,
          displayDate: formatDisplayDate(itemDate),
          sortTime: itemDate?.getTime() || 0,
        };
      })
      .sort((a, b) => b.sortTime - a.sortTime);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(normalizedItems.length / DIARY_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = normalizedItems.slice(currentPage * DIARY_PER_PAGE, (currentPage + 1) * DIARY_PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [normalizedItems.length]);

  if (normalizedItems.length === 0) {
    return (
      <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-[1.5rem] border border-dashed border-white/[0.08] bg-white/[0.015] text-center animate-in zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.10),transparent_45%)]" />
        <div className="relative px-6">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-violet-300">
            <Calendar size={22} />
          </div>
          <p className="mb-2 text-lg font-black tracking-tight text-white">Diário vazio</p>
          <p className="text-sm font-medium text-zinc-500">Marque filmes e séries como assistidos para preencher sua linha do tempo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-3 border-b border-white/[0.06] pb-4 md:flex-row md:items-end">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">Diário visual</span>
          <h3 className="mt-1 text-lg font-black tracking-[-0.02em] text-white sm:text-xl">Linha do tempo assistida</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
          {normalizedItems.length} {normalizedItems.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <ol className="overflow-hidden rounded-[1.35rem] border border-white/[0.08] bg-[#09090b] shadow-[0_20px_56px_rgba(0,0,0,0.22)]">
        {pageItems.map((item, index) => {
          const position = currentPage * DIARY_PER_PAGE + index + 1;
          const backdrop = item.backdropPath || item.backdrop_path;
          const poster = item.posterPath || item.poster_path;
          const rating = Number(item.vote_average || item.rating || 0);

          return (
            <li key={`${item.mediaType}-${item.mediaId}-${position}`} className="border-b border-white/[0.06] last:border-b-0">
              <Link
                to={mediaLink(item)}
                className="group relative grid min-h-[108px] grid-cols-[56px_minmax(0,1fr)_auto] items-center overflow-hidden transition-colors hover:bg-white/[0.035] sm:min-h-[118px] sm:grid-cols-[68px_minmax(0,1fr)_auto]"
              >
                {backdrop ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w780${backdrop}`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-52 transition-transform duration-700 group-hover:scale-[1.035]"
                    loading="lazy"
                  />
                ) : poster ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${poster}`}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-22 blur-sm transition-transform duration-700 group-hover:scale-[1.14]"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_50%,rgba(139,92,246,0.14),transparent_40%)]" />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.78)_24%,rgba(9,9,11,0.48)_58%,#09090b_100%)]" />
                <div className="absolute inset-0 bg-black/18" />

                <div className="relative z-10 flex h-full items-center justify-center">
                  <span className="text-lg font-black tabular-nums text-violet-300 drop-shadow-[0_0_14px_rgba(167,139,250,0.32)] md:text-xl">
                    {String(position).padStart(2, '0')}
                  </span>
                </div>

                <div className="relative z-10 min-w-0 py-3 pr-4">
                  <h4 className="truncate text-sm font-black tracking-[-0.015em] text-white sm:text-base">
                    {item.mediaTitle || item.title || item.name || 'Conteúdo sem título'}
                  </h4>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-zinc-400">
                    {item.displayDate && <span>{item.displayDate}</span>}
                    <span className="h-1 w-1 rounded-full bg-violet-400/80" />
                    <span>{item.mediaType === 'tv' ? 'Série' : 'Filme'}</span>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 py-3 pl-2 pr-3 sm:pr-4">
                  {rating > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/15 bg-black/35 px-2.5 py-1 text-[10px] font-black text-yellow-300 backdrop-blur-xl">
                      <Star size={10} className="fill-current" />
                      {rating.toFixed(1)}
                    </span>
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.08] bg-black/25 text-zinc-600">
                      <Film size={14} />
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
          Página {currentPage + 1} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={currentPage === 0}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30"
            aria-label="Página anterior do diário"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
            disabled={currentPage >= totalPages - 1}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30"
            aria-label="Próxima página do diário"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
