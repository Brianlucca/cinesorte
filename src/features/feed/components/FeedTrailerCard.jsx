import { useState } from "react";
import { Clapperboard, Play, Star } from "lucide-react";
import TrailerModal from "@features/media/components/TrailerModal";

export default function FeedTrailerCard({ item }) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const title = item.title || item.name || "Trailer";
  const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-sky-400/15 bg-[#181a20]">
        <div className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-300">
            <Clapperboard size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100">Trailer em destaque</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-300">
              Assista antes de adicionar à sua lista
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsTrailerOpen(true)}
          className="group relative mx-3 mb-3 block min-h-56 w-[calc(100%-1.5rem)] overflow-hidden rounded-lg bg-zinc-900 text-left sm:mx-4 sm:w-[calc(100%-2rem)]"
          aria-label={`Assistir trailer de ${title}`}
        >
          {item.backdrop_path && (
            <img
              src={`https://image.tmdb.org/t/p/w1280${item.backdrop_path}`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="relative flex min-h-56 items-end justify-between gap-4 p-4 sm:p-5">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-md">
                  {mediaType === "tv" ? "Série" : "Filme"}
                </span>
                {Number(item.vote_average) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-yellow-200 backdrop-blur-md">
                    <Star size={11} className="fill-current" />
                    {Number(item.vote_average).toFixed(1)}
                  </span>
                )}
              </div>
              <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                {title}
              </h3>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-zinc-950 shadow-xl transition-transform group-hover:scale-105">
              <Play size={20} className="ml-0.5 fill-current" />
            </span>
          </div>
        </button>
      </article>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        videoKey={item.trailerKey}
        title={title}
      />
    </>
  );
}
