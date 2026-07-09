import {
  Building,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Facebook,
  Globe,
  Heart,
  Instagram,
  Play,
  Plus,
  Share2,
  Star,
  Tag,
  Twitter,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMediaDetailsLogic } from "@features/media/hooks/useMediaDetailsLogic";
import AddToListModal from "@features/media/components/AddToListModal";
import MediaImages from "@features/media/components/MediaImages";
import ReviewsSection from "@features/media/components/reviews/ReviewsSection";
import SeasonInfo from "@features/media/components/SeasonInfo";
import TrailerModal from "@features/media/components/TrailerModal";
import MediaRecommendations from "@features/media/components/MediaRecommendations";

const SectionHeading = ({ eyebrow, children, aside }) => (
  <div className="mb-6 flex items-end justify-between gap-4">
    <div>
      {eyebrow && (
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{children}</h2>
    </div>
    {aside}
  </div>
);

const getStatusColor = (status) => {
  if (["Released", "Returning Series"].includes(status)) return "text-emerald-400";
  if (status === "Ended") return "text-red-400";
  if (status === "In Production") return "text-yellow-300";
  if (status === "Planned") return "text-sky-400";
  return "text-zinc-300";
};

export default function MediaDetails() {
  const {
    media,
    reviews,
    providers,
    similar,
    loading,
    interactions,
    userLists,
    followingList,
    addingToListId,
    modals,
    setModals,
    isEliteUser,
    communityStats,
    actions,
  } = useMediaDetailsLogic();

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="grid h-screen place-items-center bg-zinc-950 text-white">
        Conteúdo não encontrado.
      </div>
    );
  }

  const title = media.title || media.name;
  const banner = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;
  const poster = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : null;
  const trailerKey =
    media.trailer?.key ||
    media.videos?.results?.find(
      (video) => video.type === "Trailer" && video.site === "YouTube",
    )?.key;
  const directors = media.credits?.crew?.filter((person) => person.job === "Director") || [];
  const creators = media.created_by || [];
  const writers =
    media.credits?.crew
      ?.filter((person) => ["Screenplay", "Writer"].includes(person.job))
      .slice(0, 3) || [];
  const creativeLeads = creators.length > 0 ? creators : directors;
  const externalIds = media.external_ids || {};
  const releaseDate = media.release_date || media.first_air_date;
  const releaseLabel = releaseDate
    ? new Date(`${releaseDate}T12:00:00`).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
      })
    : "Data não informada";
  const runtime = media.runtime || media.episode_run_time?.[0];
  const communityAverage = communityStats
    ? Number(communityStats.average).toFixed(1)
    : null;
  const tmdbAverage = Number(media.vote_average || 0).toFixed(1);

  const openTrailer = () =>
    setModals((previous) => ({ ...previous, trailer: true }));
  const openList = () =>
    setModals((previous) => ({ ...previous, addToList: true }));

  return (
    <div className="relative isolate -mt-24 w-full overflow-x-hidden bg-zinc-950 pb-32 text-white md:-mt-8 md:pb-20">
      <TrailerModal
        isOpen={modals.trailer}
        onClose={() => setModals((previous) => ({ ...previous, trailer: false }))}
        videoKey={trailerKey}
        title={title}
      />

      <AddToListModal
        isOpen={modals.addToList}
        onClose={() => setModals((previous) => ({ ...previous, addToList: false }))}
        lists={userLists}
        onAdd={actions.handleAddToList}
        onCreate={actions.handleCreateList}
        mediaId={media.id}
        addingToListId={addingToListId}
      />

      <header className="relative min-h-[760px] h-[92svh] max-h-[980px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-48 md:-bottom-64"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 66%, rgba(0,0,0,0.82) 80%, rgba(0,0,0,0.28) 91%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 66%, rgba(0,0,0,0.82) 80%, rgba(0,0,0,0.28) 91%, transparent 100%)",
          }}
        >
          {banner ? (
            <img src={banner} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <div className="h-full w-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.78)_42%,rgba(9,9,11,0.18)_78%,rgba(9,9,11,0.08)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,#09090b_0%,rgba(9,9,11,0.88)_10%,transparent_52%,rgba(9,9,11,0.38)_100%)]" />
          <div className="absolute -bottom-16 left-[18%] h-96 w-[36rem] rounded-full bg-violet-700/10 blur-[130px]" />
          <div className="absolute -bottom-24 right-[8%] h-80 w-80 rounded-full bg-sky-900/10 blur-[120px]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-48 z-[1] h-80 bg-[linear-gradient(to_bottom,transparent_0%,rgba(9,9,11,0.42)_34%,rgba(9,9,11,0.88)_70%,#09090b_100%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-end px-5 pb-20 pt-28 sm:px-8 md:px-12 md:pb-24 xl:px-16">
          <div className="flex w-full items-end gap-8 xl:gap-12">
            {poster && (
              <div className="hidden w-[220px] shrink-0 overflow-hidden rounded-[1.75rem] border border-white/15 bg-zinc-900 shadow-[0_30px_80px_rgba(0,0,0,0.65)] lg:block xl:w-[260px]">
                <img src={poster} alt={`Pôster de ${title}`} className="aspect-[2/3] w-full object-cover" />
              </div>
            )}

            <div className="max-w-4xl min-w-0 pb-2">
              <div className="mb-4 flex flex-wrap gap-2">
                {media.genres?.slice(0, 4).map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-xl"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white drop-shadow-2xl sm:text-5xl md:text-[3rem] xl:text-[3.55rem]">
                {title}
              </h1>

              {media.tagline && (
                <p className="mt-4 max-w-2xl text-sm italic leading-relaxed text-zinc-300 sm:text-base md:text-lg">
                  “{media.tagline}”
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-zinc-300 md:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                  <Calendar size={15} /> {releaseLabel}
                </span>
                {runtime && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                    <Clock size={15} />
                    {media.runtime
                      ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
                      : `${runtime} min por episódio`}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {communityAverage && (
                  <div className="min-w-32 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="fill-violet-300 text-violet-300" />
                      <span className="text-xl font-black">{communityAverage}</span>
                      <span className="text-xs text-zinc-500">/ 5</span>
                    </div>
                    <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em] text-violet-300/80">
                      Comunidade
                    </span>
                  </div>
                )}
                <div className="min-w-32 rounded-2xl border border-yellow-300/15 bg-yellow-300/[0.07] px-4 py-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="fill-yellow-300 text-yellow-300" />
                    <span className="text-xl font-black">{tmdbAverage}</span>
                    <span className="text-xs text-zinc-500">/ 10</span>
                  </div>
                  <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em] text-yellow-200/70">
                    TMDB
                  </span>
                </div>
              </div>

              <div className="mt-7 hidden flex-wrap items-center gap-2.5 md:flex">
                {trailerKey && (
                  <button
                    type="button"
                    onClick={openTrailer}
                    className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-sm font-black text-zinc-950 transition-all hover:scale-[1.02] hover:bg-violet-100"
                  >
                    <Play size={18} className="fill-current" /> Assistir trailer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => actions.handleInteract("watched")}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-bold backdrop-blur-xl transition-all ${
                    interactions.watched
                      ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                      : "border-white/15 bg-black/25 hover:bg-white/10"
                  }`}
                >
                  <Check size={17} /> {interactions.watched ? "Assistido" : "Já assisti"}
                </button>
                <button
                  type="button"
                  onClick={() => actions.handleInteract("like")}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-xs font-bold backdrop-blur-xl transition-all ${
                    interactions.liked
                      ? "border-red-400/40 bg-red-500/20 text-red-200"
                      : "border-white/15 bg-black/25 hover:bg-white/10"
                  }`}
                >
                  <Heart size={17} fill={interactions.liked ? "currentColor" : "none"} />
                  {interactions.liked ? "Favoritado" : "Favoritar"}
                </button>
                <button
                  type="button"
                  onClick={openList}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-3 text-xs font-bold backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  <Plus size={17} /> Adicionar à lista
                </button>
                <button
                  type="button"
                  onClick={actions.handleShare}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur-xl transition-all hover:bg-white/10"
                  aria-label="Compartilhar"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-20 mx-auto -mt-8 grid max-w-[1600px] grid-cols-1 gap-10 px-5 sm:px-8 md:-mt-12 md:px-12 lg:grid-cols-12 lg:gap-12 xl:px-16">
        <main className="space-y-14 lg:col-span-8 md:space-y-16">
          <section className="relative pl-5 md:pl-8">
            <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-violet-400 via-violet-500/40 to-transparent" />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
              A história
            </span>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Sinopse</h2>
            <p className="mt-5 max-w-4xl text-base font-light leading-8 text-zinc-300 md:text-lg md:leading-9">
              {media.overview || "Nenhuma descrição disponível."}
            </p>
          </section>

          {media.seasons?.length > 0 && (
            <SeasonInfo tvId={media.id} seasons={media.seasons} />
          )}

          {media.credits?.cast?.length > 0 && (
            <section>
              <SectionHeading
                eyebrow="Quem dá vida à história"
                aside={
                  <span className="text-xs font-semibold text-zinc-500">
                    {media.credits.cast.length} integrantes
                  </span>
                }
              >
                Elenco principal
              </SectionHeading>
              <div className="content-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-4 md:gap-4">
                {media.credits.cast.slice(0, 15).map((person) => (
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
                        {person.character || "Personagem não informado"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(creativeLeads.length > 0 || writers.length > 0) && (
            <section>
              <SectionHeading eyebrow="Por trás das câmeras">
                {creators.length > 0 ? "Criação e roteiro" : "Direção e roteiro"}
              </SectionHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                {[...creativeLeads, ...writers].map((person, index) => (
                  <Link
                    to={`/app/person/${person.id}`}
                    key={`${person.id}-${person.job || "creator"}-${index}`}
                    className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.035]"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          alt={person.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-zinc-600">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white group-hover:text-violet-300">
                        {person.name}
                      </h3>
                      <span className="mt-1 block text-xs text-zinc-500">
                        {person.job || (creators.length > 0 ? "Criação" : "Direção")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {media.images && <MediaImages images={media.images} title={title} />}

          <section className="relative overflow-visible rounded-[2rem] border border-white/[0.07] bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.08),transparent_38%)] p-5 sm:p-7 md:p-9">
            <SectionHeading eyebrow="Sua voz importa">Avaliações da comunidade</SectionHeading>
            <ReviewsSection
              reviews={reviews}
              onPostReview={actions.handlePostReview}
              onReply={actions.handlePostReply}
              onDelete={actions.handleDeleteReview}
              onDeleteComment={actions.handleDeleteComment}
              onLike={actions.handleLikeReview}
              onLoadReplies={actions.handleLoadReplies}
              onEditReview={actions.handleEditReview}
              onEditReply={actions.handleEditReply}
              isEliteUser={isEliteUser}
              followingList={followingList}
            />
          </section>
        </main>

        <aside className="space-y-5 lg:col-span-4">
          <section className="relative overflow-hidden rounded-[2rem] border border-violet-400/15 bg-gradient-to-br from-violet-950/35 via-white/[0.025] to-transparent p-5 sm:p-7">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Play size={17} className="fill-current" />
              </span>
              <div>
                <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-violet-400">
                  Disponibilidade
                </span>
                <h2 className="mt-0.5 text-lg font-black text-white">Onde assistir</h2>
              </div>
            </div>

            {providers.length > 0 ? (
              <div className="relative mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {providers.slice(0, 8).map((provider) => (
                  <div key={provider.provider_id} className="group min-w-0" title={provider.provider_name}>
                    <img
                      src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
                      className="aspect-square w-full rounded-2xl border border-white/10 shadow-xl transition-transform group-hover:-translate-y-1"
                      alt={provider.provider_name}
                      loading="lazy"
                    />
                    <span className="mt-1.5 block truncate text-center text-[9px] font-semibold text-zinc-500">
                      {provider.provider_name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="relative mt-5 rounded-2xl border border-white/[0.05] bg-black/15 p-4 text-center text-xs leading-relaxed text-zinc-500">
                Indisponível em streamings na sua região.
              </p>
            )}
          </section>

          <section className="rounded-[2rem] border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-zinc-300">
                <Tag size={17} />
              </span>
              <div>
                <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Informações
                </span>
                <h2 className="mt-0.5 text-lg font-black text-white">Ficha técnica</h2>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/10 p-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                Título original
              </span>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-zinc-200">
                {media.original_title || media.original_name}
              </p>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                <dt className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Status</dt>
                <dd className={`mt-1.5 text-xs font-black ${getStatusColor(media.status)}`}>
                  {media.status || "Não informado"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                <dt className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Idioma</dt>
                <dd className="mt-1.5 text-xs font-black uppercase text-zinc-200">
                  {media.original_language || "—"}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                <dt className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Lançamento</dt>
                <dd className="mt-1.5 text-xs font-bold capitalize text-zinc-200">{releaseLabel}</dd>
              </div>
              <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3.5">
                <dt className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Formato</dt>
                <dd className="mt-1.5 text-xs font-bold text-zinc-200">
                  {media.type || (media.first_air_date ? "Série" : "Filme")}
                </dd>
              </div>
            </dl>
          </section>

          {(media.budget > 0 || media.revenue > 0) && (
            <section className="rounded-[2rem] border border-emerald-400/10 bg-gradient-to-br from-emerald-950/20 to-transparent p-5 sm:p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <DollarSign size={18} />
                </span>
                <div>
                  <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-emerald-500/70">
                    Mercado
                  </span>
                  <h2 className="mt-0.5 text-lg font-black text-white">Dados financeiros</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {media.budget > 0 && (
                  <div className="rounded-2xl bg-black/15 p-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Orçamento</span>
                    <span className="mt-2 block truncate text-xs font-bold text-white">
                      ${media.budget.toLocaleString("en-US")}
                    </span>
                  </div>
                )}
                {media.revenue > 0 && (
                  <div className="rounded-2xl bg-black/15 p-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600">Receita</span>
                    <span className="mt-2 block truncate text-xs font-bold text-emerald-400">
                      ${media.revenue.toLocaleString("en-US")}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {(media.networks?.length > 0 || media.production_companies?.length > 0) && (
            <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7">
              {media.networks?.length > 0 && (
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Canal ou rede
                  </span>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {media.networks.map((network) => (
                      <div key={network.id} className="flex h-11 items-center rounded-xl bg-white px-3 shadow-lg">
                        {network.logo_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                            className="max-h-6 max-w-24 object-contain"
                            alt={network.name}
                          />
                        ) : (
                          <span className="text-xs font-bold text-black">{network.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {media.production_companies?.length > 0 && (
                <div className={media.networks?.length > 0 ? "mt-6 border-t border-white/[0.06] pt-6" : ""}>
                  <span className="text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Produção
                  </span>
                  <div className="mt-4 grid gap-2.5">
                    {media.production_companies.slice(0, 4).map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-black/10 p-2.5"
                      >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white p-1.5">
                          {company.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                              className="max-h-full max-w-full object-contain"
                              alt={company.name}
                            />
                          ) : (
                            <Building size={16} className="text-black" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-zinc-300">{company.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {(externalIds.instagram_id ||
            externalIds.twitter_id ||
            externalIds.facebook_id ||
            media.homepage) && (
            <section className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] p-4 pl-5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Links oficiais
              </span>
              <div className="flex gap-2">
                {externalIds.instagram_id && (
                  <a href={`https://instagram.com/${externalIds.instagram_id}`} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-zinc-400 transition-colors hover:bg-pink-600 hover:text-white">
                    <Instagram size={16} />
                  </a>
                )}
                {externalIds.twitter_id && (
                  <a href={`https://twitter.com/${externalIds.twitter_id}`} target="_blank" rel="noreferrer" aria-label="Twitter" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-zinc-400 transition-colors hover:bg-white hover:text-black">
                    <Twitter size={16} />
                  </a>
                )}
                {externalIds.facebook_id && (
                  <a href={`https://facebook.com/${externalIds.facebook_id}`} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-zinc-400 transition-colors hover:bg-blue-600 hover:text-white">
                    <Facebook size={16} />
                  </a>
                )}
                {media.homepage && (
                  <a href={media.homepage} target="_blank" rel="noreferrer" aria-label="Site oficial" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-zinc-400 transition-colors hover:bg-violet-600 hover:text-white">
                    <Globe size={16} />
                  </a>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="mt-16 md:mt-24">
          <MediaRecommendations items={similar} />
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-white/10 bg-zinc-900/90 p-2 shadow-2xl backdrop-blur-2xl md:hidden">
        {trailerKey && (
          <button
            type="button"
            onClick={openTrailer}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-black"
          >
            <Play size={16} className="fill-current" /> Trailer
          </button>
        )}
        <button
          type="button"
          onClick={() => actions.handleInteract("watched")}
          aria-label="Marcar como assistido"
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            interactions.watched ? "bg-emerald-500 text-white" : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          <Check size={19} />
        </button>
        <button
          type="button"
          onClick={() => actions.handleInteract("like")}
          aria-label="Favoritar"
          className={`grid h-11 w-11 place-items-center rounded-xl ${
            interactions.liked ? "bg-red-500 text-white" : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          <Heart size={19} fill={interactions.liked ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={openList}
          aria-label="Adicionar à lista"
          className="grid h-11 w-11 place-items-center rounded-xl text-zinc-300 hover:bg-white/10"
        >
          <Plus size={19} />
        </button>
        <button
          type="button"
          onClick={actions.handleShare}
          aria-label="Compartilhar"
          className="grid h-11 w-11 place-items-center rounded-xl text-zinc-300 hover:bg-white/10"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
