import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  cancelMovieDetailsPrefetch,
  prefetchMovieDetails,
  scheduleMovieDetailsPrefetch,
} from "@shared/lib/mediaDetailsPrefetch";

const variants = {
  poster: {
    section: "",
    background: undefined,
    rail: "gap-3 md:gap-4",
    card: "w-[142px] sm:w-[158px] md:w-[184px] xl:w-[196px] 2xl:w-[204px]",
    frame: "aspect-[2/3]",
    imageSize: "w500",
  },
  landscape: {
    section: "py-5 md:py-7",
    background:
      "linear-gradient(to bottom, transparent 0%, rgba(8, 47, 73, 0.10) 16%, rgba(8, 47, 73, 0.18) 38%, rgba(46, 16, 101, 0.14) 68%, transparent 100%)",
    rail: "gap-4 md:gap-6",
    card: "w-[78vw] max-w-[310px] sm:w-[320px] sm:max-w-none md:w-[390px] xl:w-[430px] 2xl:w-[460px]",
    frame: "aspect-video",
    imageSize: "w780",
  },
  spotlight: {
    section: "py-5 md:py-7",
    background:
      "radial-gradient(ellipse at 12% 50%, rgba(124, 58, 237, 0.14), transparent 58%), linear-gradient(to bottom, transparent 0%, rgba(76, 29, 149, 0.05) 24%, rgba(24, 24, 27, 0.16) 72%, transparent 100%)",
    rail: "gap-4 md:gap-6",
    card: "w-[185px] sm:w-[215px] md:w-[270px] xl:w-[292px] 2xl:w-[310px]",
    frame: "aspect-[4/5]",
    imageSize: "w500",
  },
};

const getMediaType = (item) =>
  item.media_type || (item.first_air_date ? "tv" : "movie");

const getYear = (item) =>
  (item.release_date || item.first_air_date || "").slice(0, 4);

export default function MovieRow({ title, items, variant = "poster" }) {
  const rowRef = useRef(null);
  const layout = variants[variant] || variants.poster;
  const isPoster = variant === "poster";
  const isLandscape = variant === "landscape";
  const visibleItems = (items || []).filter(
    (item) => item?.id && (item.poster_path || item.backdrop_path),
  );

  const slide = (direction) => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    const amount = clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (visibleItems.length === 0) return null;

  return (
    <section
      className={`group/row relative z-10 w-full ${layout.section}`}
      style={{ background: layout.background }}
    >
      <div className="flex items-end justify-between px-5 sm:px-6 md:px-10 xl:px-14 2xl:px-16">
        <div>
          {variant !== "poster" && (
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300/70">
              {isLandscape ? "Seleção panorâmica" : "Em destaque"}
            </span>
          )}
          <h2 className="flex items-center gap-3 text-lg font-semibold tracking-[-0.02em] text-zinc-100 sm:text-xl md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label={`Voltar na seção ${title}`}
            onClick={() => slide("left")}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={`Avançar na seção ${title}`}
            onClick={() => slide("right")}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className={`flex ${layout.rail} w-full snap-x snap-mandatory overflow-x-auto px-5 pb-2 pt-4 scroll-smooth scrollbar-hide sm:px-6 md:snap-none md:px-10 md:pt-5 xl:px-14 2xl:px-16`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {visibleItems.map((item, index) => {
          const mediaType = getMediaType(item);
          const imagePath = isLandscape
            ? item.backdrop_path || item.poster_path
            : item.poster_path || item.backdrop_path;
          const name = item.title || item.name;
          const year = getYear(item);

          return (
            <Link
              key={`${item.id}-${index}`}
              to={`/app/${mediaType}/${item.id}`}
              onMouseEnter={() => scheduleMovieDetailsPrefetch(mediaType, item.id)}
              onMouseLeave={() => cancelMovieDetailsPrefetch(mediaType, item.id)}
              onFocus={() => prefetchMovieDetails(mediaType, item.id)}
              onPointerDown={() => prefetchMovieDetails(mediaType, item.id)}
              className={`flex-none snap-start ${layout.card} group/card rounded-xl transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400`}
            >
              <article
                className={`${layout.frame} relative overflow-hidden rounded-xl bg-white/[0.025]`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/${layout.imageSize}${imagePath}`}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent ${
                    isPoster
                      ? "opacity-40 md:opacity-0 md:group-hover/card:opacity-100"
                      : "opacity-100"
                  } transition-opacity duration-300`}
                />

                <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 backdrop-blur-md md:right-3 md:top-3">
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-semibold text-white">
                    {Number(item.vote_average || 0).toFixed(1)}
                  </span>
                </div>

                {!isPoster && (
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <div className="mb-1.5 flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.16em] font-bold text-zinc-300">
                      {year && <span>{year}</span>}
                      {year && <span className="h-1 w-1 rounded-full bg-violet-400" />}
                      <span>{getMediaType(item) === "tv" ? "Série" : "Filme"}</span>
                    </div>
                    <h3 className="text-base md:text-xl font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
                      {name}
                    </h3>
                    <span className="mt-3 hidden md:inline-flex translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-300 text-[10px] font-black uppercase tracking-widest text-white border-b border-violet-400 pb-1">
                      Ver detalhes
                    </span>
                  </div>
                )}

              </article>

              {isPoster && (
                <div className="px-0.5 pt-2.5">
                  <h3 className="text-sm font-semibold text-zinc-100 truncate">{name}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    {year && <span>{year}</span>}
                    {year && <span>•</span>}
                    <span>{mediaType === "tv" ? "Série" : "Filme"}</span>
                  </div>
                </div>
              )}
            </Link>
          );
        })}
        <div className="w-1 md:w-6 flex-none" aria-hidden="true" />
      </div>
    </section>
  );
}
