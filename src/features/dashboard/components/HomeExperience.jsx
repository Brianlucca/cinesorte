import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers3,
  MessageCircle,
  Plus,
  Star,
} from "lucide-react";
import { useAuth } from "@shared/context/useAuth";

const TMDB_IMAGE = "https://image.tmdb.org/t/p";
const PAGE_X = "px-5 sm:px-6 md:px-10 xl:px-14 2xl:px-16";

function getMediaType(item = {}) {
  return item.mediaType || item.media_type || (item.first_air_date || item.name ? "tv" : "movie");
}

function getMediaName(item = {}) {
  return item.title || item.name || item.mediaTitle || "Título";
}

function getMediaYear(item = {}) {
  return String(item.release_date || item.first_air_date || item.releaseDate || item.firstAirDate || "").slice(0, 4);
}

function getImagePath(item = {}, preferred = "poster") {
  if (preferred === "backdrop") {
    return item.backdrop_path || item.backdropPath || item.poster_path || item.posterPath || null;
  }

  return item.poster_path || item.posterPath || item.backdrop_path || item.backdropPath || null;
}

function mediaPath(item = {}) {
  const mediaType = getMediaType(item);
  const id = item.mediaId || item.id;
  if (!id) return "/app";
  return `/app/${mediaType === "tv" ? "tv" : "movie"}/${String(id).replace(/^(movie-|tv-)/, "")}`;
}

function reviewExcerpt(text = "") {
  if (!text) return "Avaliação registrada sem comentário.";
  if (/\|\|[^|]+\|\|/.test(text)) return "Esta avaliação contém spoilers.";
  return text.replace(/\*\*|\*/g, "").replace(/^>\s?/gm, "").trim();
}

function MediaImage({ item, size = "w500", preferred = "poster", className = "" }) {
  const path = getImagePath(item, preferred);

  if (!path) {
    return <div className={`bg-white/[0.04] ${className}`} />;
  }

  return (
    <img
      src={`${TMDB_IMAGE}/${size}${path}`}
      alt=""
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}

function slideRail(rowRef, direction) {
  if (!rowRef.current) return;
  const { clientWidth } = rowRef.current;
  rowRef.current.scrollBy({
    left: direction === "left" ? -(clientWidth * 0.75) : clientWidth * 0.75,
    behavior: "smooth",
  });
}

function useRailOverflow(rowRef, itemsKey) {
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    const node = rowRef.current;
    if (!node) {
      setHasOverflow(false);
      return;
    }

    setHasOverflow(node.scrollWidth > node.clientWidth + 8);
  }, [rowRef]);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, itemsKey]);

  return hasOverflow;
}

