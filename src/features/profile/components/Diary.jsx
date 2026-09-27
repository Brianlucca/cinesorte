import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Film, Star } from 'lucide-react';
import {
  getDiaryMediaTitle,
  getDiaryMediaTypeLabel,
  getDiaryPosterPath,
  tmdbImage,
} from '@features/profile/components/diary/diaryUtils';
import {
  cancelMovieDetailsPrefetch,
  prefetchMovieDetails,
  scheduleMovieDetailsPrefetch,
} from '@shared/lib/mediaDetailsPrefetch';

const DIARY_PER_PAGE = 12;

function parseDate(value) {
  if (!value) return null;
  if (value._seconds) return new Date(value._seconds * 1000);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getItemDate(item) {
  return parseDate(item.watchedAt) || parseDate(item.actionDate) || parseDate(item.timestamp) ||
    parseDate(item.createdAt) || parseDate(item.updatedAt) || parseDate(item.sortDate);
}

function mediaLink(item) {
  const mediaId = String(item.mediaId || item.id || '').replace(/^(movie-|tv-)/, '');
  return `/app/${item.mediaType || 'movie'}/${mediaId}`;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export default function Diary({ items }) {
  const [page, setPage] = useState(0);
  const normalizedItems = useMemo(() => {
    return [...(Array.isArray(items) ? items : [])].map((item) => {
      const itemDate = getItemDate(item);
      return {
        ...item,
        mediaId: String(item.mediaId || item.id || '').replace(/^(movie-|tv-)/, ''),
        mediaType: item.mediaType || item.media_type || 'movie',
        posterPath: getDiaryPosterPath(item),
        day: itemDate?.toLocaleDateString('pt-BR', { day: '2-digit' }) || '--',
        weekday: itemDate?.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') || 'sem data',
        monthKey: itemDate ? `${itemDate.getFullYear()}-${itemDate.getMonth()}` : 'sem-data',
        monthLabel: itemDate ? capitalize(itemDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })) : 'Sem data',
        sortTime: itemDate?.getTime() || 0,
      };
    }).sort((a, b) => b.sortTime - a.sortTime);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(normalizedItems.length / DIARY_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = normalizedItems.slice(currentPage * DIARY_PER_PAGE, (currentPage + 1) * DIARY_PER_PAGE);
  const monthGroups = pageItems.reduce((groups, item) => {
    const current = groups.at(-1);
    if (current?.key === item.monthKey) current.items.push(item);
    else groups.push({ key: item.monthKey, label: item.monthLabel, items: [item] });
    return groups;
  }, []);

  useEffect(() => setPage(0), [normalizedItems.length]);

  if (normalizedItems.length === 0) {
    return (
      <div className="grid min-h-[260px] place-items-center rounded-xl border border-dashed border-white/[0.06] bg-white/[0.012] text-center animate-in fade-in duration-300">
        <div className="px-6">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] text-violet-300"><Calendar size={22} /></div>
          <p className="mb-2 text-lg font-semibold tracking-[-0.02em] text-white">Diário vazio</p>
          <p className="text-sm text-zinc-500">Marque filmes e séries como assistidos para começar seu histórico.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex flex-col justify-between gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Seu histórico</span>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">Diário de exibições</h3>
        </div>
        <span className="text-xs text-zinc-600">{normalizedItems.length} {normalizedItems.length === 1 ? 'registro' : 'registros'}</span>
      </div>

      <div className="space-y-12">
        {monthGroups.map((group) => (
          <section key={group.key}>
            <div className="mb-5 flex items-center gap-3">
              <h4 className="shrink-0 text-sm font-semibold text-zinc-200">{group.label}</h4>
              <span className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-[10px] text-zinc-600">{group.items.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-11 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {group.items.map((item, index) => {
                const rating = Number(item.rating || item.vote_average || 0);
                return (
                  <Link
                    key={`${item.mediaType}-${item.mediaId}-${index}`}
                    to={mediaLink(item)}
                    onMouseEnter={() => scheduleMovieDetailsPrefetch(item.mediaType, item.mediaId)}
                    onMouseLeave={() => cancelMovieDetailsPrefetch(item.mediaType, item.mediaId)}
                    onFocus={() => prefetchMovieDetails(item.mediaType, item.mediaId)}
                    onPointerDown={() => prefetchMovieDetails(item.mediaType, item.mediaId)}
                    className="group/card block min-w-0 rounded-xl pb-8 transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    <article className="relative overflow-hidden rounded-xl bg-white/[0.025]" style={{ aspectRatio: '2 / 3' }}>
                      {item.posterPath ? <img src={tmdbImage(item.posterPath, 'w342')} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="grid h-full place-items-center text-zinc-700"><Film size={24} /></span>}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-40 transition-opacity duration-300 md:opacity-0 md:group-hover/card:opacity-100" />
                      <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/65 px-2 py-1 text-center backdrop-blur-md">
                        <strong className="block text-sm font-semibold leading-none text-white">{item.day}</strong>
                        <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.1em] text-zinc-400">{item.weekday}</span>
                      </span>
                      {rating > 0 && <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-yellow-300 backdrop-blur-md"><Star size={9} className="fill-current" /> {rating.toFixed(1)}</span>}
                      <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-black/55 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-zinc-300 backdrop-blur-md">Assistido</span>
                    </article>
                    <div className="px-0.5 pt-4">
                      <h5 className="truncate text-sm font-semibold text-zinc-100">{getDiaryMediaTitle(item)}</h5>
                      <span className="mt-0.5 block text-[11px] text-zinc-600">{getDiaryMediaTypeLabel(item)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Página {currentPage + 1} de {totalPages}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0} className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-30" aria-label="Página anterior do diário"><ChevronLeft size={17} /></button>
          <button type="button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={currentPage >= totalPages - 1} className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.018] text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-30" aria-label="Próxima página do diário"><ChevronRight size={17} /></button>
        </div>
      </div>
    </div>
  );
}
