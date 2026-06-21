import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ListVideo, Star } from "lucide-react";

export default function SeasonInfo({ tvId, seasons }) {
  const availableSeasons = useMemo(
    () => (seasons || []).filter((season) => season.episode_count > 0),
    [seasons],
  );
  const [selectedNumber, setSelectedNumber] = useState(
    availableSeasons.find((season) => season.season_number > 0)?.season_number ??
      availableSeasons[0]?.season_number,
  );

  useEffect(() => {
    if (availableSeasons.some((season) => season.season_number === selectedNumber)) return;
    setSelectedNumber(
      availableSeasons.find((season) => season.season_number > 0)?.season_number ??
        availableSeasons[0]?.season_number,
    );
  }, [availableSeasons, selectedNumber]);

  if (availableSeasons.length === 0) return null;

  const selectedSeason =
    availableSeasons.find((season) => season.season_number === selectedNumber) ||
    availableSeasons[0];

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
            Guia da série
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-black text-white">Temporadas</h2>
        </div>
        <span className="text-xs font-semibold text-zinc-500">
          {availableSeasons.length} {availableSeasons.length === 1 ? "temporada" : "temporadas"}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-violet-950/35 via-zinc-900/70 to-zinc-950 p-5 md:p-7">
        {selectedSeason.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${selectedSeason.poster_path}`}
            alt=""
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover opacity-10 blur-sm md:block"
          />
        )}
        <div className="relative flex gap-5 md:gap-7">
          <div className="h-36 w-24 md:h-48 md:w-32 shrink-0 overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl">
            {selectedSeason.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${selectedSeason.poster_path}`}
                className="h-full w-full object-cover"
                alt={selectedSeason.name}
              />
            ) : (
              <div className="grid h-full place-items-center px-2 text-center text-xs text-zinc-500">
                Sem capa
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 py-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-bold text-zinc-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-1 text-yellow-300">
                <Star size={12} className="fill-yellow-300" />
                {selectedSeason.vote_average > 0
                  ? selectedSeason.vote_average.toFixed(1)
                  : "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ListVideo size={13} /> {selectedSeason.episode_count} episódios
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} /> {selectedSeason.air_date?.slice(0, 4) || "TBA"}
              </span>
            </div>

            <h3 className="mt-3 text-xl md:text-3xl font-black text-white">
              {selectedSeason.name}
            </h3>
            <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-zinc-400 sm:line-clamp-3 sm:block">
              {selectedSeason.overview || "Informações desta temporada ainda não foram divulgadas."}
            </p>
            <Link
              to={`/app/tv/${tvId}/season/${selectedSeason.season_number}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-zinc-950 transition-all hover:bg-violet-100 hover:gap-3 md:mt-5 md:px-5"
            >
              Ver episódios <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="content-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4">
        {availableSeasons.map((season) => {
          const selected = season.season_number === selectedSeason.season_number;
          return (
            <button
              type="button"
              key={season.id}
              onClick={() => setSelectedNumber(season.season_number)}
              className={`group flex w-40 md:w-48 shrink-0 snap-start items-center gap-3 rounded-2xl border p-2 text-left transition-all ${
                selected
                  ? "border-violet-400/60 bg-violet-500/10"
                  : "border-white/[0.06] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                {season.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w154${season.poster_path}`}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold text-white">{season.name}</span>
                <span className="mt-1 block text-[10px] text-zinc-500">
                  {season.episode_count} episódios
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
