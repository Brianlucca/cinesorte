import {
  Star,
  Clock,
  Calendar,
  Play,
  Heart,
  Check,
  Plus,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Tag,
  DollarSign,
  Building,
  User,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPortal } from 'react-dom';
import { useMediaDetailsLogic } from "../../hooks/useMediaDetailsLogic";
import MediaCard from "../../components/ui/MediaCard";
import TrailerModal from "../../components/media/TrailerModal";
import ReviewsSection from "../../components/media/ReviewsSection";
import AddToListModal from "../../components/media/AddToListModal";
import SeasonInfo from "../../components/media/SeasonInfo";
import MediaImages from "../../components/media/MediaImages";

export default function MediaDetails() {
  const {
    media,
    reviews,
    providers,
    similar,
    loading,
    interactions,
    userLists,
    modals,
    setModals,
    actions
  } = useMediaDetailsLogic();

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!media)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Conteúdo não encontrado.
      </div>
    );

  const banner = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;
  const trailerKey =
    media.trailer?.key ||
    media.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    )?.key;

  const directors =
    media.credits?.crew?.filter((c) => c.job === "Director") || [];
  const creators = media.created_by || [];
  const writers =
    media.credits?.crew
      ?.filter((c) => c.job === "Screenplay" || c.job === "Writer")
      .slice(0, 3) || [];

  const externalIds = media.external_ids || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "Released": return "text-green-400";
      case "Ended": return "text-red-400";
      case "Returning Series": return "text-green-400";
      case "In Production": return "text-yellow-400";
      case "Planned": return "text-blue-400";
      default: return "text-zinc-400";
    }
  };

  const renderStars = (voteAverage) => {
    const stars = [];
    const ratingOutOf5 = voteAverage / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.round(ratingOutOf5)) {
        stars.push(<Star key={i} size={16} className="fill-yellow-500 text-yellow-500" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-zinc-600" />);
      }
    }
    return stars;
  };

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full overflow-x-hidden animate-in fade-in duration-700">
      
      {modals.trailer && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <TrailerModal
                isOpen={modals.trailer}
                onClose={() => setModals((prev) => ({ ...prev, trailer: false }))}
                videoKey={trailerKey}
            />
        </div>,
        document.body
      )}

      <AddToListModal
        isOpen={modals.addToList}
        onClose={() => setModals((prev) => ({ ...prev, addToList: false }))}
        lists={userLists}
        onAdd={actions.handleAddToList}
        onCreate={actions.handleCreateList}
      />

      <div className="relative w-full h-[90vh] mb-12 group">
        <div className="absolute inset-0">
          {banner ? (
            <img
              src={banner}
              alt="Banner"
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        <div className="absolute bottom-0 top-0 left-0 w-full flex flex-col justify-end px-6 md:px-12 pb-24 max-w-6xl z-20">
          
          <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-bottom-2 fade-in duration-1000">
            {media.genres?.map((g) => (
              <span
                key={g.id}
                className="text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full text-white shadow-lg"
              >
                {g.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-snug pb-2 drop-shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-1000">
            {media.title || media.name}
          </h1>

          {media.tagline && (
            <p className="text-lg md:text-2xl text-zinc-200 font-light italic mb-8 max-w-3xl animate-in slide-in-from-bottom-6 fade-in duration-1000 drop-shadow-md">
              "{media.tagline}"
            </p>
          )}

          <div className="flex flex-wrap items-center gap-8 text-sm md:text-base font-medium text-zinc-100 mb-10 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            
            <div className="flex items-center gap-3 bg-transparent border border-white/30 backdrop-blur-md px-5 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  {renderStars(media.vote_average)}
                </div>
                <span className="text-2xl font-bold text-white tracking-tighter">{media.vote_average.toFixed(1)}</span>
                <div className="h-6 w-px bg-white/30 mx-1"></div>
                <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">TMDB</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Score</span>
                </div>
            </div>

            <div className="h-10 w-px bg-white/20 hidden md:block"></div>

            <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-zinc-300">
                    <Calendar size={20} className="text-zinc-400" />{" "}
                    {new Date(
                      media.release_date || media.first_air_date,
                    ).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "long",
                    })}
                </span>

                {media.runtime ? (
                <span className="flex items-center gap-2 text-zinc-300">
                    <Clock size={20} className="text-zinc-400" />
                    {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                </span>
                ) : (
                media.episode_run_time?.length > 0 && (
                    <span className="flex items-center gap-2 text-zinc-300">
                        <Clock size={20} className="text-zinc-400" />
                        {media.episode_run_time[0]} min
                    </span>
                )
                )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom-10 fade-in duration-1000">
            {trailerKey && (
              <button
                onClick={() =>
                  setModals((prev) => ({ ...prev, trailer: true }))
                }
                className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <Play size={20} fill="currentColor" /> Assistir Trailer
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => actions.handleInteract("like")}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  interactions?.liked
                    ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30"
                    : "bg-black/40 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
                }`}
                title="Curtir"
              >
                <Heart
                  size={24}
                  fill={interactions?.liked ? "currentColor" : "none"}
                />
              </button>

              <button
                onClick={() => actions.handleInteract("watched")}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  interactions?.watched
                    ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/30"
                    : "bg-black/40 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
                }`}
                title="Já assisti"
              >
                <Check size={24} />
              </button>

              <button
                onClick={() =>
                  setModals((prev) => ({ ...prev, addToList: true }))
                }
                className="p-4 rounded-xl bg-black/40 border-2 border-white/10 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105"
                title="Adicionar à lista"
              >
                <Plus size={24} />
              </button>

              <button
                onClick={actions.handleShare}
                className="p-4 rounded-xl bg-black/40 border-2 border-white/10 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105"
                title="Compartilhar"
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-[1600px] mx-auto px-6 md:px-12 relative z-20">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-violet-600 pl-4">
              Sinopse
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg text-justify bg-zinc-900/50 p-8 rounded-2xl border border-white/5 shadow-inner">
              {media.overview || "Nenhuma descrição disponível."}
            </p>
          </section>

          {(directors.length > 0 || creators.length > 0) && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-600 pl-4">
                {media.created_by ? "Criadores" : "Direção & Roteiro"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(media.created_by || directors).map((p) => (
                  <Link
                    to={`/app/person/${p.id}`}
                    key={p.id}
                    className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-white/5 hover:border-violet-500/50 transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800">
                      {p.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                          className="w-full h-full object-cover"
                          alt={p.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-sm text-zinc-500">
                        {p.job || "Criador"}
                      </p>
                    </div>
                  </Link>
                ))}
                {writers.map((p) => (
                  <Link
                    to={`/app/person/${p.id}`}
                    key={`${p.id}-writer`}
                    className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-white/5 hover:border-violet-500/50 transition-colors group"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800">
                      {p.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${p.profile_path}`}
                          className="w-full h-full object-cover"
                          alt={p.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="text-zinc-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-sm text-zinc-500">Roteiro</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {media.credits?.cast?.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-600 pl-4 flex justify-between items-end">
                Elenco Principal
                <span className="text-sm font-normal text-zinc-500">
                  {media.credits.cast.length} membros
                </span>
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-zinc-900 px-2">
                {media.credits.cast.slice(0, 15).map((person) => (
                  <Link
                    to={`/app/person/${person.id}`}
                    key={person.id}
                    className="min-w-[140px] w-[140px] group block"
                  >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/5 relative">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                          className="w-full h-full object-cover"
                          alt={person.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <User size={40} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white truncate group-hover:text-violet-400 transition-colors">
                      {person.name}
                    </p>
                    <p className="text-xs text-zinc-500 truncate">
                      {person.character}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {media.seasons && (
            <SeasonInfo tvId={media.id} seasons={media.seasons} />
          )}

          {media.images && (
            <MediaImages
              images={media.images}
              title={media.title || media.name}
            />
          )}

          <ReviewsSection
            reviews={reviews}
            onPostReview={actions.handlePostReview}
            onReply={actions.handlePostReply}
            onDelete={actions.handleDeleteReview}
            onDeleteComment={actions.handleDeleteComment}
            onLike={actions.handleLikeReview}
          />
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 space-y-6 sticky top-24">
            <div className="flex justify-center gap-4 border-b border-white/5 pb-6">
              {externalIds.instagram_id && (
                <a
                  href={`https://instagram.com/${externalIds.instagram_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-800 rounded-full hover:bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 hover:text-white transition-all"
                >
                  <Instagram size={24} />
                </a>
              )}
              {externalIds.twitter_id && (
                <a
                  href={`https://twitter.com/${externalIds.twitter_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-800 rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <Twitter size={24} />
                </a>
              )}
              {externalIds.facebook_id && (
                <a
                  href={`https://facebook.com/${externalIds.facebook_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-800 rounded-full hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Facebook size={24} />
                </a>
              )}
              {media.homepage && (
                <a
                  href={media.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-zinc-800 rounded-full hover:bg-violet-600 hover:text-white transition-all"
                  title="Website Oficial"
                >
                  <Globe size={24} />
                </a>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white mb-4 text-lg border-l-4 border-violet-600 pl-3">
                Onde Assistir
              </h3>
              {providers.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                  {providers.map((prov) => (
                    <div
                      key={prov.provider_id}
                      className="tooltip group relative"
                      title={prov.provider_name}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/original${prov.logo_path}`}
                        className="w-full rounded-xl shadow-md border border-white/5 transition-transform hover:scale-105"
                        alt={prov.provider_name}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4 bg-zinc-950/50 rounded-xl">
                  Indisponível em streamings no momento.
                </p>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white mb-4 text-lg border-l-4 border-violet-600 pl-3">
                Ficha Técnica
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-zinc-500 text-sm font-medium">
                    Título Original
                  </span>
                  <span className="text-white text-sm font-bold text-right w-1/2">
                    {media.original_title || media.original_name}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-zinc-500 text-sm font-medium">
                    Status
                  </span>
                  <span
                    className={`text-sm font-bold ${getStatusColor(media.status)}`}
                  >
                    {media.status}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-zinc-500 text-sm font-medium">
                    Idioma Original
                  </span>
                  <span className="text-white text-sm font-bold uppercase">
                    {media.original_language}
                  </span>
                </div>

                {(media.budget > 0 || media.revenue > 0) && (
                  <div className="pt-2 space-y-3">
                    {media.budget > 0 && (
                      <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase mb-1">
                          <Tag size={12} /> Orçamento
                        </div>
                        <div className="text-white font-mono font-bold text-lg">
                          ${media.budget.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {media.revenue > 0 && (
                      <div className="bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase mb-1">
                          <DollarSign size={12} /> Receita
                        </div>
                        <div
                          className={`font-mono font-bold text-lg ${media.revenue > media.budget ? "text-green-400" : "text-red-400"}`}
                        >
                          ${media.revenue.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {media.type && (
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-zinc-500 text-sm font-medium">
                      Tipo
                    </span>
                    <span className="text-white text-sm font-bold">
                      {media.type}
                    </span>
                  </div>
                )}
                {media.networks && (
                  <div className="pt-2">
                    <span className="text-zinc-500 text-xs font-bold uppercase block mb-2">
                      Canal / Rede
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {media.networks.map((n) => (
                        <div
                          key={n.id}
                          className="bg-white p-2 rounded h-8 flex items-center"
                        >
                          {n.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w92${n.logo_path}`}
                              className="h-full w-auto object-contain"
                              alt={n.name}
                            />
                          ) : (
                            <span className="text-black font-bold text-xs">
                              {n.name}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {media.production_companies?.length > 0 && (
              <div>
                <h3 className="font-bold text-white mb-4 text-lg border-l-4 border-violet-600 pl-3">
                  Produção
                </h3>
                <div className="space-y-3">
                  {media.production_companies.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white flex items-center justify-center p-0.5 shrink-0">
                        {c.logo_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${c.logo_path}`}
                            className="w-full h-full object-contain"
                            alt={c.name}
                          />
                        ) : (
                          <Building size={14} className="text-black" />
                        )}
                      </div>
                      <span className="text-sm text-zinc-300 font-medium">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
            <h3 className="font-bold text-white mb-6 text-lg border-b border-white/5 pb-2">
              Recomendações
            </h3>
            {similar.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {similar.map((item) => (
                  <MediaCard key={item.id} media={item} />
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-center text-sm">
                Carregando sugestões...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}