import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Film,
  Star,
  Clock,
  Calendar,
  Play,
  User,
  X,
  Clapperboard,
  Tv,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getMovieDetails,
  getEpisodeDetails,
  getSeasonDetails,
} from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";
import { Helmet } from "react-helmet-async";

function buildInternalRoute(type, id) {
  if (type === "episode") {
    const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
    if (match) {
      const [, tvId, season, episode] = match;
      return `/app/tv/${tvId}/season/${season}/episode/${episode}`;
    }
  }
  if (type === "season") {
    const match = id.match(/^(\d+)-s(\d+)$/);
    if (match) {
      const [, tvId, season] = match;
      return `/app/tv/${tvId}/season/${season}`;
    }
  }
  return `/app/${type}/${id}`;
}

function buildLink(route, user, encodedRoute) {
  if (user) return route;
  return `/login?redirect=${encodeURIComponent(route)}&from=${encodedRoute}`;
}

function KnownForCarousel({ credits, user, encodedCurrentRoute }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const items = [...(credits.cast || []), ...(credits.crew || [])];
  const seen = new Set();
  const unique = items
    .filter((item) => {
      if (!item.poster_path || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort(
      (a, b) =>
        (b.vote_count || b.popularity || 0) - (a.vote_count || a.popularity || 0)
    )
    .slice(0, 20);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [unique.length]);

  if (unique.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
          Conhecido por
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="p-2 rounded-xl transition-all disabled:opacity-20 hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ChevronLeft size={20} className="text-zinc-400" />
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="p-2 rounded-xl transition-all disabled:opacity-20 hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ChevronRight size={20} className="text-zinc-400" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {unique.map((item) => {
          const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
          const itemTitle = item.title || item.name;
          const itemRoute = `/app/${mediaType}/${item.id}`;
          const href = buildLink(itemRoute, user, encodedCurrentRoute);

          return (
            <Link
              key={`${item.id}-${item.media_type}`}
              to={href}
              className="shrink-0 w-36 group"
            >
              <div className="w-36 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-800/80 mb-3 ring-1 ring-white/10 group-hover:ring-violet-500/50 transition-all duration-300 group-hover:scale-105 shadow-xl">
                <img
                  src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                  alt={itemTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors leading-tight truncate">
                {itemTitle}
              </p>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1.5 font-medium">
                {mediaType === "tv" ? <Tv size={14} /> : <Clapperboard size={14} />}
                {mediaType === "tv" ? "Série" : "Filme"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function SharedMediaPreview() {
  const { type, id } = useParams();
  const { user } = useAuth();

  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    async function fetchMedia() {
      try {
        let data;
        if (type === "episode") {
          const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
          if (match) {
            const [, tvId, season, episode] = match;
            data = await getEpisodeDetails(tvId, season, episode);
          }
        } else if (type === "season") {
          const match = id.match(/^(\d+)-s(\d+)$/);
          if (match) {
            const [, tvId, season] = match;
            data = await getSeasonDetails(tvId, season);
          }
        } else {
          data = await getMovieDetails(type, id);
        }
        setMedia(data);
      } catch {
        setMedia(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, [type, id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white flex-col gap-6">
        <Film size={64} className="text-zinc-700" />
        <h1 className="text-3xl font-bold text-zinc-200">Conteúdo não encontrado</h1>
        <Link to="/" className="text-violet-400 hover:text-violet-300 text-base font-medium">
          Voltar para o início
        </Link>
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

  const trailerKey =
    media.trailer?.key ||
    media.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")?.key;

  const internalRoute = buildInternalRoute(type, id);
  const encodedRoute = encodeURIComponent(internalRoute);

  const contentLink = buildLink(internalRoute, user, encodedRoute);

  const departmentMap = {
    Acting: "Atuação",
    Directing: "Direção",
    Writing: "Roteiro",
    Production: "Produção",
    "Visual Effects": "VFX",
    Camera: "Câmera",
    Sound: "Som",
  };
  const department =
    isPerson && media.known_for_department
      ? departmentMap[media.known_for_department] || media.known_for_department
      : null;

  const shareImage = banner || poster || `${window.location.origin}/logo.png`;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: "#0a0a0f" }}
    >
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
        <div className="fixed inset-0 z-[100000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-6 right-6 z-10 p-3 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {banner && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={banner}
            alt=""
            className="w-full h-full object-cover object-top"
            style={{ opacity: 0.35, filter: "brightness(0.9) saturate(1.1)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,10,15,0.1) 0%, rgba(10,10,15,0.4) 55%, rgba(10,10,15,1) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0.2) 50%, transparent 80%)",
            }}
          />
        </div>
      )}

      <header className="relative z-10 px-6 md:px-12 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2.5">
          <Film className="text-violet-400 w-6 h-6" />
          <span
            className="text-lg font-black text-white uppercase"
            style={{ letterSpacing: "-0.01em" }}
          >
            Cine<span className="text-violet-400">Sorte</span>
          </span>
        </Link>
        {user ? (
          <Link
            to={internalRoute}
            className="px-5 py-2.5 text-base font-semibold text-white rounded-xl transition-colors border hover:bg-white/5"
            style={{
              background: "rgba(255,255,255,0.06)",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            Ir para o Conteúdo
          </Link>
        ) : (
          <Link
            to={`/login?redirect=${encodedRoute}`}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-base font-semibold rounded-xl transition-colors"
          >
            Entrar
          </Link>
        )}
      </header>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 pt-4 pb-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center md:items-start">

          <div className="shrink-0">
            {poster ? (
              <div
                className="w-48 md:w-64 lg:w-80 rounded-3xl overflow-hidden ring-1 ring-white/10"
                style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}
              >
                <img src={poster} alt={title} className="w-full h-full object-cover block" />
              </div>
            ) : (
              <div
                className="w-48 md:w-64 lg:w-80 aspect-[2/3] rounded-3xl flex items-center justify-center ring-1 ring-white/10"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <User size={64} className="text-zinc-700" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left pt-2 md:pt-4">

            <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
              {department && (
                <span
                  className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    color: "#c4b5fd",
                  }}
                >
                  {department}
                </span>
              )}
              {!isPerson &&
                media.genres?.slice(0, 3).map((g) => (
                  <span
                    key={g.id}
                    className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#a1a1aa",
                    }}
                  >
                    {g.name}
                  </span>
                ))}
            </div>

            <h1
              className="text-white font-black leading-tight mb-4"
              style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                letterSpacing: "-0.025em",
              }}
            >
              {title}
            </h1>

            <div
              className="flex flex-wrap items-center gap-6 mb-6 justify-center md:justify-start"
              style={{ color: "#71717a" }}
            >
              {!isPerson && media.vote_average > 0 && (
                <div className="flex items-center gap-2">
                  <Star size={18} className="fill-amber-400 text-amber-400" />
                  <span
                    className="text-base font-bold tabular-nums"
                    style={{ color: "#fbbf24" }}
                  >
                    {media.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
              {date && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span className="text-base font-medium tabular-nums">
                    {new Date(date).getFullYear()}
                  </span>
                </div>
              )}
              {!isPerson && media.runtime > 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span className="text-base font-medium tabular-nums">
                    {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                  </span>
                </div>
              )}
              {isPerson && media.place_of_birth && (
                <span className="text-base font-medium">{media.place_of_birth}</span>
              )}
            </div>

            <p
              className="mb-8 leading-relaxed max-w-3xl line-clamp-3 mx-auto md:mx-0 text-zinc-300"
              style={{ fontSize: "1.0625rem" }}
            >
              {overview}
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-8">
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-black text-base font-bold rounded-xl hover:bg-zinc-100 transition-all hover:scale-[1.03] shadow-lg"
                >
                  <Play size={18} fill="currentColor" /> Ver Trailer
                </button>
              )}
              <Link
                to={contentLink}
                className="inline-flex items-center gap-2.5 px-6 py-3 text-base font-bold rounded-xl transition-all hover:scale-[1.03]"
                style={{
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  color: "#c4b5fd",
                }}
              >
                Ver detalhes completos
              </Link>
            </div>

            {isPerson && media.combined_credits && (
              <KnownForCarousel
                credits={media.combined_credits}
                user={user}
                encodedCurrentRoute={encodedRoute}
              />
            )}

            <div
              className="p-6 md:p-8 rounded-3xl max-w-2xl mx-auto md:mx-0 mt-10"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
              }}
            >
              {user ? (
                <>
                  <p
                    className="text-xs font-black uppercase tracking-widest mb-2"
                    style={{ color: "#71717a" }}
                  >
                    Você já está logado
                  </p>
                  <p
                    className="text-base mb-5 leading-relaxed"
                    style={{ color: "#d4d4d8" }}
                  >
                    Acesse o conteúdo completo, interaja, comente e adicione às suas listas.
                  </p>
                  <Link
                    to={internalRoute}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white text-base font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{ boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
                  >
                    <Play size={18} fill="currentColor" /> Acessar Conteúdo
                  </Link>
                </>
              ) : (
                <>
                  <p
                    className="text-xs font-black uppercase tracking-widest mb-2"
                    style={{ color: "#71717a" }}
                  >
                    Junte-se à comunidade
                  </p>
                  <p
                    className="text-base mb-5 leading-relaxed"
                    style={{ color: "#d4d4d8" }}
                  >
                    Descubra onde assistir, dê sua nota, crie listas e veja a opinião dos
                    seus amigos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/register?redirect=${encodedRoute}`}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-base font-bold py-3.5 px-5 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
                      style={{ boxShadow: "0 8px 24px rgba(124,58,237,0.3)" }}
                    >
                      <User size={18} /> Criar conta grátis
                    </Link>
                    <Link
                      to={`/login?redirect=${encodedRoute}`}
                      className="flex-1 text-white text-base font-bold py-3.5 px-5 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
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
