import { useMemo, useRef, useState } from "react";
import {
  Star,
  MessageCircle,
  Send,
  Trash2,
  Heart,
  Loader2,
  Edit2,
  X,
  Check,
  Pin,
} from "lucide-react";
import { Link } from "react-router-dom";
import LevelBadge from "../../ui/LevelBadge";
import { MentionTextarea } from "./MentionTextarea";
import RichTextToolbar from "./RichTextToolbar";

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

function normalizeLevelTitle(title) {
  return (title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
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

const ELITE_THEME = {
  "Divindade do Cinema": {
    card: "border-cyan-500/35 bg-[linear-gradient(180deg,rgba(8,145,178,0.12),rgba(9,9,11,0.92))] shadow-[0_0_38px_rgba(6,182,212,0.12)]",
    accent: "bg-cyan-400",
    chip: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    text: "text-cyan-200",
  },
  "Entidade Cinematografica": {
    card: "border-fuchsia-500/35 bg-[linear-gradient(180deg,rgba(147,51,234,0.12),rgba(9,9,11,0.92))] shadow-[0_0_38px_rgba(168,85,247,0.12)]",
    accent: "bg-fuchsia-400",
    chip: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-200",
    text: "text-fuchsia-200",
  },
  "Oraculo da Setima Arte": {
    card: "border-emerald-500/35 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(9,9,11,0.92))] shadow-[0_0_38px_rgba(16,185,129,0.12)]",
    accent: "bg-emerald-400",
    chip: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    text: "text-emerald-200",
  },
  "Mestre da Critica": {
    card: "border-amber-500/35 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(9,9,11,0.92))] shadow-[0_0_38px_rgba(245,158,11,0.12)]",
    accent: "bg-amber-400",
    chip: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    text: "text-amber-200",
  },
};

const MAX_TEXT_LENGTH = 180;

function formatCreatedAt(createdAt) {
  if (!createdAt?._seconds) return "agora";
  return new Date(createdAt._seconds * 1000).toLocaleDateString();
}

export default function ReviewItem({
  review,
  onReply,
  onDelete,
  onDeleteComment,
  onLike,
  onLoadReplies,
  onEditReview,
  onEditReply,
  isElite,
  followingList,
  canUseRichFormatting,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyAnchorId, setReplyAnchorId] = useState("review");
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editReviewText, setEditReviewText] = useState(review.text || "");
  const [editRating, setEditRating] = useState(review.rating ?? null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [reviewSpoilerDisabled, setReviewSpoilerDisabled] = useState(false);
  const [disabledReplySpoilers, setDisabledReplySpoilers] = useState({});

  const reviewEditorRef = useRef(null);
  const replyEditorRef = useRef(null);
  const editReplyRef = useRef(null);

  const replies = review.replies || [];
  const isLiked = !!review.isLikedByCurrentUser;
  const isOwner = !!review.isOwner;
  const hasText = review.text && review.text.trim().length > 0;
  const hasRating = review.rating !== null && review.rating !== undefined;
  const reviewHasSpoiler = hasSpoilerMarkup(review.text);
  const eliteTheme = ELITE_THEME[normalizeLevelTitle(review.levelTitle)] || {
    card: "border-violet-500/35 bg-[linear-gradient(180deg,rgba(139,92,246,0.1),rgba(9,9,11,0.92))] shadow-[0_0_38px_rgba(139,92,246,0.12)]",
    accent: "bg-violet-400",
    chip: "border-violet-400/25 bg-violet-400/10 text-violet-200",
    text: "text-violet-200",
  };

  const displayText = hasText
    ? isExpanded || review.text.length <= MAX_TEXT_LENGTH
      ? review.text
      : `${review.text.slice(0, MAX_TEXT_LENGTH)}...`
    : null;

  const toggleReplySpoiler = (replyId) => {
    setDisabledReplySpoilers((current) => ({
      ...current,
      [replyId]: !current[replyId],
    }));
  };

  const handleShowReplies = async () => {
    if (replies.length === 0 && review.commentsCount > 0) {
      setIsLoadingReplies(true);
      await onLoadReplies(review.id);
      setIsLoadingReplies(false);
    }
    setShowReplies(true);
  };

  const resetReplyComposer = () => {
    setReplyText("");
    setReplyTarget(null);
    setReplyAnchorId("review");
    setIsReplying(false);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    try {
      await onReply(review.id, replyText);
      resetReplyComposer();
      setShowReplies(true);
    } catch {}
  };

  const openReplyComposer = (username, anchorId = "review") => {
    const mention = `@${username} `;
    setReplyTarget(username);
    setReplyAnchorId(anchorId);
    setReplyText((current) => {
      const normalized = current.replace(/^@[a-zA-Z0-9_]+\s+/, "");
      return `${mention}${normalized}`.trimStart();
    });
    setIsReplying(true);
    setShowReplies(true);

    requestAnimationFrame(() => {
      if (!replyEditorRef.current) return;
      replyEditorRef.current.focus();
      const end = replyEditorRef.current.value.length;
      replyEditorRef.current.setSelectionRange(end, end);
    });
  };

  const renderReplyComposer = () => (
    <div className="mt-4 w-full animate-in slide-in-from-top-2 space-y-4 rounded-2xl border border-white/5 bg-black/20 p-4">
      {replyTarget && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-violet-500/15 bg-violet-500/8 px-3 py-2">
          <span className="text-xs font-semibold text-violet-200">
            Respondendo para <span className="font-black">@{replyTarget}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setReplyTarget(null);
              setReplyAnchorId("review");
              setReplyText((current) => current.replace(/^@[a-zA-Z0-9_]+\s+/, ""));
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:text-white"
          >
            Limpar menção
          </button>
        </div>
      )}
      <div className="space-y-3">
        <RichTextToolbar
          inputRef={replyEditorRef}
          onChange={setReplyText}
          allowFormatting={canUseRichFormatting}
          allowSpoiler
          allowEmoji
          allowTemplates
        />
      </div>
      <div className="flex items-start gap-3">
        <MentionTextarea
          value={replyText}
          onChange={setReplyText}
          followingList={followingList}
          placeholder="Escreva sua resposta..."
          inputRefExternal={replyEditorRef}
          maxLength={400}
          className="min-h-[100px] w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white transition-colors focus:border-violet-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmitReply}
          className="shrink-0 rounded-2xl bg-violet-600 p-3 text-white transition-colors hover:bg-violet-500"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );

  const handleSaveReviewEdit = async () => {
    try {
      if (onEditReview) await onEditReview(review.id, editReviewText, editRating);
      setIsEditing(false);
    } catch {}
  };

  const handleSaveReplyEdit = async (commentId) => {
    try {
      if (onEditReply) await onEditReply(commentId, editReplyText, review.id);
      setEditingReplyId(null);
    } catch {}
  };

  const replyList = useMemo(
    () => replies.sort((a, b) => (a.createdAt?._seconds || 0) - (b.createdAt?._seconds || 0)),
    [replies],
  );

  return (
    <div
      className={`group w-full border transition-all duration-300 ${
        isElite
          ? `rounded-3xl p-6 ${eliteTheme.card}`
          : "rounded-3xl border-white/5 bg-white/[0.02] p-6 hover:border-white/10"
      }`}
    >
      <div className="flex w-full gap-4">
        <Link to={`/app/profile/${review.username}`} className="shrink-0 self-start">
          <div
            className={`h-14 w-14 overflow-hidden rounded-full ring-2 transition-transform duration-300 group-hover:scale-105 ${
              isElite ? "ring-white/20" : "bg-zinc-800 ring-zinc-900"
            }`}
          >
            {review.userPhoto ? (
              <img src={review.userPhoto} className="h-full w-full object-cover" alt="" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 font-bold text-zinc-300">
                {(review.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0 w-full space-y-2">
              {isElite && <div className={`h-1.5 w-14 rounded-full ${eliteTheme.accent}`} />}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/app/profile/${review.username}`}
                  className={`text-xl font-black transition-colors hover:text-violet-400 ${isElite ? "text-zinc-100" : "text-white"}`}
                >
                  @{review.username}
                </Link>
                <LevelBadge title={review.levelTitle} size="md" />
                {isElite && (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${eliteTheme.chip}`}>
                    <Pin size={12} /> Fixado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-500">
                <span>{formatCreatedAt(review.createdAt)}</span>
                {review.isEdited && <span>(editado)</span>}
                {reviewHasSpoiler && (
                  <button
                    type="button"
                    onClick={() => setReviewSpoilerDisabled((current) => !current)}
                    className="inline-flex items-center rounded-full border border-amber-400/15 bg-amber-400/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-200/90 transition-colors hover:border-amber-300/25 hover:bg-amber-300/10"
                  >
                    {reviewSpoilerDisabled ? "Ativar spoiler" : "Desativar spoiler"}
                  </button>
                )}
                {!isEditing && hasText && hasRating && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-zinc-900/70 px-2.5 py-1">
                    <Star size={12} className="fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-yellow-500">{review.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            </div>

            {isOwner && !isEditing && (
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl bg-white/5 p-2 text-zinc-500 shadow-sm transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(review.id)}
                  className="rounded-xl bg-white/5 p-2 text-zinc-500 shadow-sm transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="relative mb-4 w-full animate-in fade-in zoom-in space-y-4 rounded-2xl border border-white/10 bg-zinc-950/60 p-4 duration-200">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setEditRating(star)}>
                      <Star
                        size={18}
                        className={editRating && star <= editRating ? "fill-yellow-500 text-yellow-500" : "fill-zinc-800 text-zinc-700"}
                      />
                    </button>
                  ))}
                </div>
                {editRating !== null && (
                  <button
                    type="button"
                    onClick={() => setEditRating(null)}
                    className="ml-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white"
                  >
                    Remover nota
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <RichTextToolbar
                  inputRef={reviewEditorRef}
                  onChange={setEditReviewText}
                  allowFormatting={canUseRichFormatting}
                  allowSpoiler
                  allowEmoji
                  allowTemplates
                />
              </div>

              <MentionTextarea
                value={editReviewText}
                onChange={setEditReviewText}
                followingList={followingList}
                inputRefExternal={reviewEditorRef}
                className="min-h-[120px] w-full rounded-xl border border-white/5 bg-zinc-900 p-4 text-white focus:border-violet-500 focus:outline-none"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-400 transition-colors hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveReviewEdit}
                  className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-violet-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : !hasText && hasRating ? (
            <div className="mb-4 flex w-full flex-col gap-2 rounded-2xl border border-white/5 bg-zinc-950/60 p-5 shadow-inner">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={`${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700"} drop-shadow-md`}
                  />
                ))}
                <span className="ml-2 text-2xl font-bold text-white">{review.rating.toFixed(1)}</span>
              </div>
              <p className="pl-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Avaliação sem comentário</p>
            </div>
          ) : null}

          {hasText && !isEditing && (
            <div className={`mb-5 w-full break-words space-y-4 ${isElite ? `text-lg ${eliteTheme.text}` : "text-base text-zinc-200"}`}>
              <div>
                {renderRichText(displayText, reviewSpoilerDisabled)}
                {review.text.length > MAX_TEXT_LENGTH && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 inline-block text-sm font-bold text-violet-400 hover:text-violet-300"
                  >
                    {isExpanded ? "Ler menos" : "Ler mais"}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-6">
            <button
              onClick={() => onLike(review.id)}
              className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-500" : "text-zinc-500 hover:text-white"}`}
            >
              <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
              {review.likesCount > 0 && <span className="text-xs font-bold">{review.likesCount}</span>}
            </button>
            <button
              onClick={() => {
                if (isReplying && replyAnchorId === "review") {
                  resetReplyComposer();
                  return;
                }
                openReplyComposer(review.username, "review");
              }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-200"
            >
              <MessageCircle size={18} /> {isReplying && replyAnchorId === "review" ? "Cancelar" : "Responder"}
            </button>
          </div>

          {isReplying && replyAnchorId === "review" && renderReplyComposer()}

          {review.commentsCount > 0 && (
            <div className="mt-5 w-full">
              {!showReplies ? (
                <button onClick={handleShowReplies} className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-zinc-300">
                  <div className="h-[1px] w-8 bg-zinc-800" />
                  {isLoadingReplies ? <Loader2 size={12} className="animate-spin" /> : `Ver respostas (${review.commentsCount})`}
                </button>
              ) : (
                <div className="ml-2 animate-in slide-in-from-top-2 space-y-4 border-l-2 border-zinc-800/60 pl-5 pt-4">
                  {replyList.map((reply) => (
                    <div key={reply.id} className="group/reply w-full rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <div className="flex gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                          {reply.userPhoto ? (
                            <img src={reply.userPhoto} className="h-full w-full object-cover" alt="" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-zinc-500">
                              {reply.username.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link to={`/app/profile/${reply.username}`} className="text-sm font-bold text-zinc-100 hover:text-violet-400">
                                @{reply.username}
                              </Link>
                              <span className="text-[10px] text-zinc-600">
                                {reply.createdAt ? new Date(reply.createdAt._seconds * 1000).toLocaleDateString() : "agora"}
                              </span>
                              {reply.isEdited && <span className="text-[10px] italic text-zinc-600">(editado)</span>}
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
                            {reply.isOwner && editingReplyId !== reply.id && (
                              <div className="ml-4 flex shrink-0 items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingReplyId(reply.id);
                                    setEditReplyText(reply.text || "");
                                  }}
                                  className="rounded-lg bg-white/5 p-1.5 text-zinc-500 shadow-sm transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                                  title="Editar"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteComment(reply.id)}
                                  className="rounded-lg bg-white/5 p-1.5 text-zinc-500 shadow-sm transition-colors hover:bg-red-500/10 hover:text-red-400"
                                  title="Excluir"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingReplyId === reply.id ? (
                            <div className="mt-1 w-full animate-in fade-in zoom-in space-y-3 duration-200">
                              <div className="space-y-3">
                                <RichTextToolbar
                                  inputRef={editReplyRef}
                                  onChange={setEditReplyText}
                                  allowFormatting={canUseRichFormatting}
                                  allowSpoiler
                                  allowEmoji
                                  allowTemplates
                                />
                              </div>
                              <MentionTextarea
                                value={editReplyText}
                                onChange={setEditReplyText}
                                followingList={followingList}
                                inputRefExternal={editReplyRef}
                                maxLength={400}
                                className="min-h-[96px] w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-white focus:border-violet-500 focus:outline-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingReplyId(null)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-500 hover:text-white"
                                >
                                  <X size={14} /> Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveReplyEdit(reply.id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-green-500 hover:text-green-400"
                                >
                                  <Check size={14} /> Salvar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {reply.text ? (
                                <div className="break-words text-sm leading-relaxed text-zinc-300">
                                  {renderRichText(reply.text, disabledReplySpoilers[reply.id])}
                                </div>
                              ) : null}
                            </div>
                          )}

                          {editingReplyId !== reply.id && (
                            <div className="mt-3 flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isReplying && replyAnchorId === reply.id) {
                                    resetReplyComposer();
                                    return;
                                  }
                                  openReplyComposer(reply.username, reply.id);
                                }}
                                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-200"
                              >
                                <MessageCircle size={13} />
                                {isReplying && replyAnchorId === reply.id ? "Cancelar" : "Responder"}
                              </button>
                            </div>
                          )}

                          {isReplying && replyAnchorId === reply.id && renderReplyComposer()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowReplies(false)}
                    className="mt-2 text-[10px] font-bold uppercase text-zinc-600 hover:text-zinc-400"
                  >
                    Ocultar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
