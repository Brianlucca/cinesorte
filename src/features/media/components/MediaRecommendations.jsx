import { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  cancelMovieDetailsPrefetch,
  prefetchMovieDetails,
  scheduleMovieDetailsPrefetch,
} from "@shared/lib/mediaDetailsPrefetch";

const getMediaType = (item) =>
  item.media_type || (item.first_air_date ? "tv" : "movie");

export default function MediaRecommendations({ items }) {
  const rowRef = useRef(null);
  const visibleItems = (items || []).filter(
    (item) => item?.id && (item.backdrop_path || item.poster_path),
  );

  if (visibleItems.length === 0) return null;

  const slide = (direction) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mx-auto max-w-[1380px] px-5 sm:px-8 md:px-10 xl:px-12">
      <div className="border-t border-white/[0.07] py-8 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--media-accent-text)]">
              Continue explorando
            </span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">
              Você também pode gostar
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-2 hidden text-xs font-semibold text-zinc-500 sm:inline">
              {visibleItems.length} sugestões
            </span>
            <button
              type="button"
              onClick={() => slide("left")}
              aria-label="Voltar nas recomendações"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:border-[var(--media-accent-border)] hover:bg-[var(--media-accent-soft)] hover:text-white"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              onClick={() => slide("right")}
              aria-label="Avançar nas recomendações"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:border-[var(--media-accent-border)] hover:bg-[var(--media-accent-soft)] hover:text-white"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        <div
          ref={rowRef}
          className="mt-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth pb-2 scrollbar-hide md:snap-none md:gap-4"
        >
          {visibleItems.map((item) => {
            const name = item.title || item.name;
            const mediaType = getMediaType(item);
            const year = (item.release_date || item.first_air_date || "").slice(0, 4);
            const imagePath = item.backdrop_path || item.poster_path;

            return (
              <Link
                key={`${mediaType}-${item.id}`}
                to={`/app/${mediaType}/${item.id}`}
                onMouseEnter={() => scheduleMovieDetailsPrefetch(mediaType, item.id)}
                onMouseLeave={() => cancelMovieDetailsPrefetch(mediaType, item.id)}
                onFocus={() => prefetchMovieDetails(mediaType, item.id)}
                onPointerDown={() => prefetchMovieDetails(mediaType, item.id)}
                className="group w-[76vw] max-w-[300px] shrink-0 snap-start sm:w-[320px] sm:max-w-none md:w-[350px]"
              >
                <article className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900 transition-opacity duration-300 group-hover:opacity-90">
                  <img
                    src={`https://image.tmdb.org/t/p/w780${imagePath}`}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="mb-1.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-300">
                      {year && <span>{year}</span>}
                      {year && <span className="h-1 w-1 rounded-full bg-[var(--media-accent)]" />}
                      <span>{mediaType === "tv" ? "Série" : "Filme"}</span>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <h3 className="line-clamp-2 text-base font-bold leading-tight text-white md:text-lg">
                        {name}
                      </h3>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all group-hover:bg-white group-hover:text-black">
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </div>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/45 px-2 py-1 text-[10px] font-black text-white backdrop-blur-md">
                    <Star size={10} className="fill-yellow-300 text-yellow-300" />
                    {Number(item.vote_average || 0).toFixed(1)}
                  </span>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
