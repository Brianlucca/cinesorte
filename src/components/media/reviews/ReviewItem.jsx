import { useState } from "react";
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
} from "lucide-react";
import { Link } from "react-router-dom";
import LevelBadge from "../../ui/LevelBadge";
import { MentionTextarea } from "./MentionTextarea";
import { MentionInputField } from "./MentionInputField";

function renderTextWithMentions(text) {
  if (!text) return null;
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) => {
    if (/^@[a-zA-Z0-9_]+$/.test(part)) {
      return (
        <Link
          key={i}
          to={`/app/profile/${part.slice(1)}`}
          className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

const ELITE_CARD_STYLES = {
  "Divindade do Cinema": "border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-cyan-500/10",
  "Entidade Cinematográfica": "border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-purple-500/10",
  "Oráculo da Sétima Arte": "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] ring-emerald-500/10",
  "Mestre da Crítica": "border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-amber-500/10",
};

const MAX_TEXT_LENGTH = 100;

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
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editReviewText, setEditReviewText] = useState(review.text || "");
  const [editRating, setEditRating] = useState(review.rating ?? null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const replies = review.replies || [];
  const isLiked = !!review.isLikedByCurrentUser;
  const isOwner = !!review.isOwner;
  const hasText = review.text && review.text.trim().length > 0;
  const hasRating = review.rating !== null && review.rating !== undefined;

  const eliteStyle = ELITE_CARD_STYLES[review.levelTitle] || "border-violet-500/30 shadow-2xl ring-violet-500/10";

  const displayText = hasText
    ? isExpanded || review.text.length <= MAX_TEXT_LENGTH
      ? review.text
      : review.text.slice(0, MAX_TEXT_LENGTH)
    : null;

  const handleShowReplies = async () => {
    if (replies.length === 0 && review.commentsCount > 0) {
      setIsLoadingReplies(true);
      await onLoadReplies(review.id);
      setIsLoadingReplies(false);
    }
    setShowReplies(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    try {
      await onReply(review.id, replyText);
      setReplyText("");
      setIsReplying(false);
      setShowReplies(true);
    } catch (e) {}
  };

  const handleSaveReviewEdit = async () => {
    try {
      if (onEditReview) await onEditReview(review.id, editReviewText, editRating);
      setIsEditing(false);
    } catch (e) {}
  };

  const handleSaveReplyEdit = async (commentId) => {
    try {
      if (onEditReply) await onEditReply(commentId, editReplyText, review.id);
      setEditingReplyId(null);
    } catch (e) {}
  };

  return (
    <div
      className={`group rounded-3xl transition-all duration-500 w-full ${
        isElite
          ? `p-8 bg-zinc-900 border ring-1 ${eliteStyle}`
          : "p-2"
      }`}
    >
      <div className="flex gap-5 w-full">
        <Link to={`/app/profile/${review.username}`} className="shrink-0">
          <div
            className={`w-14 h-14 rounded-full ring-2 overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
              isElite ? "ring-white/20" : "bg-zinc-800 ring-zinc-950"
            }`}
          >
            {review.userPhoto ? (
              <img src={review.userPhoto} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-300 font-bold">
                {(review.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={`/app/profile/${review.username}`}
                className={`font-black text-lg transition-colors ${isElite ? "text-zinc-100 hover:text-white" : "text-white"}`}
              >
                @{review.username}
              </Link>
              <LevelBadge title={review.levelTitle} size="md" />
              <span className="text-zinc-600 text-xs font-medium">
                • {review.createdAt ? new Date(review.createdAt._seconds * 1000).toLocaleDateString() : "agora"}
              </span>
              {review.isEdited && <span className="text-zinc-600 text-xs italic">(editado)</span>}
              {!isEditing && hasText && hasRating && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-zinc-800/50 ml-2">
                  <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500">{review.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {isOwner && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-zinc-500 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 transition-colors p-2 rounded-xl shadow-sm"
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(review.id)}
                  className="text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors p-2 rounded-xl shadow-sm"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="relative bg-zinc-950/50 p-4 rounded-xl border border-white/10 mb-4 animate-in fade-in zoom-in duration-200 w-full">
              <div className="flex gap-2 mb-3 items-center">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setEditRating(star)}>
                      <Star
                        size={18}
                        className={editRating && star <= editRating ? "fill-yellow-500 text-yellow-500" : "fill-zinc-800 text-zinc-700"}
                      />
                    </button>
                  ))}
                </div>
                {editRating !== null && (
                  <button
                    onClick={() => setEditRating(null)}
                    className="ml-4 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider"
                  >
                    Remover Nota
                  </button>
                )}
              </div>
              <MentionTextarea
                value={editReviewText}
                onChange={setEditReviewText}
                followingList={followingList}
                className="w-full bg-zinc-900 text-white p-3 rounded-lg border border-white/5 focus:outline-none focus:border-violet-500 min-h-[100px]"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-zinc-400 text-xs font-bold hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveReviewEdit}
                  className="bg-violet-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-500 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : !hasText && hasRating ? (
            <div className="flex flex-col gap-2 bg-zinc-900/50 p-4 rounded-xl border border-white/5 shadow-inner mb-4 w-full">
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
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider pl-1">Avaliação sem comentário</p>
            </div>
          ) : hasText ? (
            <div
              className={`leading-relaxed mb-4 whitespace-pre-wrap break-words w-full ${
                isElite ? "text-xl text-white font-medium" : "text-lg text-zinc-200"
              }`}
            >
              {renderTextWithMentions(displayText)}
              {!isExpanded && review.text.length > MAX_TEXT_LENGTH && "..."}
              {review.text.length > MAX_TEXT_LENGTH && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-violet-400 hover:text-violet-300 font-bold ml-1 text-sm inline-block"
                >
                  {isExpanded ? "Ler menos" : "Ler mais"}
                </button>
              )}
            </div>
          ) : null}

          <div className="flex items-center gap-6">
            <button
              onClick={() => onLike(review.id)}
              className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-500" : "text-zinc-500 hover:text-white"}`}
            >
              <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
              {review.likesCount > 0 && <span className="text-xs font-bold">{review.likesCount}</span>}
            </button>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-200 uppercase tracking-widest"
            >
              <MessageCircle size={18} /> Responder
            </button>
          </div>

          {isReplying && (
            <div className="relative flex gap-2 mt-4 animate-in slide-in-from-top-2 w-full">
              <MentionInputField
                value={replyText}
                onChange={setReplyText}
                followingList={followingList}
                placeholder="Escreva sua resposta..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors"
                onSubmit={handleSubmitReply}
              />
              <button
                onClick={handleSubmitReply}
                className="bg-violet-600 text-white p-2 rounded-xl hover:bg-violet-500 transition-colors h-[42px] mt-0.5"
              >
                <Send size={18} />
              </button>
            </div>
          )}

          {review.commentsCount > 0 && (
            <div className="mt-4 w-full">
              {!showReplies ? (
                <button
                  onClick={handleShowReplies}
                  className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-zinc-300"
                >
                  <div className="w-8 h-[1px] bg-zinc-800" />
                  {isLoadingReplies ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    `Ver respostas (${review.commentsCount})`
                  )}
                </button>
              ) : (
                <div className="space-y-4 pt-4 border-l-2 border-zinc-800/50 ml-2 pl-4 animate-in slide-in-from-top-2">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 group/reply w-full">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                        {reply.userPhoto ? (
                          <img src={reply.userPhoto} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase">
                            {reply.username.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/app/profile/${reply.username}`}
                              className="font-bold text-zinc-200 text-sm hover:text-violet-400"
                            >
                              @{reply.username}
                            </Link>
                            <span className="text-[10px] text-zinc-600">
                              {reply.createdAt
                                ? new Date(reply.createdAt._seconds * 1000).toLocaleDateString()
                                : "agora"}
                            </span>
                            {reply.isEdited && (
                              <span className="text-[10px] text-zinc-600 italic">(editado)</span>
                            )}
                          </div>
                          {reply.isOwner && editingReplyId !== reply.id && (
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingReplyId(reply.id);
                                  setEditReplyText(reply.text);
                                }}
                                className="text-zinc-500 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 transition-colors p-1.5 rounded-lg shadow-sm"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => onDeleteComment(reply.id)}
                                className="text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors p-1.5 rounded-lg shadow-sm"
                                title="Excluir"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingReplyId === reply.id ? (
                          <div className="relative mt-1 animate-in fade-in zoom-in duration-200 w-full">
                            <MentionInputField
                              value={editReplyText}
                              onChange={setEditReplyText}
                              followingList={followingList}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 mb-2"
                              onSubmit={() => handleSaveReplyEdit(reply.id)}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingReplyId(null)}
                                className="text-[10px] text-zinc-500 font-bold uppercase hover:text-white"
                              >
                                <X size={14} />
                              </button>
                              <button
                                onClick={() => handleSaveReplyEdit(reply.id)}
                                className="text-[10px] text-green-500 font-bold uppercase hover:text-green-400"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-300 text-sm break-words">
                            {renderTextWithMentions(reply.text)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowReplies(false)}
                    className="text-[10px] font-bold text-zinc-600 uppercase hover:text-zinc-400 mt-2"
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