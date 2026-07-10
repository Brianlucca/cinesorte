import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Film, Star } from 'lucide-react';
import {
  getDiaryBackdropPath,
  getDiaryMediaTitle,
  getDiaryMediaTypeLabel,
  getDiaryPosterPath,
  tmdbImage,
} from '@features/profile/components/diary/diaryUtils';

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
          posterPath: getDiaryPosterPath(item),
          backdropPath: getDiaryBackdropPath(item),
          displayDate: formatDisplayDate(itemDate),
          timelineDay: itemDate?.toLocaleDateString('pt-BR', { day: '2-digit' }) || '--',
          timelineMonth: itemDate?.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') || 'sem data',
          timelineYear: itemDate?.getFullYear() || '',
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
            {normalizedItems.length} {normalizedItems.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      <ol className="relative mx-auto max-w-5xl py-2 before:absolute before:bottom-8 before:left-[3.2rem] before:top-8 before:w-px before:bg-gradient-to-b before:from-violet-400/60 before:via-white/10 before:to-transparent sm:before:left-[6.7rem]">
        {pageItems.map((item, index) => {
          const position = currentPage * DIARY_PER_PAGE + index + 1;
          const backdrop = getDiaryBackdropPath(item);
          const poster = getDiaryPosterPath(item);
          const rating = Number(item.vote_average || item.rating || 0);

          return (
            <li key={`${item.mediaType}-${item.mediaId}-${position}`} className="group relative grid grid-cols-[4rem_minmax(0,1fr)] gap-4 py-3 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-6 sm:py-4">
              <div className="relative z-10 flex items-start justify-between pt-3 sm:items-center">
                <div className="text-right">
                  <span className="block text-xl font-black leading-none tabular-nums text-white sm:text-3xl">{item.timelineDay}</span>
                  <span className="mt-1 block text-[8px] font-black uppercase tracking-[0.16em] text-zinc-600 sm:text-[9px]">
                    {item.timelineMonth} {item.timelineYear}
                  </span>
                </div>
                <span className="absolute right-1 top-5 z-30 grid h-4 w-4 place-items-center rounded-full border-4 border-[#08080b] bg-violet-400 shadow-[0_0_0_1px_rgba(167,139,250,0.28),0_0_18px_rgba(139,92,246,0.45)] sm:top-1/2 sm:-translate-y-1/2" />
              </div>

              <Link
                to={mediaLink(item)}
                className="relative grid min-h-[112px] grid-cols-[70px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d11] shadow-[0_16px_45px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-[#111116] sm:min-h-[132px] sm:grid-cols-[88px_minmax(0,1fr)]"
              >
                {backdrop ? (
                  <img
                    src={tmdbImage(backdrop, 'w1280')}
                    alt=""
                    className="absolute inset-y-0 right-0 h-full w-3/5 object-cover opacity-15 [mask-image:linear-gradient(to_right,transparent,black)] transition-opacity duration-500 group-hover:opacity-25"
                    loading="lazy"
                  />
                ) : null}

                <div className="relative z-10 overflow-hidden border-r border-white/[0.06] bg-black/20">
                  {poster ? (
                    <img src={tmdbImage(poster, 'w342')} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <span className="grid h-full place-items-center text-zinc-700"><Film size={22} /></span>
                  )}
                </div>

                <div className="relative z-10 flex min-w-0 flex-col justify-center p-4 sm:p-5">
                  <div className="mb-2 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.18em] text-violet-300">
                    <span>Entrada {String(position).padStart(2, '0')}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span className="text-zinc-500">{getDiaryMediaTypeLabel(item)}</span>
                  </div>
                  <h4 className="line-clamp-2 text-base font-black leading-tight tracking-[-0.02em] text-white sm:text-xl">
                    {getDiaryMediaTitle(item)}
                  </h4>
                  {rating > 0 ? (
                    <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-yellow-300/10 bg-yellow-300/[0.06] px-2.5 py-1 text-[9px] font-black text-yellow-300">
                      <Star size={9} className="fill-current" />
                      {rating.toFixed(1)}
                    </span>
                  ) : null}
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
