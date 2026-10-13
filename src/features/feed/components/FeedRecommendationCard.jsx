import { ArrowUpRight, Clapperboard, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeedRecommendationCard({ item }) {
  const title = item.title || item.name || "Descubra este título";
  const mediaType = item.media_type === "tv" ? "Série" : "Filme";
  const imagePath = item.backdrop_path || item.poster_path;
  const imageSize = item.backdrop_path ? "w1280" : "w780";

  return (
    <article className="overflow-hidden rounded-xl border border-violet-400/15 bg-[#181a20]">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-violet-400/20 bg-violet-500/10 text-violet-300">
          <Clapperboard size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-100">CineSorte recomenda</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300">
            Uma descoberta para você
          </p>
        </div>
      </div>

      <Link
        to={`/app/${item.media_type}/${item.id}`}
        className="group relative mx-3 mb-3 block min-h-56 overflow-hidden rounded-lg bg-zinc-900 sm:mx-4"
      >
        {imagePath && (
          <img
            src={`https://image.tmdb.org/t/p/${imageSize}${imagePath}`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
        <div className="relative flex min-h-56 flex-col justify-end p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-md">
              {mediaType}
            </span>
            {Number(item.vote_average) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-yellow-200 backdrop-blur-md">
                <Star size={11} className="fill-current" />
                {Number(item.vote_average).toFixed(1)}
              </span>
            )}
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-white sm:text-2xl">
                {title}
              </h3>
              {item.overview && (
                <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-zinc-300 sm:text-sm">
                  {item.overview}
                </p>
              )}
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-md transition-colors group-hover:bg-violet-500">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
