import { 
    Clock, 
    Calendar, 
    Star, 
    Play, 
    ChevronLeft, 
    User, 
    ImageIcon 
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEpisodeDetailsLogic } from '../../hooks/useEpisodeDetailsLogic';
import ReviewsSection from '../../components/media/ReviewsSection';
import TrailerModal from '../../components/media/TrailerModal';

export default function EpisodeDetails() {
    const { 
        episode, 
        reviews, 
        loading, 
        tvId, 
        seasonNumber,
        actions 
    } = useEpisodeDetailsLogic();
    
    const navigate = useNavigate();
    const [trailerOpen, setTrailerOpen] = useState(false);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-zinc-950">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!episode) return <div className="h-screen flex items-center justify-center text-white">Episódio não encontrado.</div>;

    const banner = episode.still_path 
        ? `https://image.tmdb.org/t/p/original${episode.still_path}` 
        : null;

    const trailerKey = episode.videos?.results?.find(v => v.type === "Trailer" || v.type === "Teaser")?.key;

    return (
        <div className="-mt-24 md:-mt-8 pb-20 w-full overflow-x-hidden animate-in fade-in duration-700">
            {trailerKey && (
                <TrailerModal 
                    isOpen={trailerOpen} 
                    onClose={() => setTrailerOpen(false)} 
                    videoKey={trailerKey} 
                />
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
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent" />
                </div>

                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-28 left-6 z-50 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-violet-600 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="absolute bottom-0 top-0 left-0 w-full flex flex-col justify-end px-6 md:px-12 pb-16 max-w-5xl z-20">
                    <div className="flex gap-3 mb-4">
                        <span className="bg-violet-600 px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider">
                            Temporada {seasonNumber}
                        </span>
                        <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                            Episódio {episode.episode_number}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
                        {episode.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-medium text-zinc-200 mb-8">
                        <span className="flex items-center gap-2 text-yellow-400 font-bold">
                            <Star size={18} fill="currentColor" /> {episode.vote_average?.toFixed(1)}
                        </span>
                        
                        <div className="h-4 w-px bg-white/20"></div>

                        <span className="flex items-center gap-2">
                            <Calendar size={18} /> {new Date(episode.air_date).toLocaleDateString()}
                        </span>

                        <div className="h-4 w-px bg-white/20"></div>

                        <span className="flex items-center gap-2">
                            <Clock size={18} /> {episode.runtime} min
                        </span>
                    </div>

                    {trailerKey && (
                        <button 
                            onClick={() => setTrailerOpen(true)}
                            className="flex items-center gap-3 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 shadow-lg w-max"
                        >
                            <Play size={20} fill="currentColor" /> Assistir Trailer
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-[1600px] mx-auto px-6 md:px-12 relative z-20">
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 border-l-4 border-violet-600 pl-4">
                            Sinopse
                        </h2>
                        <p className="text-zinc-300 leading-relaxed text-lg text-justify bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-inner">
                            {episode.overview || "Nenhuma descrição disponível."}
                        </p>
                    </section>

                    {episode.guest_stars?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-600 pl-4">
                                Atores Convidados
                            </h2>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-zinc-900 px-2">
                                {episode.guest_stars.map(person => (
                                    <Link 
                                        to={`/app/person/${person.id}`}
                                        key={person.id} 
                                        className="min-w-[120px] w-[120px] group block"
                                    >
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 mb-3 shadow-lg group-hover:scale-105 transition-transform duration-300 border border-white/5">
                                            {person.profile_path ? (
                                                <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600"><User size={40}/></div>
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

                    {episode.images?.stills?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-600 pl-4 flex items-center gap-2">
                                <ImageIcon size={24} /> Galeria
                            </h2>
                            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-zinc-900 px-2">
                                {episode.images.stills.slice(0, 8).map((img, idx) => (
                                    <div key={idx} className="min-w-[300px] aspect-video rounded-xl overflow-hidden border border-white/10">
                                        <img 
                                            src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <ReviewsSection 
                        reviews={reviews}
                        onPostReview={actions.handlePostReview}
                        onReply={actions.handlePostReply}
                        onLike={actions.handleLikeReview}
                        onDelete={actions.handleDeleteReview}
                    />
                </div>

                <div className="space-y-8">
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5 space-y-4 sticky top-24">
                        <h3 className="font-bold text-white mb-4 text-lg border-b border-white/5 pb-2">
                            Ficha Técnica
                        </h3>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-zinc-500 text-sm">Temporada</span>
                            <span className="text-white font-medium text-sm">{seasonNumber}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-zinc-500 text-sm">Episódio</span>
                            <span className="text-white font-medium text-sm">{episode.episode_number}</span>
                        </div>

                        
                        {episode.crew && (
                            <div className="pt-4 space-y-4">
                                {episode.crew.filter(c => c.job === 'Director' || c.job === 'Writer').slice(0, 4).map(c => (
                                    <div key={`${c.id}-${c.job}`} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                                            {c.profile_path ? (
                                                <img src={`https://image.tmdb.org/t/p/w185${c.profile_path}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={12}/></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{c.name}</p>
                                            <p className="text-xs text-zinc-500">{c.job}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}