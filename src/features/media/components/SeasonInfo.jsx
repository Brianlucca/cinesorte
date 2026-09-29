import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, ListVideo, Star } from "lucide-react";

export default function SeasonInfo({ tvId, seasons }) {
  const availableSeasons = useMemo(
    () => (seasons || []).filter((season) => season.episode_count > 0),
    [seasons],
  );
  const [selectedNumber, setSelectedNumber] = useState(
    availableSeasons.find((season) => season.season_number > 0)?.season_number ??
      availableSeasons[0]?.season_number,
  );
  const seasonsRailRef = useRef(null);

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
  const selectedIndex = availableSeasons.findIndex(
    (season) => season.season_number === selectedSeason.season_number,
  );

  const selectAdjacentSeason = (direction) => {
    const nextIndex = Math.min(
      Math.max(selectedIndex + direction, 0),
      availableSeasons.length - 1,
    );
    const nextSeason = availableSeasons[nextIndex];
    if (!nextSeason || nextIndex === selectedIndex) return;

    setSelectedNumber(nextSeason.season_number);
    seasonsRailRef.current
      ?.querySelector(`[data-season-number="${nextSeason.season_number}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--media-accent-text)]">
            Guia da série
          </span>
          <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">Temporadas</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-xs font-semibold text-zinc-500 sm:inline">
            {availableSeasons.length} {availableSeasons.length === 1 ? "temporada" : "temporadas"}
          </span>
          {availableSeasons.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => selectAdjacentSeason(-1)}
                disabled={selectedIndex <= 0}
                aria-label="Temporada anterior"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => selectAdjacentSeason(1)}
                disabled={selectedIndex >= availableSeasons.length - 1}
                aria-label="Próxima temporada"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 md:p-5">
        {selectedSeason.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w500${selectedSeason.poster_path}`}
            alt=""
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-2/5 object-cover opacity-[0.06] md:block"
          />
        )}
        <div className="relative flex gap-4 md:gap-5">
          <div className="h-32 w-[86px] shrink-0 overflow-hidden rounded-lg bg-zinc-800 md:h-40 md:w-[108px]">
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
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-zinc-400 md:text-xs">
              <span className="inline-flex items-center gap-1.5 text-yellow-300">
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

            <h3 className="mt-2.5 text-lg font-semibold text-white md:text-2xl">
              {selectedSeason.name}
            </h3>
            <p className="mt-3 hidden max-w-2xl text-sm leading-relaxed text-zinc-400 sm:line-clamp-3 sm:block">
              {selectedSeason.overview || "Informações desta temporada ainda não foram divulgadas."}
            </p>
            <Link
              to={`/app/tv/${tvId}/season/${selectedSeason.season_number}`}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--media-accent)] px-4 py-2.5 text-xs font-semibold text-[var(--media-accent-contrast)] transition-colors hover:bg-[var(--media-accent-hover)] md:mt-5"
            >
              Ver episódios <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div ref={seasonsRailRef} className="scrollbar-hide mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
        {availableSeasons.map((season) => {
          const selected = season.season_number === selectedSeason.season_number;
          return (
            <button
              type="button"
              key={season.id}
              data-season-number={season.season_number}
              onClick={() => setSelectedNumber(season.season_number)}
              className={`group flex w-40 shrink-0 snap-start items-center gap-3 rounded-lg border p-2 text-left transition-colors md:w-44 ${
                selected
                  ? "border-[var(--media-accent-border)] bg-[var(--media-accent-soft)]"
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
