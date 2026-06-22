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
import { useState } from "react";
import { Link } from "react-router-dom";
import MediaImages from "../../components/media/MediaImages";
import ReviewsSection from "../../components/media/reviews/ReviewsSection";
import TrailerModal from "../../components/media/TrailerModal";
import { useEpisodeDetailsLogic } from "../../hooks/useEpisodeDetailsLogic";

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
      className={`group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 transition-all hover:border-violet-300/25 hover:bg-white/[0.05] ${
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
  const {
    episode,
    tvShow,
    seasonData,
    reviews,
    followingList,
    loading,
    tvId,
    seasonNumber,
    actions,
  } = useEpisodeDetailsLogic();
  const [trailerOpen, setTrailerOpen] = useState(false);

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

  return (
    <div className="relative isolate -mt-24 min-h-screen overflow-x-hidden bg-zinc-950 pb-24 text-white md:-mt-8">
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        videoKey={trailerKey}
        title={`${tvShow?.name || "Série"} — ${title}`}
      />

      <header className="relative h-[78svh] min-h-[650px] max-h-[820px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-52"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.8) 78%, rgba(0,0,0,0.24) 92%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.8) 78%, rgba(0,0,0,0.24) 92%, transparent 100%)",
          }}
        >
          {banner ? (
            <img src={banner} alt="" className="h-full w-full object-cover object-center" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-950/30 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.8)_40%,rgba(9,9,11,0.2)_78%,rgba(9,9,11,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#09090b_0%,rgba(9,9,11,0.86)_12%,transparent_56%,rgba(9,9,11,0.34)_100%)]" />
          <div className="absolute -bottom-16 left-[18%] h-80 w-[38rem] rounded-full bg-violet-700/10 blur-[125px]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 -bottom-48 z-[1] h-80 bg-gradient-to-b from-transparent via-zinc-950/75 to-zinc-950" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col px-5 pb-20 pt-28 sm:px-8 md:px-12 md:pb-24 xl:px-16">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/app/tv/${tvId}/season/${seasonNumber}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-200 backdrop-blur-xl transition-all hover:bg-white hover:text-black"
            >
              <ArrowLeft size={16} /> Voltar à temporada
            </Link>
            <Link
              to={`/app/tv/${tvId}`}
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-xs font-bold text-zinc-400 backdrop-blur-xl transition-colors hover:text-white"
            >
              {tvShow?.name || "Ver série"}
            </Link>
          </div>

          <div className="mt-auto max-w-4xl">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-300">
              Temporada {seasonNumber} · Episódio {episode.episode_number}
            </span>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-5xl md:text-[3rem] xl:text-[3.45rem]">
              {title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-semibold text-zinc-300">
              {episode.vote_average > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-yellow-300/15 bg-yellow-300/[0.08] px-3 py-2 text-yellow-200 backdrop-blur-xl">
                  <Star size={14} className="fill-yellow-300" /> {episode.vote_average.toFixed(1)}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                <Calendar size={14} /> {formatDate(episode.air_date)}
              </span>
              {episode.runtime && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                  <Clock size={14} /> {episode.runtime} min
                </span>
              )}
            </div>

            {trailerKey && (
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-black text-zinc-950 transition-all hover:scale-[1.02] hover:bg-violet-100"
              >
                <Play size={17} className="fill-current" /> Assistir vídeo
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-20 mx-auto -mt-8 grid max-w-[1600px] grid-cols-1 gap-10 px-5 sm:px-8 md:-mt-12 md:px-12 lg:grid-cols-12 lg:gap-12 xl:px-16">
        <main className="space-y-14 lg:col-span-8 md:space-y-16">
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

          <section className="relative pl-5 md:pl-8">
            <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-violet-400 via-violet-500/35 to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
              Neste episódio
            </span>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Sinopse</h2>
            <p className="mt-5 text-base font-light leading-8 text-zinc-300 md:text-lg md:leading-9">
              {episode.overview || "Nenhuma descrição disponível para este episódio."}
            </p>
          </section>

          {episode.guest_stars?.length > 0 && (
            <section>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
                    Participações especiais
                  </span>
                  <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Elenco convidado</h2>
                </div>
                <span className="text-xs font-semibold text-zinc-500">
                  {episode.guest_stars.length} integrantes
                </span>
              </div>
              <div className="content-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-4 md:gap-4">
                {episode.guest_stars.map((person) => (
                  <Link
                    to={`/app/person/${person.id}`}
                    key={person.id}
                    className="group flex w-[250px] shrink-0 snap-start items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 transition-all hover:-translate-y-1 hover:border-violet-300/25 hover:bg-white/[0.05] md:w-[285px]"
                  >
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
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

          <section className="relative overflow-visible rounded-[2rem] border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.08),transparent_38%)] p-5 sm:p-7 md:p-9">
            <div className="mb-7">
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
                Conversa da comunidade
              </span>
              <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
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

        <aside className="space-y-5 lg:col-span-4">
          <section className="rounded-[2rem] border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-7 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/10 text-violet-300">
                <Tag size={17} />
              </span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Informações
                </span>
                <h2 className="text-lg font-black text-white">Ficha do episódio</h2>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.05] bg-black/10 p-3.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Temporada</span>
                <span className="mt-1.5 block text-sm font-black text-white">{seasonNumber}</span>
              </div>
              <div className="rounded-2xl border border-white/[0.05] bg-black/10 p-3.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Episódio</span>
                <span className="mt-1.5 block text-sm font-black text-white">
                  {episode.episode_number}
                </span>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/[0.05] bg-black/10 p-3.5">
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
                      className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-all hover:border-white/[0.06] hover:bg-white/[0.025]"
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
              className="mt-7 flex items-center justify-between rounded-2xl border border-violet-400/15 bg-violet-500/[0.07] px-4 py-3 text-xs font-black text-violet-200 transition-all hover:bg-violet-500/15"
            >
              Ver todos os episódios <ArrowRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
