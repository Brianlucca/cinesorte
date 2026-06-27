import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Film, MessageSquare, Star } from 'lucide-react';

const REVIEWS_PER_PAGE = 4;

function getMediaLink(review) {
  const idStr = String(review.mediaId || '');
  const cleanId = idStr.replace(/^(person-|movie-|tv-)/, '');

  if (review.mediaType === 'person') return `/app/person/${cleanId}`;

  const episodeMatch = idStr.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
  if (episodeMatch) {
    const [, tvId, season, episode] = episodeMatch;
    return `/app/tv/${tvId}/season/${parseInt(season, 10)}/episode/${parseInt(episode, 10)}`;
  }

  const seasonMatch = idStr.match(/^(?:tv-)?(\d+)-s(\d+)$/);
  if (seasonMatch) {
    const [, tvId, season] = seasonMatch;
    return `/app/tv/${tvId}/season/${parseInt(season, 10)}`;
  }

  if (review.mediaType === 'episode' || review.mediaType === 'tv') return `/app/tv/${cleanId}`;
  return `/app/${review.mediaType || 'movie'}/${cleanId}`;
}

function formatDate(dateValue) {
  if (!dateValue) return 'Data desconhecida';
  const date = dateValue._seconds ? new Date(dateValue._seconds * 1000) : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Data desconhecida';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getTypeLabel(type) {
  if (type === 'tv' || type === 'episode') return 'Série';
  if (type === 'person') return 'Artista';
  return 'Filme';
}

export default function ReviewsList({ reviews }) {
  const [page, setPage] = useState(0);
  const reviewItems = useMemo(() => (Array.isArray(reviews) ? reviews : []), [reviews]);
  const totalPages = Math.max(1, Math.ceil(reviewItems.length / REVIEWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = reviewItems.slice(currentPage * REVIEWS_PER_PAGE, (currentPage + 1) * REVIEWS_PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [reviewItems.length]);

  if (reviewItems.length === 0) {
    return (
      <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-[1.5rem] border border-dashed border-white/[0.08] bg-white/[0.015] text-center animate-in zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.10),transparent_45%)]" />
        <div className="relative px-6">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-violet-300">
            <MessageSquare size={22} />
          </div>
          <p className="mb-2 text-lg font-black tracking-tight text-white">Nenhuma review</p>
          <p className="text-sm font-medium text-zinc-500">Suas avaliações publicadas vão aparecer aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {pageItems.map((review, idx) => {
        const mediaLink = getMediaLink(review);
        const rating = Number(review.rating) || 0;
        const backdrop = review.backdropPath || review.backdrop_path;
        const poster = review.posterPath || review.poster_path;

        return (
          <article
            key={`${review.id}-${idx}`}
            className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0d0d10]/95 shadow-[0_20px_56px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-0.5 hover:border-violet-300/25"
          >
            <Link to={mediaLink} className="group/media relative block h-52 overflow-hidden sm:h-60">
              {backdrop ? (
                <img
                  src={`https://image.tmdb.org/t/p/w1280${backdrop}`}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover/media:scale-[1.04]"
                  alt=""
                  loading="lazy"
                />
              ) : poster ? (
                <img
                  src={`https://image.tmdb.org/t/p/w780${poster}`}
                  className="h-full w-full scale-110 object-cover opacity-55 blur-sm transition-transform duration-1000 group-hover/media:scale-[1.16]"
                  alt=""
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_58%)]">
                  <Film size={38} className="text-zinc-700" />
                </div>
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_10%,rgba(9,9,11,0.30)_45%,#0d0d10_100%)]" />
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-xl">
                  {getTypeLabel(review.mediaType)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/20 bg-black/40 px-3 py-1.5 text-[10px] font-black text-yellow-300 backdrop-blur-xl">
                  <Star size={11} className="fill-current" />
                  {rating.toFixed(1)}
                </span>
              </div>

              <div className={`absolute inset-x-0 bottom-0 grid ${poster ? 'grid-cols-[70px_minmax(0,1fr)] sm:grid-cols-[86px_minmax(0,1fr)]' : 'grid-cols-1'} items-end gap-4 px-4 pb-4 sm:px-5`}>
                {poster && (
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-[0_16px_35px_rgba(0,0,0,0.5)]">
                    <img src={`https://image.tmdb.org/t/p/w342${poster}`} className="aspect-[2/3] w-full object-cover" alt="" loading="lazy" />
                  </div>
                )}
                <div className="min-w-0 pb-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">Review sobre</span>
                  <div className="mt-1.5 flex items-start gap-2">
                    <h3 className="line-clamp-2 flex-1 text-lg font-black leading-[1.08] tracking-[-0.025em] text-white drop-shadow-xl sm:text-xl">
                      {review.mediaTitle || 'Título desconhecido'}
                    </h3>
                    <ArrowUpRight size={18} className="mt-1 shrink-0 text-white/60 transition-transform group-hover/media:-translate-y-0.5 group-hover/media:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="relative border-t border-white/[0.06] p-4 md:p-5">
              <span className="pointer-events-none absolute left-4 top-3 font-serif text-4xl leading-none text-violet-400/15 md:left-5">“</span>
              {review.text ? (
                <p className="relative pl-5 text-sm leading-7 text-zinc-300">
                  {review.text}
                </p>
              ) : (
                <p className="relative pl-5 text-sm italic text-zinc-600">Uma avaliação sem comentário.</p>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
                  <Calendar size={13} />
                  {formatDate(review.createdAt)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-violet-300">
                  <MessageSquare size={13} />
                  Publicada
                </span>
              </div>
            </div>
          </article>
        );
      })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600">
          Página {currentPage + 1} de {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(0, value - 1))}
            disabled={currentPage === 0}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30"
            aria-label="Página anterior de reviews"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
            disabled={currentPage >= totalPages - 1}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30"
            aria-label="Próxima página de reviews"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
