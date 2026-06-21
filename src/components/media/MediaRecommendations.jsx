import { useRef } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section className="mx-auto max-w-[1600px] px-5 sm:px-8 md:px-12 xl:px-16">
      <div className="overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.12),transparent_48%)] py-7 md:py-9">
        <div className="flex items-end justify-between gap-4 px-5 md:px-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
              Continue explorando
            </span>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Você também pode gostar
            </h2>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="mr-2 text-xs font-semibold text-zinc-500">
              {visibleItems.length} sugestões
            </span>
            <button
              type="button"
              onClick={() => slide("left")}
              aria-label="Voltar nas recomendações"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              onClick={() => slide("right")}
              aria-label="Avançar nas recomendações"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        <div
          ref={rowRef}
          className="mt-6 flex snap-x snap-mandatory gap-3.5 overflow-x-auto scroll-smooth px-5 pb-2 scrollbar-hide md:snap-none md:gap-5 md:px-8"
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
                className="group w-[78vw] max-w-[310px] shrink-0 snap-start sm:w-[340px] sm:max-w-none md:w-[390px]"
              >
                <article className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet-300/30">
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
                      {year && <span className="h-1 w-1 rounded-full bg-violet-400" />}
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
