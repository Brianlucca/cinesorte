import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Star,
  Tag,
  User,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MediaImages from "@features/media/components/MediaImages";
import ReviewsSection from "@features/media/components/reviews/ReviewsSection";
import TrailerModal from "@features/media/components/TrailerModal";
import { useEpisodeDetailsLogic } from "@features/media/hooks/useEpisodeDetailsLogic";

const formatDate = (date) => {
  if (!date) return "Data a confirmar";
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

function EpisodeNavigationCard({ episode, direction, tvId, seasonNumber }) {
  if (!episode) return <div className="hidden md:block" />;
  const isPrevious = direction === "previous";
  return (
    <Link
      to={`/app/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`}
      className={`group flex items-center gap-3 rounded-xl bg-white/[0.025] p-3 transition-colors hover:bg-white/[0.05] ${
        isPrevious ? "text-left" : "justify-end text-right"
      }`}
    >
      {isPrevious && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.04] text-zinc-500 transition-all group-hover:bg-white group-hover:text-black">
          <ChevronLeft size={17} />
        </span>
      )}
      <div className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-violet-400/75">
          {isPrevious ? "Episódio anterior" : "Próximo episódio"}
        </span>
        <span className="mt-1 block truncate text-xs font-bold text-zinc-200">
          E{String(episode.episode_number).padStart(2, "0")} · {episode.name}
        </span>
      </div>
      {!isPrevious && (
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.04] text-zinc-500 transition-all group-hover:bg-white group-hover:text-black">
          <ChevronRight size={17} />
        </span>
      )}
    </Link>
  );
}

