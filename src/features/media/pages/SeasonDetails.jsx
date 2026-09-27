import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Layers3,
  ListVideo,
  PlayCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSeasonDetailsLogic } from "@features/media/hooks/useSeasonDetailsLogic";

const PROVIDERS = { netflix: "Netflix", "prime-video": "Prime Video", "disney-plus": "Disney+", max: "Max", globoplay: "Globoplay", "paramount-plus": "Paramount+", "apple-tv-plus": "Apple TV+", crunchyroll: "Crunchyroll" };

const formatDate = (date) => {
  if (!date) return "Data a confirmar";
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SeasonDetails() {
  const { seasonData, tvShow, loading, tvId, watchProgress } = useSeasonDetailsLogic();

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!seasonData) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950 text-white">
        Temporada não encontrada.
      </div>
    );
  }

  const episodes = seasonData.episodes || [];
  const seasonPoster = seasonData.poster_path
    ? `https://image.tmdb.org/t/p/w500${seasonData.poster_path}`
    : null;
  const backdrop = tvShow?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
    : episodes.find((episode) => episode.still_path)?.still_path
      ? `https://image.tmdb.org/t/p/original${episodes.find((episode) => episode.still_path).still_path}`
      : null;
  const availableSeasons = (tvShow?.seasons || []).filter(
    (season) => season.episode_count > 0,
  );
  const averageRuntime = episodes.filter((episode) => episode.runtime).length
    ? Math.round(
        episodes.reduce((total, episode) => total + (episode.runtime || 0), 0) /
          episodes.filter((episode) => episode.runtime).length,
      )
    : null;

  return (
    <div className="relative isolate -mt-24 min-h-screen overflow-x-hidden bg-[#101115] pb-24 text-white md:-mt-8">
      <header className="relative h-[70svh] min-h-[580px] max-h-[720px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-48"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
          }}
        >
          {backdrop ? (
            <img src={backdrop} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-950/30 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,17,21,0.96)_0%,rgba(16,17,21,0.72)_42%,rgba(16,17,21,0.12)_80%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#101115_0%,rgba(16,17,21,0.72)_18%,transparent_58%,rgba(16,17,21,0.25)_100%)]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-32 z-[1] h-64 bg-gradient-to-b from-transparent via-[#101115]/70 to-[#101115]" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1380px] flex-col px-5 pb-12 pt-28 sm:px-8 md:px-10 md:pb-16 xl:px-12">
          <Link
            to={`/app/tv/${tvId}`}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-black/30 px-4 py-2.5 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:bg-white hover:text-black"
          >
            <ArrowLeft size={16} /> Voltar para a série
          </Link>

          <div className="mt-auto flex items-end gap-7 xl:gap-10">
            {seasonPoster && (
              <div className="hidden w-[165px] shrink-0 overflow-hidden rounded-xl bg-zinc-900 shadow-[0_18px_48px_rgba(0,0,0,0.45)] md:block xl:w-[190px]">
                <img
                  src={seasonPoster}
                  alt={`Pôster de ${seasonData.name}`}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            )}

            <div className="max-w-3xl pb-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                {tvShow?.name || "Série"}
              </span>
              <h1 className="mt-2 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl xl:text-[3.2rem]">
                {seasonData.name}
              </h1>
              {seasonData.overview && (
                <p className="mt-5 line-clamp-3 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                  {seasonData.overview}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-zinc-300">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} /> {seasonData.air_date?.slice(0, 4) || "TBA"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ListVideo size={14} /> {episodes.length} episódios
                </span>
                {averageRuntime && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} /> média de {averageRuntime} min
                  </span>
                )}
                {seasonData.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-yellow-200">
                    <Star size={14} className="fill-yellow-300 text-yellow-300" />
                    {seasonData.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-5 sm:px-8 md:px-10 lg:grid-cols-12 lg:gap-14 xl:px-12">
        <main className="lg:col-span-8 xl:col-span-9">
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                Guia da temporada
              </span>
              <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">Episódios</h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">{episodes.length} no total</span>
          </div>

          {episodes.length > 0 ? (
            <ol className="space-y-2.5">
              {episodes.map((episode) => {
                const progress = watchProgress.find((item) => String(item.tmdbId) === String(tvId) && Number(item.seasonNumber) === Number(seasonData.season_number) && Number(item.episodeNumber) === Number(episode.episode_number));
                return (
                <li key={episode.id}>
                  <Link
                    to={`/app/tv/${tvId}/season/${seasonData.season_number}/episode/${episode.episode_number}`}
                    className="group grid overflow-hidden rounded-xl bg-white/[0.025] transition-colors hover:bg-white/[0.045] sm:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-zinc-900 sm:aspect-auto sm:min-h-[150px]">
                      {episode.still_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                          alt={episode.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-semibold text-zinc-600">
                          Imagem indisponível
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent sm:bg-gradient-to-r" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                        Episódio {episode.episode_number}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col justify-center p-4 md:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">
                            S{String(seasonData.season_number).padStart(2, "0")} · E{String(episode.episode_number).padStart(2, "0")}
                          </span>
                          <h3 className="mt-1.5 text-base font-semibold leading-tight text-white transition-colors group-hover:text-violet-200 md:text-lg">
                            {episode.name}
                          </h3>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-zinc-500 transition-all group-hover:bg-white group-hover:text-black">
                          <ChevronRight size={17} />
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={12} /> {formatDate(episode.air_date)}
                        </span>
                        {episode.runtime && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={12} /> {episode.runtime} min
                          </span>
                        )}
                        {episode.vote_average > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-yellow-300">
                            <Star size={11} className="fill-yellow-300" />
                            {episode.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400 md:text-sm">
                        {episode.overview || "Abra o episódio para conferir todos os detalhes."}
                      </p>
                      {progress && <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold text-zinc-400"><span className="inline-flex items-center gap-1.5"><PlayCircle size={12} className="text-violet-300" />Assistido no {PROVIDERS[progress.provider] || progress.provider}</span><span>{Number(progress.durationSeconds) > 0 ? Math.min(100, Math.round((Number(progress.positionSeconds) / Number(progress.durationSeconds)) * 100)) : 0}%</span></div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-violet-500" style={{ width: `${Number(progress.durationSeconds) > 0 ? Math.min(100, Math.round((Number(progress.positionSeconds) / Number(progress.durationSeconds)) * 100)) : 0}%` }} /></div>
                      </div>}
                    </div>
                  </Link>
                </li>
                );
              })}
            </ol>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
              Os episódios desta temporada ainda não foram divulgados.
            </div>
          )}
        </main>

        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/10 text-violet-300">
                <Layers3 size={17} />
              </span>
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Navegação
                </span>
                <h2 className="text-base font-semibold text-white">Outras temporadas</h2>
              </div>
            </div>

            <div className="scrollbar-hide mt-4 max-h-[480px] space-y-1.5 overflow-y-auto">
              {availableSeasons.map((season) => {
                const isCurrent = season.season_number === seasonData.season_number;
                return (
                  <Link
                    key={season.id}
                    to={`/app/tv/${tvId}/season/${season.season_number}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                      isCurrent
                        ? "border-violet-400/35 bg-violet-500/10"
                        : "border-transparent bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.045]"
                    }`}
                  >
                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {season.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w154${season.poster_path}`}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`block truncate text-xs font-black ${isCurrent ? "text-violet-200" : "text-zinc-200"}`}>
                        {season.name}
                      </span>
                      <span className="mt-1 block text-[10px] text-zinc-600">
                        {season.episode_count} episódios · {season.air_date?.slice(0, 4) || "TBA"}
                      </span>
                    </div>
                    {isCurrent && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
