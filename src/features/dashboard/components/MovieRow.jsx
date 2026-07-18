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
    rail: "gap-4 md:gap-5",
    card: "w-[150px] sm:w-[170px] md:w-[210px] xl:w-[226px] 2xl:w-[238px]",
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
      className={`relative w-full group/row z-10 ${layout.section}`}
      style={{ background: layout.background }}
    >
      <div className="flex justify-between items-end px-5 sm:px-6 md:px-10 xl:px-14 2xl:px-16">
        <div>
          {variant !== "poster" && (
            <span className="mb-2 block text-[10px] md:text-xs font-black uppercase tracking-[0.24em] text-violet-300/70">
              {isLandscape ? "Seleção panorâmica" : "Em destaque"}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <span
              className={`w-1.5 rounded-full bg-gradient-to-b from-violet-400 to-violet-700 ${
                variant === "spotlight" ? "h-8" : "h-6"
              }`}
            />
            {title}
          </h2>
        </div>

        <div className="hidden md:flex gap-2 opacity-40 group-hover/row:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            aria-label={`Voltar na seção ${title}`}
            onClick={() => slide("left")}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all shadow-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label={`Avançar na seção ${title}`}
            onClick={() => slide("right")}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all shadow-lg"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className={`flex ${layout.rail} overflow-x-auto scroll-smooth snap-x snap-mandatory md:snap-none pt-5 md:pt-6 pb-4 md:pb-6 px-5 sm:px-6 md:px-10 xl:px-14 2xl:px-16 scrollbar-hide w-full`}
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
              className={`flex-none snap-start ${layout.card} group/card transition-transform duration-300 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-2xl`}
            >
              <article
                className={`${layout.frame} rounded-2xl md:rounded-[1.25rem] overflow-hidden bg-white/[0.03] border border-white/[0.07] relative shadow-2xl group-hover/card:border-violet-300/30 transition-all duration-300`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/${layout.imageSize}${imagePath}`}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.045]"
                  loading="lazy"
                />

                <div
                  className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent ${
                    isPoster
                      ? "opacity-40 md:opacity-0 md:group-hover/card:opacity-100"
                      : "opacity-100"
                  } transition-opacity duration-300`}
                />

                <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 bg-black/55 backdrop-blur-xl px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10 shadow-lg">
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black text-white">
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

                {isPoster && (
                  <div className="absolute inset-0 hidden md:flex flex-col justify-end p-5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <span className="font-bold text-white text-sm mb-3 line-clamp-2 leading-tight">
                      {name}
                    </span>
                    <div className="w-full py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest text-center rounded-lg shadow-lg">
                      Ver detalhes
                    </div>
                  </div>
                )}
              </article>

              {isPoster && (
                <div className="md:hidden pt-2.5 px-0.5">
                  <h3 className="text-sm font-semibold text-zinc-100 truncate">{name}</h3>
                  {year && <span className="text-xs text-zinc-500">{year}</span>}
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