export default function EpisodeDetails() {
  const location = useLocation();
  const {
    episode,
    tvShow,
    seasonData,
    reviews,
    followingList,
    loading,
    tvId,
    seasonNumber,
    watchProgress,
    actions,
  } = useEpisodeDetailsLogic();
  const [trailerOpen, setTrailerOpen] = useState(false);
  const guestCastRef = useRef(null);

  useEffect(() => {
    if (!loading && location.hash === "#avaliacoes") window.setTimeout(() => document.querySelector("#avaliacoes")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [loading, location.hash]);

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950 text-white">
        Episódio não encontrado.
      </div>
    );
  }

  const title = episode.name;
  const bannerPath = episode.still_path || tvShow?.backdrop_path;
  const banner = bannerPath
    ? `https://image.tmdb.org/t/p/original${bannerPath}`
    : null;
  const trailerKey = episode.videos?.results?.find(
    (video) =>
      video.site === "YouTube" && ["Trailer", "Teaser", "Clip"].includes(video.type),
  )?.key;
  const seasonEpisodes = seasonData?.episodes || [];
  const currentIndex = seasonEpisodes.findIndex(
    (item) => item.episode_number === episode.episode_number,
  );
  const previousEpisode = currentIndex > 0 ? seasonEpisodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex >= 0 && currentIndex < seasonEpisodes.length - 1
      ? seasonEpisodes[currentIndex + 1]
      : null;
  const mainCrew = (episode.crew || [])
    .filter((person) => ["Director", "Writer", "Screenplay"].includes(person.job))
    .slice(0, 6);
  const galleryImages = {
    backdrops: episode.images?.stills || [],
    posters: [],
  };
  const progressPercent = Number(watchProgress?.durationSeconds) > 0 ? Math.min(100, Math.round((Number(watchProgress?.positionSeconds) / Number(watchProgress?.durationSeconds)) * 100)) : 0;
  const watchedMinutes = Math.floor((Number(watchProgress?.positionSeconds) || 0) / 60);
  const remainingMinutes = Math.max(0, Math.ceil(((Number(watchProgress?.durationSeconds) || 0) - (Number(watchProgress?.positionSeconds) || 0)) / 60));
  const providerNames = { netflix: "Netflix", "prime-video": "Prime Video", "disney-plus": "Disney+", max: "Max", globoplay: "Globoplay", "paramount-plus": "Paramount+", "apple-tv-plus": "Apple TV+", crunchyroll: "Crunchyroll" };
  const slideGuestCast = (direction) => {
    if (!guestCastRef.current) return;
    guestCastRef.current.scrollBy({
      left: direction === "left" ? -guestCastRef.current.clientWidth * 0.8 : guestCastRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative isolate -mt-24 min-h-screen overflow-x-hidden bg-[#101115] pb-24 text-white md:-mt-8">
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailerKey}
        title={`${tvShow?.name || "Série"} — ${title}`}
      />

      <header className="relative h-[72svh] min-h-[590px] max-h-[740px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-52"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
          }}
        >
          {banner ? (
            <img src={banner} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-950/30 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,17,21,0.96)_0%,rgba(16,17,21,0.7)_42%,rgba(16,17,21,0.1)_80%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#101115_0%,rgba(16,17,21,0.72)_18%,transparent_58%,rgba(16,17,21,0.25)_100%)]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-32 z-[1] h-64 bg-gradient-to-b from-transparent via-[#101115]/70 to-[#101115]" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1380px] flex-col px-5 pb-12 pt-28 sm:px-8 md:px-10 md:pb-16 xl:px-12">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/app/tv/${tvId}/season/${seasonNumber}`}
              className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-2.5 text-xs font-medium text-zinc-200 backdrop-blur-md transition-colors hover:bg-white hover:text-black"
            >
              <ArrowLeft size={16} /> Voltar à temporada
            </Link>
            <Link
              to={`/app/tv/${tvId}`}
              className="rounded-full bg-black/20 px-4 py-2.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition-colors hover:text-white"
            >
              {tvShow?.name || "Ver série"}
            </Link>
          </div>

          <div className="mt-auto w-full max-w-6xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              Temporada {seasonNumber} · Episódio {episode.episode_number}
            </span>
            <h1 className="mt-2 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl xl:text-[3.2rem]">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-300">
              {episode.vote_average > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-yellow-200">
                  <Star size={14} className="fill-yellow-300" /> {episode.vote_average.toFixed(1)}
                </span>
              )}
              <span className="inline-flex shrink-0 items-center gap-1.5">
                <Calendar size={14} /> {formatDate(episode.air_date)}
              </span>
              {episode.runtime && (
                <span className="inline-flex shrink-0 items-center gap-1.5">
                  <Clock size={14} /> {episode.runtime} min
                </span>
              )}
              {watchProgress && (
                <div className="flex w-full min-w-0 items-center gap-3 border-l border-white/15 pl-4 sm:w-[336px] sm:shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[9px] font-black uppercase tracking-[0.16em] text-violet-300/80">
                        Continuar · {providerNames[watchProgress.provider] || watchProgress.provider}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-zinc-300">{progressPercent}%</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-violet-400" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="mt-1.5 truncate text-[10px] text-zinc-400">
                      {watchedMinutes} min assistidos{Number(watchProgress.durationSeconds) <= 0 ? " · duração sendo corrigida" : remainingMinutes > 0 ? ` · ${remainingMinutes} min restantes` : " · concluído"}
                    </p>
                  </div>
                  {watchProgress.url && (
                    <a href={watchProgress.url} target="_blank" rel="noreferrer" aria-label="Continuar no streaming" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-violet-300/20 bg-violet-400/15 text-violet-200 transition hover:scale-105 hover:bg-violet-400/25">
                      <Play size={13} fill="currentColor" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {trailerKey && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100"
              >
                <Play size={17} className="fill-current" /> Assistir vídeo
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-20 mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-5 sm:px-8 md:px-10 lg:grid-cols-12 lg:gap-14 xl:px-12">
        <main className="space-y-12 lg:col-span-8 md:space-y-14">
          {(previousEpisode || nextEpisode) && (
            <nav className="grid gap-3 md:grid-cols-2" aria-label="Navegação entre episódios">
              <EpisodeNavigationCard
                episode={previousEpisode}
                direction="previous"
                tvId={tvId}
                seasonNumber={seasonNumber}
              />
              <EpisodeNavigationCard
                episode={nextEpisode}
                direction="next"
                tvId={tvId}
                seasonNumber={seasonNumber}
              />
            </nav>
          )}

          <section className="border-t border-white/[0.07] pt-8">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
              Neste episódio
            </span>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">Sinopse</h2>
            <p className="mt-4 text-[15px] leading-7 text-zinc-300 md:text-base md:leading-8">
              {episode.overview || "Nenhuma descrição disponível para este episódio."}
            </p>
          </section>

          {episode.guest_stars?.length > 0 && (
            <section>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                    Participações especiais
                  </span>
                  <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">Elenco convidado</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-1 hidden text-xs font-medium text-zinc-500 sm:inline">{episode.guest_stars.length} integrantes</span>
                  <button type="button" onClick={() => slideGuestCast("left")} aria-label="Voltar no elenco convidado" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => slideGuestCast("right")} aria-label="Avançar no elenco convidado" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.09] hover:text-white">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div ref={guestCastRef} className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2">
                {episode.guest_stars.map((person) => (
                  <Link
                    to={`/app/person/${person.id}`}
                    key={person.id}
                    className="group flex w-[230px] shrink-0 snap-start items-center gap-3 rounded-xl bg-white/[0.025] p-2.5 transition-colors hover:bg-white/[0.05] md:w-[260px]"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-zinc-600">
                          <User size={28} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white group-hover:text-violet-300">
                        {person.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                        {person.character || "Participação especial"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {galleryImages.backdrops.length > 0 && (
            <MediaImages images={galleryImages} title={title} />
          )}

          <section id="avaliacoes" className="relative scroll-mt-24 overflow-visible border-t border-white/[0.07] pt-8">
            <div className="mb-7">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                Conversa da comunidade
              </span>
              <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">
                Avaliações do episódio
              </h2>
            </div>
            <ReviewsSection
              reviews={reviews}
              onPostReview={actions.handlePostReview}
              onReply={actions.handlePostReply}
              onLike={actions.handleLikeReview}
              onDelete={actions.handleDeleteReview}
              onDeleteComment={actions.handleDeleteComment}
              onEditReview={actions.handleEditReview}
              onEditReply={actions.handleEditReply}
              onLoadReplies={actions.handleLoadReplies}
              followingList={followingList}
            />
          </section>
        </main>

        <aside className="space-y-4 lg:col-span-4 lg:pt-8">
          <section className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/10 text-violet-300">
                <Tag size={17} />
              </span>
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Informações
                </span>
                <h2 className="text-base font-semibold text-white">Ficha do episódio</h2>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-4">
              <div className="border-b border-white/[0.05] py-3.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Temporada</span>
                <span className="mt-1.5 block text-sm font-black text-white">{seasonNumber}</span>
              </div>
              <div className="border-b border-white/[0.05] py-3.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Episódio</span>
                <span className="mt-1.5 block text-sm font-black text-white">
                  {episode.episode_number}
                </span>
              </div>
              <div className="col-span-2 py-3.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Série</span>
                <Link
                  to={`/app/tv/${tvId}`}
                  className="mt-1.5 block text-sm font-bold text-zinc-200 transition-colors hover:text-violet-300"
                >
                  {tvShow?.name || "Não informada"}
                </Link>
              </div>
            </div>

            {mainCrew.length > 0 && (
              <div className="mt-7 border-t border-white/[0.06] pt-7">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-zinc-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Direção e roteiro
                  </h3>
                </div>
                <div className="mt-4 space-y-2.5">
                  {mainCrew.map((person) => (
                    <Link
                      to={`/app/person/${person.id}`}
                      key={`${person.id}-${person.job}`}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.035]"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                            alt={person.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-zinc-600">
                            <User size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-bold text-zinc-200 group-hover:text-violet-300">
                          {person.name}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-zinc-600">{person.job}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`/app/tv/${tvId}/season/${seasonNumber}`}
              className="mt-7 flex items-center justify-between rounded-lg bg-violet-500/[0.08] px-4 py-3 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/15"
            >
              Ver todos os episódios <ArrowRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
