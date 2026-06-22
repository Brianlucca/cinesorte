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
import { useToast } from "../../context/ToastContext";
import LevelBadge from "../ui/LevelBadge";

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

  const getEliteStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema":
        return { accent: "border-l-cyan-500", shadow: "shadow-cyan-500/10" };
      case "Entidade Cinematográfica":
        return { accent: "border-l-purple-500", shadow: "shadow-purple-500/10" };
      case "Oráculo da Sétima Arte":
        return { accent: "border-l-emerald-500", shadow: "shadow-emerald-500/10" };
      case "Mestre da Crítica":
        return { accent: "border-l-amber-500", shadow: "shadow-amber-500/10" };
      default:
        return { accent: "border-l-violet-500/50", shadow: "" };
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
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0d0d10]/95 shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition-all duration-500 hover:border-white/[0.13] ${style.accent} ${style.shadow}`}
    >
      <div className="flex items-start justify-between gap-3 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
          <Link to={`/app/profile/${item.username}`} className="relative shrink-0 self-start group/avatar">
            <div className="h-11 w-11 overflow-hidden rounded-2xl bg-zinc-800 ring-1 ring-white/10 shadow-lg transition-all group-hover/avatar:ring-violet-500/50 sm:h-12 sm:w-12">
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
                <div className="origin-left scale-[0.92]">
                  <LevelBadge title={item.levelTitle} />
                </div>
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

      <div className="px-4 pb-5 sm:px-6 sm:pb-6">
        {item.content && !isListShare && <p className="mb-5 text-base leading-relaxed text-zinc-300">{item.content}</p>}

        {isListShare ? (
          <Link to={item.username && item.attachmentId ? `/app/lists/${item.username}/${item.attachmentId}` : "#"} className="block group/list">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#09090b] transition-all duration-500 group-hover/list:border-violet-400/25">
              <div className="grid h-64 grid-cols-12 gap-1 overflow-hidden sm:h-80">
                {listItems.length > 0 ? (
                  <>
                    <div className={`${listItems.length === 1 ? "col-span-12" : "col-span-7"} relative overflow-hidden`}>
                      <img
                        src={`https://image.tmdb.org/t/p/w780${listItems[0].poster_path}`}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover/list:scale-[1.04]"
                        alt=""
                      />
                    </div>
                    {listItems.length > 1 && (
                      <div className="col-span-5 grid grid-cols-2 gap-1 overflow-hidden">
                        {listItems.slice(1, 5).map((listItem, index) => (
                          <div
                            key={`${listItem.id || listItem.mediaId || index}-${index}`}
                            className={`relative overflow-hidden ${listItems.length === 2 ? "col-span-2 row-span-2" : ""}`}
                          >
                            <img
                              src={`https://image.tmdb.org/t/p/w500${listItem.poster_path}`}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover/list:scale-105"
                              alt=""
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-12 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_60%)]">
                    <Layers size={42} className="text-zinc-700" />
                  </div>
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_18%,rgba(9,9,11,0.2)_44%,rgba(9,9,11,0.96)_100%)]" />
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-xl">
                <Layers size={12} className="text-violet-300" />
                Curadoria
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-5">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">Coleção compartilhada</span>
                    <h3 className="mt-2 line-clamp-2 text-2xl font-black leading-[1.02] tracking-[-0.03em] text-white drop-shadow-xl sm:text-3xl">
                      {item.listName || "Minha seleção"}
                    </h3>
                    {item.content && <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-5 text-zinc-300 sm:text-sm">{item.content}</p>}
                    <div className="mt-3 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                      <span>{item.listCount || listItems.length} títulos</span>
                      {Number(item.listCount || 0) > listItems.length && <span>+{Number(item.listCount) - listItems.length} na coleção</span>}
                    </div>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-zinc-950 shadow-xl transition-transform group-hover/list:scale-105">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#09090b]">
            <Link to={mediaLink} className="group/media relative block h-52 overflow-hidden sm:h-64">
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

              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-200 backdrop-blur-xl">
                  {item.mediaType === "tv" ? "Série" : item.mediaType === "person" ? "Artista" : "Filme"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-300/20 bg-black/40 px-3 py-1.5 text-[10px] font-black text-yellow-300 backdrop-blur-xl">
                  <Star size={11} className="fill-current" />
                  {Number(item.rating || 0).toFixed(1)}
                </span>
              </div>

              <div className={`absolute inset-x-0 bottom-0 grid ${item.posterPath ? "grid-cols-[72px_minmax(0,1fr)] sm:grid-cols-[100px_minmax(0,1fr)]" : "grid-cols-1"} items-end gap-4 px-4 pb-5 sm:gap-5 sm:px-5`}>
                {item.posterPath && (
                  <div className="overflow-hidden rounded-xl border border-white/15 bg-zinc-900 shadow-[0_16px_35px_rgba(0,0,0,0.5)]">
                    <img src={`https://image.tmdb.org/t/p/w342${item.posterPath}`} className="aspect-[2/3] w-full object-cover" alt="" />
                  </div>
                )}
                <div className="min-w-0 pb-0.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">Avaliação sobre</span>
                  <div className="mt-1.5 flex items-start gap-2">
                    <h3 className="line-clamp-2 flex-1 text-xl font-black leading-[1.04] tracking-[-0.03em] text-white drop-shadow-xl sm:text-3xl">{item.mediaTitle}</h3>
                    <ArrowUpRight size={18} className="mt-1 shrink-0 text-white/60 transition-transform group-hover/media:-translate-y-0.5 group-hover/media:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="relative border-t border-white/[0.06] p-4 sm:p-5">
              <span className="pointer-events-none absolute left-4 top-3 font-serif text-5xl leading-none text-violet-400/15 sm:left-5">“</span>
              {item.text ? (
                <div className="relative pl-4 sm:pl-5">
                  <div className="text-sm font-normal leading-6 text-zinc-300 sm:text-[15px] sm:leading-7">
                    {renderRichText(visibleText, reviewSpoilerDisabled)}
                    {item.text.length > maxTextLength && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="ml-2 text-[9px] font-black uppercase tracking-[0.14em] text-violet-400 hover:text-violet-300"
                      >
                        {isExpanded ? "Ler menos" : "Continuar lendo"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="relative pl-5 text-sm italic text-zinc-600">Uma avaliação sem comentário.</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-all duration-300 ${
                isLiked ? "bg-red-500/10 text-red-400" : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
              } ${isLikeAnimating ? "scale-125" : "scale-100"}`}
            >
              <Heart size={18} className={isLiked ? "fill-red-400" : ""} />
              <span>{item.likesCount || 0}</span>
            </button>

            <button onClick={handleLoadCommentsClick} className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300">
              <MessageCircle size={18} />
              <span>{commentsCount}</span>
            </button>

            <button onClick={handleShare} className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300" aria-label="Compartilhar">
              <Share2 size={18} />
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
