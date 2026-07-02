import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Film, Heart, Star } from 'lucide-react';

const LIKES_PER_PAGE = 4;

function parseDate(value) {
  if (!value) return null;
  if (value._seconds) return new Date(value._seconds * 1000);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getActionDate(item) {
  return parseDate(item.actionDate) || parseDate(item.likedAt) || parseDate(item.timestamp);
}

function formatActionDate(item) {
  const date = getActionDate(item);
  if (!date) return null;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getMediaTypeLabel(type) {
  if (type === 'tv') return 'Série';
  if (type === 'person') return 'Artista';
  return 'Filme';
}

function getMediaId(item) {
  return String(item.mediaId || item.id || '').replace(/^(movie-|tv-|person-)/, '');
}

export default function ActivityFeed({ interactions }) {
  const [page, setPage] = useState(0);
  const likedItems = useMemo(() => (interactions || []).filter((item) => item.action === 'like'), [interactions]);
  const totalPages = Math.max(1, Math.ceil(likedItems.length / LIKES_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = likedItems.slice(currentPage * LIKES_PER_PAGE, (currentPage + 1) * LIKES_PER_PAGE);

  useEffect(() => {
    setPage(0);
  }, [likedItems.length]);

  if (likedItems.length === 0) {
    return (
      <div className="relative grid min-h-[280px] place-items-center overflow-hidden rounded-[1.5rem] border border-dashed border-white/[0.08] bg-white/[0.015] text-center animate-in zoom-in-95 duration-500">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.10),transparent_45%)]" />
        <div className="relative px-6">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-red-300">
            <Heart size={22} />
          </div>
          <p className="mb-2 text-lg font-black tracking-tight text-white">Nenhuma curtida ainda</p>
          <p className="text-sm font-medium text-zinc-500">Os títulos que você curtir vão aparecer por aqui.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        {pageItems.map((item, idx) => {
          const actionDate = formatActionDate(item);
          const mediaType = item.mediaType || 'movie';
          const mediaId = getMediaId(item);
          const backdrop = item.backdropPath || item.backdrop_path;
          const poster = item.posterPath || item.poster_path;

          return (
            <Link
              key={`${mediaId}-${currentPage}-${idx}`}
              to={`/app/${mediaType}/${mediaId}`}
              className="group relative min-h-[220px] overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#09090b] shadow-[0_20px_56px_rgba(0,0,0,0.20)] transition-all duration-500 hover:-translate-y-0.5 hover:border-red-300/25"
            >
              {backdrop ? (
                <img
                  src={`https://image.tmdb.org/t/p/w1280${backdrop}`}
                  className="absolute inset-0 h-full w-full object-cover opacity-75 transition-transform duration-1000 group-hover:scale-[1.05]"
                  alt=""
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.14),transparent_55%)]" />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(9,9,11,0.35)_44%,#09090b_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.86)_0%,rgba(9,9,11,0.42)_58%,rgba(9,9,11,0.18)_100%)]" />

              <div className="relative flex h-full min-h-[220px] flex-col justify-between p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/20 bg-red-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-red-200 backdrop-blur-xl">
                      <Heart size={11} className="fill-current" />
                      Curtido
                    </span>
                    <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-xl">
                      {getMediaTypeLabel(mediaType)}
                    </span>
                  </div>

                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-xl transition-all group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight size={15} />
                  </span>
                </div>

                <div className="grid grid-cols-[70px_minmax(0,1fr)] items-end gap-4 sm:grid-cols-[86px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-[0_16px_35px_rgba(0,0,0,0.52)]">
                    {poster ? (
                      <img src={`https://image.tmdb.org/t/p/w342${poster}`} className="aspect-[2/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" loading="lazy" />
                    ) : (
                      <div className="grid aspect-[2/3] place-items-center text-zinc-700">
                        <Film size={22} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 pb-1">
                    <h3 className="line-clamp-2 text-lg font-black leading-[1.08] tracking-[-0.025em] text-white drop-shadow-xl transition-colors group-hover:text-red-100 sm:text-xl">
                      {item.mediaTitle || 'Conteúdo sem título'}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                      {actionDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} /> {actionDate}
                        </span>
                      )}
                      {item.vote_average > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-yellow-300">
                          <Star size={11} className="fill-current" /> {Number(item.vote_average).toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
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
            aria-label="Página anterior de curtidas"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
            disabled={currentPage >= totalPages - 1}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:pointer-events-none disabled:opacity-30"
            aria-label="Próxima página de curtidas"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
