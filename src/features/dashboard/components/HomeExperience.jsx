import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Plus,
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
          <h2 className="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl md:text-3xl">
            <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-violet-400 to-violet-700" />
            {title}
          </h2>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {actionTo && actionLabel && (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-200 transition-all hover:bg-white hover:text-zinc-950"
            >
              {actionLabel}
              <ArrowRight size={14} />
            </Link>
          )}

          {hasControls && (
            <div className="flex gap-2 opacity-40 transition-opacity duration-300 group-hover/row:opacity-100">
              <button
                type="button"
                aria-label={`Voltar na seção ${title}`}
                onClick={() => slideRail(rowRef, "left")}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white shadow-lg transition-all hover:bg-white/10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label={`Avançar na seção ${title}`}
                onClick={() => slideRail(rowRef, "right")}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white shadow-lg transition-all hover:bg-white/10"
              >
                <ChevronRight size={20} />
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
  return (
    <Link
      to={mediaPath(item)}
      className="group/card flex h-20 w-[260px] flex-none items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/25 sm:w-[300px]"
    >
      <span className="w-8 flex-none text-center text-lg font-black tabular-nums text-zinc-500">
        {index + 1}
      </span>
      <MediaImage item={item} size="w342" className="h-14 w-10 flex-none rounded-xl border border-white/[0.08]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-white">{getMediaName(item)}</span>
        <span className="mt-1 block truncate text-xs text-zinc-500">
          {getMediaType(item) === "tv" ? "Série" : "Filme"} {getMediaYear(item)}
        </span>
      </span>
      <ArrowRight size={15} className="mr-1 flex-none text-zinc-600 transition-all group-hover/card:translate-x-0.5 group-hover/card:text-white" />
    </Link>
  );
}

function TopRail({ items = [] }) {
  const topRef = useRef(null);
  const topItems = items.filter((item) => getImagePath(item)).slice(0, 8);
  const itemsKey = topItems.map((item) => `${getMediaType(item)}-${item.id || item.mediaId}`).join("|");
  const hasOverflow = useRailOverflow(topRef, itemsKey);

  if (topItems.length === 0) return null;

  return (
    <SectionShell title="Top em destaque" eyebrow="Semana" rowRef={topRef} hasOverflow={hasOverflow}>
      <div
        ref={topRef}
        className={`flex gap-3 overflow-x-auto scroll-smooth pt-5 pb-4 md:pt-6 md:pb-6 ${PAGE_X} scrollbar-hide`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {topItems.map((item, index) => (
          <TopItemCard key={`${getMediaType(item)}-${item.id || item.mediaId}`} item={item} index={index} />
        ))}
        <div className="w-1 flex-none md:w-6" aria-hidden="true" />
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
      className="flex h-[220px] w-[280px] flex-none flex-col justify-between rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] p-4 transition-all hover:border-violet-300/30 hover:bg-white/[0.04] sm:w-[320px]"
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
      className="group/card w-[280px] flex-none overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/25 sm:w-[320px]"
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
    <article className="group/card w-[280px] flex-none overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/25 sm:w-[320px] md:w-[360px]">
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
      className="flex w-[210px] flex-none items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 transition-all hover:border-white/[0.14] hover:bg-white/[0.05]"
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
  const featuredItems = items.slice(0, 6);
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

  if (variant === "community") {
    return <CommunitySection items={socialItems} suggestions={suggestions} />;
  }

  return null;
}
