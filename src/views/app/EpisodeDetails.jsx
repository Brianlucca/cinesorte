import {
  Clock,
  Calendar,
  Star,
  Play,
  ChevronLeft,
  User,
  ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useEpisodeDetailsLogic } from '../../hooks/useEpisodeDetailsLogic';
import ReviewsSection from '../../components/media/reviews/ReviewsSection';
import TrailerModal from '../../components/media/TrailerModal';

export default function EpisodeDetails() {
  const {
    episode,
    tvShow,
    reviews,
    followingList,
    loading,
    tvId,
    seasonNumber,
    actions,
  } = useEpisodeDetailsLogic();

  const navigate = useNavigate();
  const [trailerOpen, setTrailerOpen] = useState(false);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!episode)
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Episódio não encontrado.
      </div>
    );

  const banner = episode.still_path
    ? `https://image.tmdb.org/t/p/original${episode.still_path}`
    : null;

  const trailerKey = episode.videos?.results?.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  )?.key;

  return (
    <div className="-mt-24 md:-mt-8 pb-20 w-full overflow-x-hidden bg-zinc-950 animate-in fade-in duration-700">
      {trailerKey &&
        trailerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
            <TrailerModal
              isOpen={trailerOpen}
              onClose={() => setTrailerOpen(false)}
              videoKey={trailerKey}
            />
          </div>,
          document.body
        )}

      <div className="relative w-full h-[70vh] mb-12 group">
        <div className="absolute inset-0">
          {banner ? (
            <img
              src={banner}
              alt={episode.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-28 left-6 md:left-12 z-50 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="absolute bottom-0 top-0 left-0 w-full flex flex-col justify-end px-6 md:px-12 pb-16 max-w-6xl z-20">
          <div className="flex flex-wrap gap-3 mb-5 animate-in slide-in-from-bottom-2 fade-in duration-1000">
            {tvShow && (
              <Link
                to={`/app/tv/${tvId}`}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10 transition-colors shadow-lg"
              >
                {tvShow.name}
              </Link>
            )}
            <span className="bg-violet-600 px-4 py-1.5 rounded-md text-xs font-bold text-white uppercase tracking-wider shadow-lg">
              Temporada {seasonNumber}
            </span>
            <span className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg">
              Episódio {episode.episode_number}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-1000">
            {episode.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-zinc-200 mb-8 animate-in slide-in-from-bottom-6 fade-in duration-1000">
            <span className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-md border border-yellow-500/20 font-bold">
              <Star size={18} fill="currentColor" /> {episode.vote_average?.toFixed(1) || '0.0'}
            </span>
            <div className="h-5 w-px bg-white/20" />
            <span className="flex items-center gap-2">
              <Calendar size={18} className="text-zinc-400" />{' '}
              {episode.air_date
                ? new Date(episode.air_date).toLocaleDateString()
                : 'TBA'}
            </span>
            {episode.runtime && (
              <>
                <div className="h-5 w-px bg-white/20" />
                <span className="flex items-center gap-2">
                  <Clock size={18} className="text-zinc-400" /> {episode.runtime} min
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-4 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            {trailerKey && (
              <button
                onClick={() => setTrailerOpen(true)}
                className="flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <Play size={20} fill="currentColor" /> Assistir Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto px-6 md:px-12 relative z-20">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
              Sinopse
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg text-justify font-light">
              {episode.overview || 'Nenhuma descrição disponível para este episódio.'}
            </p>
          </section>

          {episode.guest_stars?.length > 0 && (
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                Atores Convidados
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {episode.guest_stars.map((person) => (
                  <Link
                    to={`/app/person/${person.id}`}
                    key={person.id}
                    className="min-w-[130px] w-[130px] group block"
                  >
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800 mb-4 shadow-lg group-hover:-translate-y-2 transition-transform duration-300 border border-white/5">
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
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{person.character}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {episode.images?.stills?.length > 0 && (
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                Galeria
              </h2>
              <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {episode.images.stills.slice(0, 8).map((img, idx) => (
                  <div
                    key={idx}
                    className="min-w-[300px] aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-lg relative group"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ImageIcon size={32} className="text-white/70" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
              Avaliações do Episódio
            </h2>
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
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-8 rounded-3xl sticky top-24 self-start space-y-8">
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest text-zinc-400 mb-6">
                Ficha Técnica
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Série</span>
                  <span className="text-white text-sm font-medium">{tvShow?.name || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Temporada</span>
                  <span className="text-white text-sm font-medium">{seasonNumber}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">Episódio</span>
                  <span className="text-white text-sm font-medium">{episode.episode_number}</span>
                </div>
              </div>
            </div>

            {episode.crew && (
              <div className="pt-2">
                <h3 className="font-bold text-white text-sm uppercase tracking-widest text-zinc-400 mb-6">
                  Equipe Principal
                </h3>
                <div className="space-y-5">
                  {episode.crew
                    .filter((c) => c.job === 'Director' || c.job === 'Writer')
                    .slice(0, 5)
                    .map((c) => (
                      <div key={`${c.id}-${c.job}`} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                          {c.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                              className="w-full h-full object-cover"
                              alt={c.name}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                              <User size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{c.name}</p>
                          <p className="text-xs text-zinc-500 font-medium">{c.job}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
