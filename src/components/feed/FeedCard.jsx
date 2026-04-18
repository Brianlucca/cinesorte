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
  Crown,
  Layers,
  Film,
  Zap,
  Eye,
  Sparkles,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

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

export default function FeedCard({ item, currentUser, onDelete, onLike, onLoadComments }) {
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

  const getEliteStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema":
        return { accent: "border-l-cyan-500", badge: "text-cyan-400 bg-cyan-400/10", icon: <Eye size={10} />, shadow: "shadow-cyan-500/10" };
      case "Entidade Cinematográfica":
        return { accent: "border-l-purple-500", badge: "text-purple-400 bg-purple-400/10", icon: <Sparkles size={10} />, shadow: "shadow-purple-500/10" };
      case "Oráculo da Sétima Arte":
        return { accent: "border-l-emerald-500", badge: "text-emerald-400 bg-emerald-400/10", icon: <Zap size={10} />, shadow: "shadow-emerald-500/10" };
      case "Mestre da Crítica":
        return { accent: "border-l-amber-500", badge: "text-amber-400 bg-amber-400/10", icon: <Crown size={10} />, shadow: "shadow-amber-500/10" };
      default:
        return { accent: "border-l-violet-500/50", badge: "text-zinc-500 bg-white/5", icon: null, shadow: "" };
    }
  };

  const style = getEliteStyle(item.levelTitle);

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
      className={`group relative overflow-hidden rounded-[2rem] border border-l-4 border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl transition-all duration-500 hover:border-white/10 hover:bg-white/[0.04] ${style.accent} ${style.shadow}`}
    >
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Link to={`/app/profile/${item.username}`} className="relative shrink-0 self-start group/avatar">
            <div className="h-12 w-12 overflow-hidden rounded-2xl bg-zinc-800 ring-2 ring-white/5 shadow-lg transition-all group-hover/avatar:ring-violet-500/50">
              {photoURL ? (
                <img src={photoURL} className="h-full w-full object-cover" alt="" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-black text-sm uppercase text-zinc-500">{displayUsername[0]}</div>
              )}
            </div>
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/app/profile/${item.username}`} className="text-sm font-black text-white transition-colors hover:text-violet-400">
                @{displayUsername}
              </Link>
              {item.levelTitle && (
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${style.badge}`}>
                  {style.icon} {item.levelTitle.split(" ")[0]}
                </span>
              )}
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
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
          {!isListShare && (
            <div className="flex items-center gap-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-black text-yellow-500 shadow-lg">
              <Star size={12} className="fill-yellow-500" />
              {item.rating?.toFixed(1)}
            </div>
          )}

          {isOwner && (
            <button
              onClick={() => onDelete(item.id, isListShare ? "list_share" : "review")}
              className="rounded-2xl bg-white/5 p-2.5 text-zinc-500 shadow-sm transition-all hover:bg-red-400/10 hover:text-red-400"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {item.content && <p className="mb-5 text-justify text-base font-light leading-relaxed text-zinc-300">{item.content}</p>}

        {isListShare ? (
          <Link to={item.username && item.attachmentId ? `/app/lists/${item.username}/${item.attachmentId}` : "#"} className="block group/list">
            <div className="flex flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-950/40 shadow-2xl transition-all group-hover/list:border-violet-500/30">
              <div className="grid h-56 grid-cols-12 gap-1 overflow-hidden md:h-72">
                {listItems.length > 0 ? (
                  <>
                    <div className={`${listItems.length === 1 ? "col-span-12" : "col-span-8"} relative h-full overflow-hidden`}>
                      <img
                        src={`https://image.tmdb.org/t/p/w780${listItems[0].poster_path}`}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover/list:scale-105"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                    </div>

                    {listItems.length > 1 && (
                      <div className="col-span-4 flex h-full flex-col gap-1">
                        <div className="relative h-full overflow-hidden">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${listItems[1].poster_path}`}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover/list:scale-110"
                            alt=""
                          />
                          {listItems.length > 2 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                              <span className="text-2xl font-black text-white">+{item.listCount - 1 || listItems.length - 1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-12 flex items-center justify-center bg-zinc-900 py-20">
                    <Layers size={40} className="text-zinc-800" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4 bg-white/[0.02] p-6 md:flex-row md:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-6 w-1.5 rounded-full bg-violet-500" />
                    <h3 className="truncate text-xl font-black uppercase tracking-tight text-white">{item.listName || "Minha seleção"}</h3>
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <Layers size={14} className="text-violet-500" />
                    <span>{item.listCount || listItems.length} itens catalogados</span>
                  </div>
                </div>

                <div className="transform rounded-2xl bg-white px-6 py-3 text-center text-[11px] font-black uppercase tracking-widest text-black shadow-xl transition-all group-hover/list:scale-105">
                  Explorar coleção
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <>
            <Link to={mediaLink} className="group/media relative block overflow-hidden rounded-[1.5rem] border border-white/5 shadow-2xl">
              {item.backdropPath ? (
                <div className="relative aspect-[21/9]">
                  <img
                    src={`https://image.tmdb.org/t/p/original${item.backdropPath}`}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover/media:scale-105"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="line-clamp-1 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-2xl">{item.mediaTitle}</h3>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5 bg-white/[0.03] p-5">
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800 shadow-2xl">
                    {item.posterPath ? (
                      <img src={`https://image.tmdb.org/t/p/w342${item.posterPath}`} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <Film size={24} className="m-auto h-full text-zinc-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 line-clamp-2 text-xl font-black tracking-tight text-white">{item.mediaTitle}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                      {item.mediaType === "tv" ? "Série" : "Filme"}
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {item.text && (
              <div className="mt-5">
                <div className="text-justify text-base font-light leading-relaxed text-zinc-200">
                  {renderRichText(visibleText, reviewSpoilerDisabled)}
                  {item.text.length > maxTextLength && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-xs font-black uppercase tracking-widest text-violet-400 hover:text-violet-300">
                      {isExpanded ? "Ler menos" : "Ver mais"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-5">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
                isLiked ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
              } ${isLikeAnimating ? "scale-125" : "scale-100"}`}
            >
              <Heart size={22} className={isLiked ? "fill-red-500" : ""} />
              {item.likesCount > 0 && <span>{item.likesCount}</span>}
            </button>

            <button onClick={handleLoadCommentsClick} className="flex items-center gap-2 text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-300">
              <MessageCircle size={22} />
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </button>

            <button onClick={handleShare} className="text-zinc-500 transition-colors hover:text-zinc-300">
              <Share2 size={22} />
            </button>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-6 animate-in slide-in-from-top-2 space-y-4 border-t border-white/5 pt-5 duration-300">
            {displayedReplies.map((reply) => (
              <div key={reply.id} className="group/reply flex gap-3">
                <div className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-zinc-800 shadow-md">
                  {reply.userPhoto ? (
                    <img src={reply.userPhoto} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase text-zinc-500">{reply.username[0]}</div>
                  )}
                </div>

                <div className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link to={`/app/profile/${reply.username}`} className="text-xs font-black text-zinc-100 transition-colors hover:text-violet-400">
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
