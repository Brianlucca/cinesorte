import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Trash2,
  MessageCircle,
  Share2,
  Heart,
  ChevronDown,
  ChevronUp,
  Layers,
  Film,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@shared/context/useToast";
import LevelBadge from "@shared/components/ui/LevelBadge";

function SpoilerText({ children, isRevealed }) {
  return (
    <span
      className={`relative inline-flex max-w-full overflow-hidden rounded-lg px-1.5 py-0.5 align-middle transition-all ${
        isRevealed ? "bg-transparent text-zinc-100" : "bg-white/[0.035] text-zinc-300/20"
      }`}
    >
      {!isRevealed && (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008),rgba(255,255,255,0.03))]" />
          <span className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.05),transparent_32%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.04),transparent_30%)] opacity-90" />
        </>
      )}
      <span className={`relative break-words transition-all ${isRevealed ? "" : "select-none blur-[6px] opacity-45"}`}>{children}</span>
    </span>
  );
}

function hasSpoilerMarkup(text) {
  return /\|\|[^|]+\|\|/.test(text || "");
}

function renderInlineContent(text, spoilersRevealed = false) {
  const pattern = /(\|\|[^|]+\|\||\*\*[^*]+\*\*|\*[^*]+\*|@[a-zA-Z0-9_]+)/g;

  return text.split(pattern).filter(Boolean).map((part, index) => {
    if (/^\|\|[^|]+\|\|$/.test(part)) {
      return (
        <SpoilerText key={`spoiler-${index}`} isRevealed={spoilersRevealed}>
          {part.slice(2, -2)}
        </SpoilerText>
      );
    }

    if (/^@[a-zA-Z0-9_]+$/.test(part)) {
      return (
        <Link
          key={`mention-${index}`}
          to={`/app/profile/${part.slice(1)}`}
          className="font-semibold text-violet-400 transition-colors hover:text-violet-300"
        >
          {part}
        </Link>
      );
    }

    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={`strong-${index}`} className="font-extrabold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^\*[^*]+\*$/.test(part)) {
      return (
        <em key={`em-${index}`} className="italic text-zinc-100">
          {part.slice(1, -1)}
        </em>
      );
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
}

function renderRichText(text, spoilersRevealed = false) {
  if (!text) return null;

  return text.split("\n").map((line, index) => {
    if (line.startsWith("> ")) {
      return (
        <blockquote key={index} className="my-2 border-l-2 border-violet-400/50 pl-4 italic text-zinc-200">
          {renderInlineContent(line.slice(2), spoilersRevealed)}
        </blockquote>
      );
    }

    if (line.startsWith("- ")) {
      return (
        <div key={index} className="my-1.5 flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
          <span>{renderInlineContent(line.slice(2), spoilersRevealed)}</span>
        </div>
      );
    }

    return (
      <p key={index} className="my-1.5">
        {renderInlineContent(line, spoilersRevealed)}
      </p>
    );
  });
}

function buildMediaLink(item) {
  const rawId = item.mediaId?.toString() || "";

  if (item.mediaType === "person") {
    return `/app/person/${rawId.replace(/^person-/, "")}`;
  }

  const episodeMatch = rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
  if (episodeMatch || item.mediaType === "episode") {
    const match = episodeMatch || rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
    if (match) {
      const [, tvId, season, episode] = match;
      return `/app/tv/${tvId}/season/${parseInt(season)}/episode/${parseInt(episode)}`;
    }
  }

  const seasonMatch = rawId.match(/^(?:tv-)?(\d+)-s(\d+)$/);
  if (seasonMatch) {
    const [, tvId, season] = seasonMatch;
    return `/app/tv/${tvId}/season/${parseInt(season)}`;
  }

  return `/app/${item.mediaType || "movie"}/${rawId.replace(/^(movie-|tv-)/, "")}`;
}

export default function FeedCard({ item, onDelete, onLike, onLoadComments }) {
  const [visibleComments, setVisibleComments] = useState(3);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [reviewSpoilerDisabled, setReviewSpoilerDisabled] = useState(false);
  const [disabledReplySpoilers, setDisabledReplySpoilers] = useState({});
  const toast = useToast();

  const isListShare = item.type === "list_share";
  const displayUsername = item.username || item.nickname || "Anônimo";
  const photoURL = item.userPhoto || item.photoURL || null;
  const replies = item.replies || [];
  const commentsCount = item.commentsCount || 0;
  const isOwner = !!item.isOwner;
  const isLiked = !!item.isLikedByCurrentUser;
  const itemHasSpoiler = hasSpoilerMarkup(item.text);
  const maxTextLength = 160;

  const mediaLink = buildMediaLink(item);
  const displayedReplies = replies.slice(0, visibleComments);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString._seconds ? dateString._seconds * 1000 : dateString);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
  };

  const handleShare = async () => {
    const shareUrl = isListShare
      ? `${window.location.origin}/app/lists/${item.username}/${item.attachmentId}`
      : `${window.location.origin}${mediaLink}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "CineSorte", url: shareUrl });
      } catch {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copiado!");
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado!");
    }
  };

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike(item.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleLoadCommentsClick = async () => {
    if (replies.length === 0 && commentsCount > 0) {
      setLoadingComments(true);
      await onLoadComments(item.id);
      setLoadingComments(false);
    }

    setVisibleComments((prev) => (prev === 0 ? 3 : prev + 5));
  };

  const toggleReplySpoiler = (replyId) => {
    setDisabledReplySpoilers((current) => ({
      ...current,
      [replyId]: !current[replyId],
    }));
  };

  const listItems = Array.isArray(item.listItems) ? item.listItems : [];
  const visibleText = isExpanded || !item.text || item.text.length <= maxTextLength ? item.text : `${item.text.slice(0, maxTextLength)}...`;

  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] transition-colors hover:border-white/[0.13]"
    >
      <div className="flex items-start justify-between gap-3 p-4 sm:px-5 sm:pt-5">
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <Link to={`/app/profile/${item.username}`} className="relative shrink-0 self-start group/avatar">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/[0.08] transition-colors group-hover/avatar:ring-white/20 sm:h-11 sm:w-11">
              {photoURL ? (
                <img src={photoURL} className="h-full w-full object-cover" alt="" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-zinc-500">{displayUsername[0]}</div>
              )}
            </div>
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/app/profile/${item.username}`} className="text-sm font-semibold text-white transition-colors hover:text-violet-300">
                @{displayUsername}
              </Link>
              {item.levelTitle && (
                <div className="origin-left scale-[0.92]">
                  <LevelBadge title={item.levelTitle} />
                </div>
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              <span>{formatDate(item.createdAt)}</span>
              <span className="text-zinc-700">•</span>
              <span className="text-violet-500/80">{isListShare ? "Coleção" : "Avaliação"}</span>
              {!isListShare && itemHasSpoiler && (
                <button
                  type="button"
                  onClick={() => setReviewSpoilerDisabled((current) => !current)}
                  className="inline-flex items-center rounded-full border border-amber-400/15 bg-amber-400/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200/90 transition-colors hover:border-amber-300/25 hover:bg-amber-300/10"
                >
                  {reviewSpoilerDisabled ? "Ativar spoiler" : "Desativar spoiler"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => onDelete(item.id, isListShare ? "list_share" : "review")}
              className="rounded-full p-2.5 text-zinc-500 transition-colors hover:bg-red-400/10 hover:text-red-400"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        {item.content && !isListShare && <p className="mb-5 text-base leading-relaxed text-zinc-300">{item.content}</p>}

        {isListShare ? (
          <Link to={item.username && item.attachmentId ? `/app/lists/${item.username}/${item.attachmentId}` : "#"} className="block group/list">
            <div className="relative overflow-hidden rounded-lg bg-[#111216] ring-1 ring-white/[0.06] transition-colors group-hover/list:ring-white/[0.14]">
              <div className="flex h-44 gap-px overflow-hidden sm:h-48">
                {listItems.length > 0 ? (
                  listItems.slice(0, 5).map((listItem, index) => (
                    <div key={`${listItem.id || listItem.mediaId || index}-${index}`} className={`relative min-w-0 overflow-hidden ${index === 0 ? "flex-[1.45]" : "flex-1"}`}>
                      <img
                        src={`https://image.tmdb.org/t/p/w500${listItem.poster_path}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/list:scale-[1.04]"
                        alt=""
                      />
                    </div>
                  ))
                ) : (
                  <div className="grid flex-1 place-items-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_60%)]">
                    <Layers size={32} className="text-zinc-700" />
                  </div>
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.76)_0%,rgba(9,9,11,0.18)_58%,rgba(9,9,11,0.12)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
              <div className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-md">
                <Layers size={11} className="text-violet-300" />
                Coleção
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300">Coleção compartilhada</span>
                    <h3 className="mt-1 line-clamp-1 text-xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-2xl">
                      {item.listName || "Minha seleção"}
                    </h3>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] font-medium text-zinc-400">
                      <span>{item.listCount || listItems.length} títulos</span>
                    </div>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/90 text-zinc-950 transition-colors group-hover/list:bg-white">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="overflow-hidden rounded-lg bg-[#111216]">
            <Link to={mediaLink} className="group/media relative block h-52 overflow-hidden sm:h-60">
              {item.backdropPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w1280${item.backdropPath}`}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover/media:scale-[1.04]"
                  alt=""
                />
              ) : item.posterPath ? (
                <img src={`https://image.tmdb.org/t/p/w780${item.posterPath}`} className="h-full w-full scale-110 object-cover opacity-60 blur-sm" alt="" />
              ) : (
                <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12),transparent_58%)]">
                  <Film size={38} className="text-zinc-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_10%,rgba(9,9,11,0.28)_45%,#09090b_100%)]" />

              <div className="absolute left-3.5 top-3.5">
                <span className="rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-200 backdrop-blur-md">
                  {item.mediaType === "tv" ? "Série" : item.mediaType === "person" ? "Artista" : "Filme"}
                </span>
              </div>

              <div className={`absolute inset-x-0 bottom-0 grid ${item.posterPath ? "grid-cols-[70px_minmax(0,1fr)] sm:grid-cols-[86px_minmax(0,1fr)]" : "grid-cols-1"} items-end gap-4 px-4 pb-4 sm:px-5`}>
                {item.posterPath && (
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-[0_16px_35px_rgba(0,0,0,0.5)]">
                    <img src={`https://image.tmdb.org/t/p/w342${item.posterPath}`} className="aspect-[2/3] w-full object-cover" alt="" />
                  </div>
                )}
                <div className="min-w-0 pb-0.5">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-300">Avaliação sobre</span>
                  <div className="mt-1 flex items-start gap-2">
                    <h3 className="line-clamp-2 flex-1 text-lg font-semibold leading-tight tracking-[-0.02em] text-white sm:text-xl">{item.mediaTitle}</h3>
                    <ArrowUpRight size={16} className="mt-1 shrink-0 text-white/55 transition-transform group-hover/media:-translate-y-0.5 group-hover/media:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>

            {item.text ? (
              <div className="flex items-start justify-between gap-5 border-t border-white/[0.06] px-4 py-4 sm:px-5">
                <div className="min-w-0 flex-1 text-sm font-normal leading-6 text-zinc-300 sm:text-[15px] sm:leading-7">
                    {renderRichText(visibleText, reviewSpoilerDisabled)}
                    {item.text.length > maxTextLength && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400 hover:text-violet-300"
                      >
                        {isExpanded ? "Ler menos" : "Continuar lendo"}
                      </button>
                    )}
                </div>
                {item.rating !== null && item.rating !== undefined && (
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-yellow-300">
                    <Star size={13} className="fill-current" /> {Number(item.rating).toFixed(1)}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 sm:px-5">
                <span className="text-xs text-zinc-500">Avaliação registrada sem comentário</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-300">
                  <Star size={13} className="fill-current" /> {Number(item.rating || 0).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 ${
                isLiked ? "bg-red-500/10 text-red-400" : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
              } ${isLikeAnimating ? "scale-125" : "scale-100"}`}
            >
              <Heart size={18} className={isLiked ? "fill-red-400" : ""} />
              <span>{item.likesCount || 0}</span>
            </button>

            <button onClick={handleLoadCommentsClick} className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300">
              <MessageCircle size={18} />
              <span>{commentsCount}</span>
            </button>

            <button onClick={handleShare} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300" aria-label="Compartilhar">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-5 animate-in slide-in-from-top-2 border-t border-white/[0.06] pt-3 duration-300">
            {displayedReplies.map((reply) => (
              <div key={reply.id} className="group/reply flex gap-3 border-b border-white/[0.05] py-3 last:border-0">
                <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/[0.06]">
                  {reply.userPhoto ? (
                    <img src={reply.userPhoto} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase text-zinc-500">{reply.username[0]}</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link to={`/app/profile/${reply.username}`} className="text-xs font-semibold text-zinc-100 transition-colors hover:text-violet-400">
                        @{reply.username}
                      </Link>
                      {hasSpoilerMarkup(reply.text) && (
                        <button
                          type="button"
                          onClick={() => toggleReplySpoiler(reply.id)}
                          className="inline-flex items-center rounded-full border border-amber-400/15 bg-amber-400/8 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-200/90 transition-colors hover:border-amber-300/25 hover:bg-amber-300/10"
                        >
                          {disabledReplySpoilers[reply.id] ? "Ativar spoiler" : "Desativar spoiler"}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase text-zinc-600">{formatDate(reply.createdAt)}</span>
                  </div>

                  <div className="break-words text-xs font-medium leading-relaxed text-zinc-300">
                    {renderRichText(reply.text, disabledReplySpoilers[reply.id])}
                  </div>
                </div>
              </div>
            ))}

            {replies.length > 3 && (
              <button
                onClick={() => setVisibleComments((prev) => (prev > 3 ? 3 : prev + 5))}
                className="flex w-full items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 transition-colors hover:text-white"
              >
                {visibleComments > 3 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {visibleComments > 3 ? "Recolher conversa" : `Ver mais ${replies.length - 3} respostas`}
              </button>
            )}

            {loadingComments && replies.length === 0 && (
              <div className="text-center text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Carregando comentários...</div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
