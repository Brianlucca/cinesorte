import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CirclePlay,
  Clock3,
  Film,
  LogIn,
  MapPin,
  Play,
  Star,
  User,
  UserPlus,
  X,
} from "lucide-react";
import {
  getPersonFilmography,
  getMovieDetails,
  getEpisodeDetails,
  getSeasonDetails,
} from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";
import { Helmet } from "react-helmet-async";
import PersonFilmography from "@features/people/components/PersonFilmography";

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

export default function SharedMediaPreview() {
  const { type, id } = useParams();
  const { user } = useAuth();

  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [filmography, setFilmography] = useState(null);
  const [filmographyLoading, setFilmographyLoading] = useState(false);
  const [filmographyError, setFilmographyError] = useState(null);
  const [filmographyRetryPage, setFilmographyRetryPage] = useState(1);

  useEffect(() => {
    async function fetchMedia() {
      try {
        let data;
        setFilmography(null);
        setFilmographyError(null);
        setFilmographyRetryPage(1);
        setFilmographyLoading(type === "person");
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
          if (type === "person") {
            const [personData, filmographyData] = await Promise.all([
              getMovieDetails(type, id),
              getPersonFilmography(id, 1).catch((error) => {
                console.error("Não foi possível carregar a filmografia da pessoa compartilhada.", error);
                setFilmographyError(error);
                return null;
              }),
            ]);
            data = personData;
            setFilmography(filmographyData);
          } else {
            data = await getMovieDetails(type, id);
          }
        }
        setMedia(data);
      } catch {
        setMedia(null);
      } finally {
        setLoading(false);
        setFilmographyLoading(false);
      }
    }
    fetchMedia();
  }, [type, id]);

  const loadFilmographyPage = async (page) => {
    setFilmographyLoading(true);
    setFilmographyError(null);
    setFilmographyRetryPage(page);
    try {
      const pageData = await getPersonFilmography(id, page);
      setFilmography(pageData);
      setFilmographyRetryPage(pageData.page || page);
    } catch (error) {
      console.error("Não foi possível carregar a página da filmografia compartilhada.", error);
      setFilmographyError(error);
    } finally {
      setFilmographyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#111216]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#111216] px-5 text-white">
        <div className="text-center">
          <Film size={38} className="mx-auto text-zinc-600" />
          <h1 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-white">
            Conteúdo não encontrado
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Este link pode estar indisponível ou ter sido removido.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
          >
            Voltar para o início <ArrowRight size={15} />
        </Link>
        </div>
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

  const shareImage = banner || poster || `${window.location.origin}/logo.png`;
  const engagementSection = (
    <section className="mt-8 max-w-2xl rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
        {user ? "Continue no CineSorte" : "Faça parte da comunidade"}
      </span>
      <h2 className="mt-1.5 text-base font-medium tracking-[-0.02em] text-white">
        {user
          ? isPerson
            ? "Explore mais sobre este artista"
            : "Explore mais sobre este conteúdo"
          : "Sua próxima descoberta começa aqui"}
      </h2>
      <p className="mt-1.5 text-xs leading-5 text-zinc-400 sm:text-sm">
        {user
          ? isPerson
            ? "Acesse o perfil completo, interaja e continue explorando a carreira."
            : "Acesse o perfil completo, interaja e continue explorando."
          : "Avalie filmes e séries, crie listas e acompanhe as recomendações da comunidade."}
      </p>
      {user ? (
        <Link
          to={internalRoute}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500"
        >
          <CirclePlay size={16} /> Acessar conteúdo
        </Link>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/register?redirect=${encodedRoute}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white transition-colors hover:bg-violet-500"
          >
            <UserPlus size={15} /> Criar conta grátis
          </Link>
          <Link
            to={`/login?redirect=${encodedRoute}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.07]"
          >
            <LogIn size={15} /> Já tenho uma conta
          </Link>
        </div>
      )}
    </section>
  );
  const birthDate = isPerson && date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { dateStyle: "long" })
    : null;

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#111216] text-white">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px] overflow-hidden" aria-hidden="true">
        {banner && (
          <img
            src={banner}
            alt=""
            className="h-full w-full object-cover object-top opacity-[0.16]"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,18,22,0.48)_0%,#111216_88%)]" />
      </div>

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10">
            <button
              type="button"
              aria-label="Fechar trailer"
              onClick={() => setShowTrailer(false)}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/90"
            >
              <X size={20} />
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

      <header className="relative z-10 mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5 md:px-10 xl:px-12">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="CineSorte — início">
          <img
            src="/icons/cinesorte-transparent.png"
            alt=""
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg font-semibold tracking-[-0.035em] text-white sm:text-xl">
            Cine<span className="text-violet-400">Sorte</span>
          </span>
        </Link>
        <Link
          to={contentLink}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-zinc-200 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] sm:h-10 sm:px-4 sm:text-sm"
        >
          {user ? "Ir para o conteúdo" : "Entrar"}
          <ArrowRight size={14} />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pb-16 pt-5 sm:px-8 sm:pt-8 md:px-10 md:pb-24 md:pt-12 xl:px-12">
        <section className="grid gap-7 md:grid-cols-[190px_minmax(0,1fr)] md:gap-9 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <div className="mx-auto w-[118px] shrink-0 sm:w-[140px] md:mx-0 md:w-full">
            {poster ? (
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#181a20] shadow-[0_20px_65px_rgba(0,0,0,0.38)]">
                <img
                  src={poster}
                  alt={`${isPerson ? "Foto de" : "Pôster de"} ${title}`}
                  className="aspect-[2/3] w-full object-cover"
                  fetchpriority="high"
                />
              </div>
            ) : (
              <div className="grid aspect-[2/3] place-items-center rounded-xl border border-white/[0.08] bg-white/[0.025]">
                <User size={36} className="text-zinc-600" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                {isPerson ? "Perfil de artista" : type === "tv" ? "Série" : type === "episode" ? "Episódio" : type === "season" ? "Temporada" : "Filme"}
              </span>
              {!isPerson && media.genres?.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                  {media.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-zinc-400"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl md:mt-3 md:text-5xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-400 md:justify-start md:text-sm">
                {!isPerson && media.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-amber-200">
                    <Star size={14} className="fill-amber-300 text-amber-300" />
                    <span className="tabular-nums">{media.vote_average.toFixed(1)}</span>
                    <span className="text-zinc-600">/ 10 no TMDB</span>
                  </span>
                )}
                {isPerson && birthDate && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} /> Nascimento · {birthDate}
                  </span>
                )}
                {!isPerson && date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} /> {new Date(date).getFullYear()}
                  </span>
                )}
                {!isPerson && media.runtime > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {Math.floor(media.runtime / 60)}h {media.runtime % 60}min
                  </span>
                )}
                {isPerson && media.place_of_birth && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} /> {media.place_of_birth}
                  </span>
                )}
              </div>
            </div>

            <section className="mt-7 border-t border-white/[0.07] pt-5 md:mt-8">
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                {isPerson ? "Sobre a pessoa" : "Sinopse"}
              </span>
              <p className="mt-2 line-clamp-4 max-w-3xl whitespace-pre-line text-sm leading-6 text-zinc-300 sm:text-[15px] sm:leading-7">
                {overview}
              </p>
            </section>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5 md:justify-start">
              {trailerKey && (
                <button
                  type="button"
                  onClick={() => setShowTrailer(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  <Play size={15} fill="currentColor" /> Assistir trailer
                </button>
              )}
              <Link
                to={contentLink}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.035] px-4 text-sm font-medium text-zinc-200 transition-colors hover:border-white/[0.16] hover:bg-white/[0.07]"
              >
                Ver detalhes completos <ArrowRight size={15} />
              </Link>
            </div>

            {!isPerson && engagementSection}
          </div>
        </section>

        {isPerson && (
          <div className="mt-10 border-t border-white/[0.07] pt-8">
            <PersonFilmography
              filmography={filmography}
              loading={filmographyLoading}
              error={filmographyError}
              retryPage={filmographyRetryPage}
              onPageChange={loadFilmographyPage}
              getCreditHref={(credit) =>
                buildLink(
                  buildInternalRoute(
                    credit.media_type || (credit.title ? "movie" : "tv"),
                    credit.id,
                  ),
                  user,
                  encodedRoute,
                )
              }
            />
            {engagementSection}
          </div>
        )}

        <footer className="mt-12 border-t border-white/[0.06] pt-4 text-center text-[11px] text-zinc-600">
          Compartilhado pelo CineSorte
        </footer>
      </main>
    </div>
  );
}
