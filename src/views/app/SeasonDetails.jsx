import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Layers3,
  ListVideo,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSeasonDetailsLogic } from "../../hooks/useSeasonDetailsLogic";

const formatDate = (date) => {
  if (!date) return "Data a confirmar";
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SeasonDetails() {
  const { seasonData, tvShow, loading, tvId } = useSeasonDetailsLogic();

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
    <div className="relative isolate -mt-24 min-h-screen overflow-x-hidden bg-zinc-950 pb-24 text-white md:-mt-8">
      <header className="relative h-[76svh] min-h-[650px] max-h-[780px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-48"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.78) 78%, rgba(0,0,0,0.22) 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.78) 78%, rgba(0,0,0,0.22) 92%, transparent 100%)",
          }}
        >
          {backdrop ? (
            <img src={backdrop} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-950/30 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.82)_38%,rgba(9,9,11,0.25)_75%,rgba(9,9,11,0.12)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#09090b_0%,rgba(9,9,11,0.86)_12%,transparent_55%,rgba(9,9,11,0.35)_100%)]" />
          <div className="absolute -bottom-20 left-[20%] h-80 w-[34rem] rounded-full bg-violet-700/10 blur-[120px]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-44 z-[1] h-72 bg-gradient-to-b from-transparent via-zinc-950/70 to-zinc-950" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col px-5 pb-20 pt-28 sm:px-8 md:px-12 md:pb-24 xl:px-16">
          <Link
            to={`/app/tv/${tvId}`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-200 backdrop-blur-xl transition-all hover:bg-white hover:text-black"
          >
            <ArrowLeft size={16} /> Voltar para a série
          </Link>

          <div className="mt-auto flex items-end gap-7 xl:gap-10">
            {seasonPoster && (
              <div className="hidden w-[180px] shrink-0 overflow-hidden rounded-[1.5rem] border border-white/15 bg-zinc-900 shadow-[0_30px_70px_rgba(0,0,0,0.65)] md:block xl:w-[210px]">
                <img
                  src={seasonPoster}
                  alt={`Pôster de ${seasonData.name}`}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            )}

            <div className="max-w-3xl pb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-300">
                {tvShow?.name || "Série"}
              </span>
              <h1 className="mt-3 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl md:text-[3rem] xl:text-[3.45rem]">
                {seasonData.name}
              </h1>
              {seasonData.overview && (
                <p className="mt-5 line-clamp-3 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                  {seasonData.overview}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-semibold text-zinc-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                  <Calendar size={14} /> {seasonData.air_date?.slice(0, 4) || "TBA"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                  <ListVideo size={14} /> {episodes.length} episódios
                </span>
                {averageRuntime && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                    <Clock size={14} /> média de {averageRuntime} min
                  </span>
                )}
                {seasonData.vote_average > 0 && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-300/[0.08] px-3 py-2 text-yellow-200 backdrop-blur-xl">
                    <Star size={14} className="fill-yellow-300 text-yellow-300" />
                    {seasonData.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 mx-auto -mt-8 grid max-w-[1600px] grid-cols-1 gap-10 px-5 sm:px-8 md:-mt-12 md:px-12 lg:grid-cols-12 lg:gap-12 xl:px-16">
        <main className="lg:col-span-8 xl:col-span-9">
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
                Guia da temporada
              </span>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Episódios</h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">{episodes.length} no total</span>
          </div>

          {episodes.length > 0 ? (
            <ol className="space-y-3.5">
              {episodes.map((episode) => (
                <li key={episode.id}>
                  <Link
                    to={`/app/tv/${tvId}/season/${seasonData.season_number}/episode/${episode.episode_number}`}
                    className="group grid overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-gradient-to-br from-white/[0.035] to-white/[0.012] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/25 sm:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]"
                  >
                    <div className="relative aspect-video overflow-hidden bg-zinc-900 sm:aspect-auto sm:min-h-[170px]">
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
                      <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                        Episódio {episode.episode_number}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col justify-center p-5 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-400/80">
                            S{String(seasonData.season_number).padStart(2, "0")} · E{String(episode.episode_number).padStart(2, "0")}
                          </span>
                          <h3 className="mt-1.5 text-lg font-black leading-tight text-white transition-colors group-hover:text-violet-200 md:text-xl">
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
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
              Os episódios desta temporada ainda não foram divulgados.
            </div>
          )}
        </main>

        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Layers3 size={17} />
              </span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Navegação
                </span>
                <h2 className="text-base font-black text-white">Outras temporadas</h2>
              </div>
            </div>

            <div className="content-scrollbar mt-5 max-h-[480px] space-y-2 overflow-y-auto pr-2">
              {availableSeasons.map((season) => {
                const isCurrent = season.season_number === seasonData.season_number;
                return (
                  <Link
                    key={season.id}
                    to={`/app/tv/${tvId}/season/${season.season_number}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-2xl border p-2.5 transition-all ${
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