function SectionShell({ title, eyebrow, children, actionTo, actionLabel, rowRef, hasOverflow = false }) {
  const hasControls = Boolean(rowRef && hasOverflow);

  return (
    <section className="group/row relative z-10 w-full">
      <div className={`flex items-end justify-between gap-4 ${PAGE_X}`}>
        <div>
          {eyebrow && (
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-violet-300/70">
              {eyebrow}
            </span>
          )}
          <h2 className="flex items-center gap-3 text-lg font-semibold tracking-[-0.02em] text-zinc-100 sm:text-xl md:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actionTo && actionLabel && (
            <Link
              to={actionTo}
              className="hidden items-center gap-2 px-1 py-2 text-[11px] font-bold text-zinc-400 transition-colors hover:text-white sm:inline-flex"
            >
              {actionLabel}
              <ArrowRight size={14} />
            </Link>
          )}

          {hasControls && (
            <div className="flex gap-2 opacity-100 transition-opacity duration-300 md:opacity-40 md:group-hover/row:opacity-100">
              <button
                type="button"
                aria-label={`Voltar na seção ${title}`}
                onClick={() => slideRail(rowRef, "left")}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label={`Avançar na seção ${title}`}
                onClick={() => slideRail(rowRef, "right")}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function TopItemCard({ item, index }) {
  const rating = Number(item.vote_average || item.rating || 0);
  const isTopThree = index < 3;

  return (
    <Link
      to={mediaPath(item)}
      className="group/card w-[168px] flex-none snap-start sm:w-[250px]"
    >
      <span className="relative flex h-[235px] items-end sm:h-[285px]">
        <span
          aria-hidden="true"
          className={`absolute bottom-0 left-0 z-0 hidden select-none text-[10rem] font-black leading-[0.72] tracking-[-0.12em] text-transparent sm:block ${
            isTopThree
              ? "[-webkit-text-stroke:2px_rgba(167,139,250,0.42)]"
              : "[-webkit-text-stroke:2px_rgba(255,255,255,0.20)]"
          }`}
        >
          {index + 1}
        </span>

        <span className="relative z-10 h-full w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#111216] shadow-xl shadow-black/30 transition-transform duration-500 group-hover/card:-translate-y-1 sm:ml-[70px] sm:w-[180px]">
          <MediaImage item={item} size="w500" className="h-full w-full transition-transform duration-700 group-hover/card:scale-[1.035]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

          <span
            aria-hidden="true"
            className={`absolute bottom-2 left-2.5 text-[2.75rem] font-black leading-none tracking-[-0.08em] drop-shadow-xl sm:hidden ${isTopThree ? "text-violet-200" : "text-white"}`}
          >
            {index + 1}
          </span>

          {rating > 0 && (
            <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
              <Star size={10} className="fill-current text-yellow-300" />
              {rating.toFixed(1)}
            </span>
          )}

          {isTopThree && (
            <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-violet-500/15 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-200 backdrop-blur-md sm:left-2.5 sm:right-auto">
              Top {index + 1}
            </span>
          )}
        </span>
      </span>

      <span className="mt-3 block sm:pl-[70px]">
        <span className="block truncate text-sm font-semibold text-white transition-colors group-hover/card:text-violet-300">
          {getMediaName(item)}
        </span>
        <span className="mt-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-600">
          <span>{getMediaType(item) === "tv" ? "Série" : "Filme"}</span>
          {getMediaYear(item) && <span>{getMediaYear(item)}</span>}
        </span>
      </span>
    </Link>
  );
}

function TopRail({ items = [] }) {
  const topRef = useRef(null);
  const topItems = items.filter((item) => getImagePath(item)).slice(0, 10);
  const itemsKey = topItems.map((item) => `${getMediaType(item)}-${item.id || item.mediaId}`).join("|");
  const hasOverflow = useRailOverflow(topRef, itemsKey);

  if (topItems.length === 0) return null;

  return (
    <SectionShell title="Top em destaque" eyebrow="Mais assistidos da semana" rowRef={topRef} hasOverflow={hasOverflow}>
      <div className="mt-5 border-y border-white/[0.06] bg-[#181a20] py-6 md:mt-6 md:py-8">
        <div
          ref={topRef}
          className={`flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 pt-1 sm:gap-4 md:gap-6 ${PAGE_X} scrollbar-hide`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {topItems.map((item, index) => (
            <TopItemCard key={`${getMediaType(item)}-${item.id || item.mediaId}`} item={item} index={index} />
          ))}
          <div className="w-1 flex-none md:w-6" aria-hidden="true" />
        </div>
      </div>
    </SectionShell>
  );
}

function ReviewSpotlight({ items = [] }) {
  const reviews = items
    .filter(
      (item) =>
        item.type !== "list_share" &&
        item.mediaTitle &&
        item.rating !== null &&
        item.rating !== undefined &&
        item.rating !== "" &&
        Number.isFinite(Number(item.rating)),
    )
    .sort((a, b) => {
      const aHasText = Boolean(a.text?.trim());
      const bHasText = Boolean(b.text?.trim());
      if (aHasText !== bHasText) return bHasText - aHasText;
      return (b.likesCount || 0) + (b.commentsCount || 0) - (a.likesCount || 0) - (a.commentsCount || 0);
    })
    .slice(0, 6);

  if (reviews.length === 0) return null;

  return (
    <SectionShell
      title="Reviews em destaque"
      eyebrow="A conversa começa aqui"
      actionTo="/app/feed"
      actionLabel="Ver todas"
    >
      <div className={`mt-5 grid gap-x-8 border-y border-white/[0.06] md:mt-6 md:grid-cols-2 ${PAGE_X}`}>
        {reviews.map((review) => (
          <Link
            key={review.uniqueKey || review.id}
            to={mediaPath(review)}
            className="group/review grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-b border-white/[0.06] py-4 last:border-b-0 md:min-h-[132px] md:grid-cols-[72px_minmax(0,1fr)] md:[&:nth-last-child(-n+2)]:border-b-0"
          >
            <MediaImage
              item={{ poster_path: review.posterPath, backdrop_path: review.backdropPath }}
              size="w342"
              className="aspect-[2/3] w-full self-start rounded-md bg-zinc-900 transition-transform duration-300 group-hover/review:-translate-y-0.5"
            />
            <span className="min-w-0 self-center">
              <span className="flex items-center gap-2.5">
                <span className="relative grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-[9px] font-semibold uppercase text-zinc-300">
                  {(review.username || "C")[0]}
                  {review.userPhoto && <img src={review.userPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(event) => event.currentTarget.remove()} />}
                </span>
                <span className="truncate text-xs font-semibold text-zinc-300">@{review.username || "cinesorte"}</span>
                {review.rating !== null && review.rating !== undefined && <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-300"><Star size={11} className="fill-current" /> {Number(review.rating).toFixed(1)}</span>}
              </span>
              <span className="mt-2 line-clamp-2 block text-sm leading-5 text-zinc-200 sm:text-[15px]">{reviewExcerpt(review.text)}</span>
              <span className="mt-2 flex min-w-0 items-center gap-3 text-[11px] text-zinc-500">
                <span className="truncate font-semibold text-white transition-colors group-hover/review:text-violet-300">{review.mediaTitle}</span>
                <span className="inline-flex shrink-0 items-center gap-1"><Heart size={11} /> {review.likesCount || 0}</span>
                <span className="inline-flex shrink-0 items-center gap-1"><MessageCircle size={11} /> {review.commentsCount || 0}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

function ListCoverStack({ items = [] }) {
  const visibleItems = items.filter((item) => getImagePath(item)).slice(0, 4);

  if (visibleItems.length === 0) {
    return (
      <div className="grid h-32 place-items-center rounded-xl border border-dashed border-white/[0.08] bg-black/20 text-zinc-700">
        <Layers3 size={24} />
      </div>
    );
  }

  return (
    <div className="grid h-32 grid-cols-4 gap-1 overflow-hidden rounded-xl bg-zinc-900">
      {visibleItems.map((item, index) => (
        <MediaImage
          key={`${item.id || item.mediaId || index}-${index}`}
          item={item}
          size="w342"
          className="h-full w-full transition-transform duration-500 group-hover/card:scale-[1.035]"
        />
      ))}
    </div>
  );
}

function LibraryEmptyCard() {
  return (
    <Link
      to="/app/lists"
      className="flex h-[190px] w-[270px] flex-none flex-col justify-between rounded-xl border border-dashed border-white/[0.1] bg-white/[0.015] p-4 transition-colors hover:border-white/[0.18] hover:bg-white/[0.03] sm:w-[300px]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-500/10 text-violet-300">
        <Plus size={20} />
      </span>
      <span>
        <span className="block text-lg font-black text-white">Crie sua primeira lista</span>
        <span className="mt-2 block text-sm leading-5 text-zinc-500">
          Guarde favoritos, próximos títulos e coleções do seu jeito.
        </span>
      </span>
    </Link>
  );
}

function LibraryCard({ list, username }) {
  const items = list.items || [];
  const itemCount = items.length;
  const listTo = username && list.id ? `/app/lists/${username}/${list.id}` : "/app/lists";

  return (
    <Link
      to={listTo}
      className="group/card w-[270px] flex-none overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] p-3 transition-colors hover:border-white/[0.14] sm:w-[300px]"
    >
      <ListCoverStack items={items} />

      <div className="mt-3.5 flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate text-base font-black text-white">{list.name || "Lista sem nome"}</span>
          <span className="mt-1 block truncate text-xs text-zinc-500">
            {itemCount} {itemCount === 1 ? "título" : "títulos"}
          </span>
        </span>
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-colors group-hover/card:bg-white group-hover/card:text-zinc-950">
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function LibrarySection({ lists = [] }) {
  const railRef = useRef(null);
  const { user } = useAuth();
  const visibleLists = [...lists]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 8);
  const itemsKey = visibleLists.map((list) => list.id).join("|");
  const hasOverflow = useRailOverflow(railRef, itemsKey);

  return (
    <SectionShell title="Sua biblioteca" eyebrow="Continue sua curadoria" actionTo="/app/lists" actionLabel="Ver listas" rowRef={railRef} hasOverflow={hasOverflow}>
      <div
        ref={railRef}
        className={`flex gap-4 overflow-x-auto scroll-smooth pt-5 pb-4 md:gap-5 md:pt-6 md:pb-6 ${PAGE_X} scrollbar-hide`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {visibleLists.length > 0 ? (
          visibleLists.map((list) => (
            <LibraryCard key={list.id} list={list} username={user?.username} />
          ))
        ) : (
          <LibraryEmptyCard />
        )}
        <div className="w-1 flex-none md:w-6" aria-hidden="true" />
      </div>
    </SectionShell>
  );
}

function CommunityCard({ item }) {
  const detailTo = item.type === "list_share" ? `/app/lists/${item.username}/${item.attachmentId}` : mediaPath(item);
  const profileTo = item.username ? `/app/profile/${item.username}` : "/app/feed";

  return (
    <article className="group/card w-[270px] flex-none overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.018] transition-colors hover:border-white/[0.14] sm:w-[310px] md:w-[340px]">
      <Link to={detailTo} className="block">
        <div className="relative h-32 overflow-hidden bg-zinc-900 sm:h-36">
          {item.type === "list_share" && Array.isArray(item.listItems) && item.listItems.length > 0 ? (
            <div className="grid h-full grid-cols-4 gap-1">
              {item.listItems.slice(0, 4).map((listItem, index) => (
                <MediaImage key={`${listItem.id || listItem.mediaId || index}-${index}`} item={listItem} size="w342" className="h-full w-full" />
              ))}
            </div>
          ) : (
            <MediaImage item={{ poster_path: item.posterPath, backdrop_path: item.backdropPath }} size="w780" preferred="backdrop" className="h-full w-full transition-transform duration-500 group-hover/card:scale-[1.035]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <span className="absolute bottom-2.5 left-2.5 rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-md">
            {item.type === "list_share" ? "Lista" : "Review"}
          </span>
        </div>
      </Link>

      <div className="p-3.5">
        <Link to={profileTo} className="inline-flex max-w-full items-center gap-3">
          <span className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-xl bg-zinc-800 text-xs font-black uppercase text-zinc-300 ring-1 ring-white/10">
            {item.userPhoto ? <img src={item.userPhoto} alt="" className="h-full w-full object-cover" loading="lazy" /> : (item.username || "C")[0]}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-white">@{item.username || "cinesorte"}</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              {item.type === "list_share" ? "Lista compartilhada" : "Nova review"}
            </span>
          </span>
        </Link>

        <Link to={detailTo} className="mt-3 block">
          <h3 className="line-clamp-1 text-base font-black leading-tight text-white">
            {item.type === "list_share" ? item.listName : item.mediaTitle}
          </h3>
          {item.text && (
            <p className="mt-1.5 line-clamp-1 text-sm text-zinc-500">
              {item.text}
            </p>
          )}
        </Link>
      </div>
    </article>
  );
}

function SuggestionChip({ user }) {
  return (
    <Link
      to={`/app/profile/${user.username}`}
      className="flex w-[200px] flex-none items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.035]"
    >
      <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-xl bg-zinc-800 text-sm font-black uppercase text-zinc-300 ring-1 ring-white/10">
        {user.userPhoto ? <img src={user.userPhoto} alt="" className="h-full w-full object-cover" loading="lazy" /> : user.username?.[0]}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-black text-white">@{user.username}</span>
        <span className="block truncate text-xs text-zinc-500">{user.levelTitle || "Cinéfilo"}</span>
      </span>
    </Link>
  );
}

function CommunitySection({ items = [], suggestions = [] }) {
  const communityRef = useRef(null);
  const suggestionsRef = useRef(null);
  const featuredItems = items.filter((item) => item.type === "list_share").slice(0, 6);
  const visibleSuggestions = suggestions.slice(0, 8);
  const communityKey = featuredItems.map((item) => `${item.type}-${item.id}`).join("|");
  const suggestionsKey = visibleSuggestions.map((user) => user.username).join("|");
  const hasCommunityOverflow = useRailOverflow(communityRef, communityKey);
  const hasSuggestionsOverflow = useRailOverflow(suggestionsRef, suggestionsKey);

  if (featuredItems.length === 0 && visibleSuggestions.length === 0) return null;

  return (
    <>
      {featuredItems.length > 0 && (
        <SectionShell title="O que está ganhando conversa" eyebrow="Comunidade" actionTo="/app/feed" actionLabel="Abrir feed" rowRef={communityRef} hasOverflow={hasCommunityOverflow}>
          <div
            ref={communityRef}
            className={`flex gap-4 overflow-x-auto scroll-smooth pt-5 pb-4 md:gap-5 md:pt-6 md:pb-6 ${PAGE_X} scrollbar-hide`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredItems.map((item) => (
              <CommunityCard key={`${item.type}-${item.id}`} item={item} />
            ))}
            <div className="w-1 flex-none md:w-6" aria-hidden="true" />
          </div>
        </SectionShell>
      )}

      {visibleSuggestions.length > 0 && (
        <SectionShell title="Perfis para conhecer" eyebrow="Descoberta" actionTo="/app/feed" actionLabel="Ver mais" rowRef={suggestionsRef} hasOverflow={hasSuggestionsOverflow}>
          <div
            ref={suggestionsRef}
            className={`flex gap-3 overflow-x-auto scroll-smooth pt-5 pb-4 md:pt-6 md:pb-6 ${PAGE_X} scrollbar-hide`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {visibleSuggestions.map((user) => (
              <SuggestionChip key={user.username} user={user} />
            ))}
            <div className="w-1 flex-none md:w-6" aria-hidden="true" />
          </div>
        </SectionShell>
      )}
    </>
  );
}

export default function HomeExperience({ variant, data, socialItems = [], suggestions = [], lists = [] }) {
  if (variant === "top") {
    return <TopRail items={data.trendingWeek || []} />;
  }

  if (variant === "library") {
    return <LibrarySection lists={lists} />;
  }

  if (variant === "reviews") {
    return <ReviewSpotlight items={socialItems} />;
  }

  if (variant === "community") {
    return <CommunitySection items={socialItems} suggestions={suggestions} />;
  }

  return null;
}
