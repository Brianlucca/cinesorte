import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Film, Star, Clock, Calendar, Play, User, X } from "lucide-react";
import { getMovieDetails, getEpisodeDetails, getSeasonDetails } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";

export default function SharedMediaPreview() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    async function fetchMedia() {
      try {
        let data;
        if (type === 'episode') {
          const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
          if (match) {
            const [, tvId, season, episode] = match;
            data = await getEpisodeDetails(tvId, season, episode);
          }
        } else if (type === 'season') {
          const match = id.match(/^(\d+)-s(\d+)$/);
          if (match) {
            const [, tvId, season] = match;
            data = await getSeasonDetails(tvId, season);
          }
        } else {
          data = await getMovieDetails(type, id);
        }
        setMedia(data);
      } catch (error) {
        setMedia(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [type, id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white flex-col gap-4">
        <Film size={48} className="text-zinc-600" />
        <h1 className="text-2xl font-bold">Conteúdo não encontrado</h1>
        <Link to="/" className="text-violet-500 hover:text-violet-400">Voltar para o início</Link>
      </div>
    );
  }

  const isPerson = type === "person";
  const title = media.title || media.name;
  const overview = media.overview || media.biography || "Nenhuma informação disponível.";
  const date = media.release_date || media.first_air_date || media.air_date || media.birthday;
  
  const posterPath = media.poster_path || media.profile_path || media.still_path;
  const poster = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
  
  const bannerPath = media.backdrop_path || media.still_path;
  const banner = bannerPath ? `https://image.tmdb.org/t/p/original${bannerPath}` : null;
  
  const trailerKey = media.trailer?.key || media.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube")?.key;
  
  let internalRoute = `/app/${type}/${id}`;
  if (type === 'episode') {
      const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
      if (match) {
          const [, tvId, season, episode] = match;
          internalRoute = `/app/tv/${tvId}/season/${season}/episode/${episode}`;
      }
  } else if (type === 'season') {
      const match = id.match(/^(\d+)-s(\d+)$/);
      if (match) {
          const [, tvId, season] = match;
          internalRoute = `/app/tv/${tvId}/season/${season}`;
      }
  }

  const encodedRoute = encodeURIComponent(internalRoute);
  const shareImage = banner || poster || `${window.location.origin}/logo.png`;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      
      <Helmet>
        <title>{title} | CineSorte</title>
        <meta name="description" content={overview.substring(0, 150) + "..."} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${title} | CineSorte`} />
        <meta property="og:description" content={overview.substring(0, 150) + "..."} />
        <meta property="og:image" content={shareImage} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={`${title} | CineSorte`} />
        <meta property="twitter:description" content={overview.substring(0, 150) + "..."} />
        <meta property="twitter:image" content={shareImage} />
      </Helmet>

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          </div>
        </div>
      )}

      <header className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-center bg-gradient-to-b from-zinc-950/80 to-transparent">
        <Link to="/" className="flex items-center gap-2">
          <Film className="text-violet-500 w-6 h-6 md:w-8 md:h-8" />
          <span className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
            Cine<span className="text-violet-500">Sorte</span>
          </span>
        </Link>
        {!user && (
          <Link to={`/login?redirect=${encodedRoute}`} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm md:text-base font-bold rounded-lg transition-colors">
            Entrar
          </Link>
        )}
        {user && (
          <Link to={internalRoute} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm md:text-base font-bold rounded-lg transition-colors">
            Ir para o Conteúdo
          </Link>
        )}
      </header>

      <div className="absolute inset-0 z-0">
        {banner ? (
          <img src={banner} alt="" className="w-full h-full object-cover opacity-30" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 md:px-12 lg:px-16 pt-20 pb-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-80px)]">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start my-auto">
          
          {poster ? (
            <div className="shrink-0 w-48 md:w-72 lg:w-80 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 animate-in slide-in-from-left-8 fade-in duration-1000">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="shrink-0 w-48 md:w-72 lg:w-80 aspect-[2/3] bg-zinc-900 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 animate-in slide-in-from-left-8 fade-in duration-1000">
              <User size={64} className="text-zinc-700" />
            </div>
          )}

          <div className="flex-1 text-center md:text-left animate-in slide-in-from-right-8 fade-in duration-1000">
            <div className="flex flex-wrap gap-2 mb-2 md:mb-3 justify-center md:justify-start">
              {isPerson && media.known_for_department && (
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 md:px-3 rounded-full text-zinc-300">
                  {media.known_for_department === 'Acting' ? 'Atuação' : media.known_for_department}
                </span>
              )}
              {!isPerson && media.genres?.slice(0, 3).map((g) => (
                <span key={g.id} className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 px-2 py-1 md:px-3 rounded-full text-zinc-300">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-zinc-300 mb-4 justify-center md:justify-start text-sm md:text-base font-medium">
              {!isPerson && media.vote_average > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star size={18} className="fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-white">{media.vote_average.toFixed(1)}</span>
                </div>
              )}
              {date && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-zinc-500" />
                  <span>{new Date(date).getFullYear()}</span>
                </div>
              )}
              {!isPerson && media.runtime > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-zinc-500" />
                  <span>{Math.floor(media.runtime / 60)}h {media.runtime % 60}m</span>
                </div>
              )}
            </div>

            {trailerKey && (
              <div className="flex justify-center md:justify-start mb-4">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm md:text-base font-bold rounded-xl hover:bg-zinc-200 transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <Play size={18} fill="currentColor" /> Assistir Trailer
                </button>
              </div>
            )}

            <p className="text-sm md:text-base text-zinc-400 mb-6 leading-relaxed max-w-3xl line-clamp-3">
              {overview}
            </p>

            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-6 rounded-2xl max-w-2xl mx-auto md:mx-0">
              {user ? (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Você já está logado!</h2>
                  <p className="text-xs md:text-sm text-zinc-400 mb-4">
                    Acesse agora mesmo o conteúdo completo para interagir, comentar e adicionar às suas listas.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to={internalRoute} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm md:text-base font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-violet-600/20">
                      <Play size={18} fill="currentColor" /> Acessar Conteúdo
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-1">Quer avaliar e interagir?</h2>
                  <p className="text-xs md:text-sm text-zinc-400 mb-4">
                    Junte-se à comunidade do CineSorte para descobrir onde assistir, dar sua nota, criar listas personalizadas e ver a opinião dos amigos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to={`/register?redirect=${encodedRoute}`} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm md:text-base font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-violet-600/20">
                      <User size={18} /> Criar conta grátis
                    </Link>
                    <Link to={`/login?redirect=${encodedRoute}`} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm md:text-base font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-all">
                      Já tenho uma conta
                    </Link>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}