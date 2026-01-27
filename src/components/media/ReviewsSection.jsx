import { useState, useMemo } from "react";
import {
  Star,
  MessageCircle,
  Send,
  Trash2,
  User,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Crown,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ReviewsSection({
  reviews = [],
  onPostReview,
  onReply,
  onDelete,
  onDeleteComment,
  onLike
}) {
  const { user } = useAuth();

  const [generalRating, setGeneralRating] = useState(5);
  const [generalText, setGeneralText] = useState("");
  const [isPostingGeneral, setIsPostingGeneral] = useState(false);
  const [isFocusedGeneral, setIsFocusedGeneral] = useState(false);
  const [errorMsgGeneral, setErrorMsgGeneral] = useState(null);

  const [masterRating, setMasterRating] = useState(5);
  const [masterText, setMasterText] = useState("");
  const [isPostingMaster, setIsPostingMaster] = useState(false);
  const [errorMsgMaster, setErrorMsgMaster] = useState(null);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const validReviews = reviews.filter((r) => r.rating !== undefined);
    if (validReviews.length === 0) return null;
    const total = validReviews.reduce(
      (acc, curr) => acc + Number(curr.rating),
      0,
    );
    const avg = total / validReviews.length;
    return {
      average: avg.toFixed(1),
      count: validReviews.length,
      distribution: {
        positive: validReviews.filter((r) => r.rating >= 4).length,
        total: validReviews.length,
      },
    };
  }, [reviews]);

  const { topMasterReview, regularReviews } = useMemo(() => {
    const validReviews = (reviews || []).filter((r) => r.rating !== undefined);

    const sortedByDate = [...validReviews].sort(
      (a, b) => (a.createdAt?._seconds || 0) - (b.createdAt?._seconds || 0),
    );

    const masterReview = sortedByDate.find(
      (r) => r.levelTitle === "Mestre da Crítica",
    );

    const others = validReviews
      .filter((r) => r.id !== masterReview?.id)
      .sort((a, b) => {
        const weights = {
          "Mestre da Crítica": 3,
          Cinéfilo: 2,
          "Crítico Iniciante": 1,
          Espectador: 0,
        };
        const wA = weights[a.levelTitle] || 0;
        const wB = weights[b.levelTitle] || 0;
        if (wB !== wA) return wB - wA;
        return (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0);
      });

    return {
      topMasterReview: masterReview || null,
      regularReviews: others,
    };
  }, [reviews]);

  const isMasterCritic = user?.levelTitle === "Mestre da Crítica";
  const showMasterInput = isMasterCritic && !topMasterReview;

  const handleSubmitGeneral = async () => {
    if (!generalText.trim()) return;
    if (generalText.length < 5) {
      setErrorMsgGeneral("Mínimo de 5 caracteres.");
      return;
    }

    setIsPostingGeneral(true);
    setErrorMsgGeneral(null);
    try {
      await onPostReview(generalRating, generalText);
      setGeneralText("");
      setGeneralRating(5);
      setIsFocusedGeneral(false);
    } catch (error) {
      setErrorMsgGeneral("Erro ao publicar.");
    } finally {
      setIsPostingGeneral(false);
    }
  };

  const handleSubmitMaster = async () => {
    if (!masterText.trim()) return;
    if (masterText.length < 10) {
      setErrorMsgMaster("A análise do mestre deve ser mais detalhada.");
      return;
    }

    setIsPostingMaster(true);
    setErrorMsgMaster(null);
    try {
      await onPostReview(masterRating, masterText);
      setMasterText("");
      setMasterRating(5);
    } catch (error) {
      setErrorMsgMaster("Erro ao publicar veredito.");
    } finally {
      setIsPostingMaster(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto py-8">
      {stats && (
        <div className="mb-10 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-16 h-16 bg-zinc-800 rounded-2xl border border-white/10 shadow-lg">
              <span className="text-2xl font-bold text-white">
                {stats.average}
              </span>
              <Star
                size={12}
                className="text-yellow-500 fill-yellow-500 mt-1"
              />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                Média da Comunidade
              </h3>
              <p className="text-zinc-400 text-sm">
                Baseado em {stats.count} avaliações
              </p>
            </div>
          </div>
          <div className="flex-1 w-full md:max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-zinc-300 text-sm font-medium">
                <strong className="text-white">
                  {Math.round(
                    (stats.distribution.positive /
                      (stats.distribution.total || 1)) *
                      100,
                  )}
                  %
                </strong>{" "}
                aprovam esta obra
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${(stats.distribution.positive / (stats.distribution.total || 1)) * 100}%`,
                }}
                className="bg-green-500 h-full"
              />
              <div className="bg-zinc-700 h-full flex-1" />
            </div>
          </div>
        </div>
      )}

      {topMasterReview && (
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-amber-500 mb-4 px-2">
            <Crown size={20} className="fill-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">
              Crítica do Mestre
            </h2>
          </div>
          <ReviewItem
            review={topMasterReview}
            currentUser={user}
            onReply={onReply}
            onDelete={onDelete}
            onDeleteComment={onDeleteComment}
            onLike={onLike}
            isMaster
          />
        </div>
      )}

      {showMasterInput && (
        <div className="mb-16 bg-gradient-to-r from-amber-900/20 to-transparent p-[1px] rounded-[32px] animate-in fade-in zoom-in-95">
          <div className="bg-zinc-950/80 backdrop-blur-md rounded-[32px] p-8 border border-amber-500/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 text-amber-500">
              <Sparkles size={20} />
              <span className="font-black uppercase tracking-widest text-xs">
                Área Exclusiva: Mestre da Crítica
              </span>
            </div>
            <div className="flex gap-6">
              <div className="shrink-0">
                <div className="w-14 h-14 rounded-full bg-zinc-800 ring-2 ring-amber-500 overflow-hidden shadow-lg flex items-center justify-center text-amber-500 font-bold text-xl uppercase">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      className="w-full h-full object-cover"
                      alt="Me"
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || (
                      <User size={24} />
                    )
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 bg-zinc-900/50 w-fit px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-xs text-zinc-400 font-bold uppercase mr-2">
                    Veredito:
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMasterRating(star)}
                      className="hover:scale-125 transition-transform focus:outline-none active:scale-90"
                    >
                      <Star
                        size={20}
                        className={`transition-colors duration-200 ${star <= masterRating ? "fill-amber-500 text-amber-500" : "fill-zinc-800 text-zinc-800"}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={masterText}
                  onChange={(e) => {
                    setMasterText(e.target.value);
                    setErrorMsgMaster(null);
                  }}
                  maxLength={2000}
                  placeholder="Escreva sua análise definitiva sobre a obra..."
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-amber-500/50 focus:outline-none resize-none text-lg min-h-[150px] placeholder:text-zinc-600"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-600">
                    {masterText.length}/2000
                  </span>
                  {errorMsgMaster && (
                    <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errorMsgMaster}
                    </span>
                  )}
                  <button
                    onClick={handleSubmitMaster}
                    disabled={!masterText.trim() || isPostingMaster}
                    className="bg-amber-600 hover:bg-amber-500 text-black px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-amber-900/20 active:scale-95 flex items-center gap-2"
                  >
                    {isPostingMaster ? "Enviando..." : "Publicar Veredito"}{" "}
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 border-t border-white/5 pt-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Discussão Geral
        </h2>
        <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-sm font-bold border border-white/5">
          {reviews?.length || 0}
        </span>
      </div>

      <div className="flex gap-5 mb-12 group">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-zinc-800 ring-2 ring-zinc-950 overflow-hidden shadow-lg flex items-center justify-center text-white font-bold uppercase text-lg">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                className="w-full h-full object-cover"
                alt="Me"
              />
            ) : (
              user?.username?.charAt(0).toUpperCase() || <User size={24} />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div
            className={`relative bg-zinc-900/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${isFocusedGeneral ? "border-violet-500/50 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/30" : "border-white/10 hover:border-white/20"} ${errorMsgGeneral ? "border-red-500/50 ring-1 ring-red-500/20" : ""}`}
          >
            <div
              className={`overflow-hidden transition-all duration-300 ${isFocusedGeneral ? "max-h-14 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="px-5 pt-5 flex items-center gap-3">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider bg-zinc-800/50 px-2 py-1 rounded">
                  Sua Nota
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setGeneralRating(star)}
                      className="p-0.5 hover:scale-125 transition-transform focus:outline-none active:scale-90"
                    >
                      <Star
                        size={20}
                        className={`transition-colors duration-200 ${star <= generalRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <textarea
              value={generalText}
              onChange={(e) => {
                setGeneralText(e.target.value);
                setErrorMsgGeneral(null);
              }}
              onFocus={() => setIsFocusedGeneral(true)}
              maxLength={1000}
              placeholder="Compartilhe sua opinião..."
              className={`w-full bg-transparent text-zinc-100 px-5 py-4 focus:outline-none resize-none text-base leading-relaxed placeholder:text-zinc-500 transition-all ${isFocusedGeneral ? "min-h-[120px]" : "min-h-[64px]"}`}
            />
            <div
              className={`flex justify-between items-center gap-3 px-4 pb-4 transition-all duration-300 ${isFocusedGeneral ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 h-0 overflow-hidden"}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${generalText.length > 450 ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-500"}`}
                >
                  {generalText.length}/1000
                </span>
                {errorMsgGeneral && (
                  <span className="text-xs text-red-400 flex items-center gap-1 font-medium animate-in fade-in">
                    <AlertCircle size={12} /> {errorMsgGeneral}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFocusedGeneral(false)}
                  className="px-5 py-2 text-sm font-bold text-zinc-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitGeneral}
                  disabled={!generalText.trim() || isPostingGeneral}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg active:scale-95"
                >
                  {isPostingGeneral ? "..." : "Publicar"} <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {regularReviews.map((review, index) => (
          <div
            key={review.id}
            className={
              index !== regularReviews.length - 1
                ? "border-b border-zinc-800/50 pb-10 mb-10"
                : ""
            }
          >
            <ReviewItem
              review={review}
              currentUser={user}
              onReply={onReply}
              onDelete={onDelete}
              onDeleteComment={onDeleteComment}
              onLike={onLike}
            />
          </div>
        ))}
        {regularReviews.length === 0 && !topMasterReview && (
          <div className="py-20 text-center bg-zinc-900/30 rounded-3xl border border-white/5 border-dashed">
            <MessageCircle className="mx-auto text-zinc-700 mb-4" size={56} />
            <p className="text-zinc-400 font-medium text-lg">
              Ainda não há comentários.
            </p>
            <p className="text-zinc-600 text-base mt-2">
              Seja a primeira pessoa a compartilhar o que achou!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewItem({
  review,
  currentUser,
  onReply,
  onDelete,
  onDeleteComment,
  onLike,
  isMaster,
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [visibleReplies, setVisibleReplies] = useState(3);
  const [showReplies, setShowReplies] = useState(true);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const replies = review.replies || [];
  const displayedReplies = replies.slice(0, visibleReplies);
  const isLiked = !!review.isLikedByCurrentUser;

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike(review.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleSubmitReply = async (targetUser = null) => {
    if (!replyText.trim()) return;

    const textToSend = targetUser ? `@${targetUser} ${replyText}` : replyText;

    try {
      await onReply(review.id, textToSend);
      setReplyText("");
      setIsReplying(false);
      setErrorMsg(null);
      setVisibleReplies((prev) => prev + 1);
      setShowReplies(true);
    } catch (e) {
      setErrorMsg(e.response?.data?.message || "Erro ao responder.");
    }
  };

  const isOwner = currentUser?.uid === review.userId;
  const profileLink = `/app/profile/${review.username}`;

  return (
    <div
      className={`group animate-in fade-in duration-500 rounded-3xl transition-all ${isMaster ? "p-8 bg-zinc-900 border border-amber-500/30 shadow-2xl shadow-amber-500/5 ring-1 ring-amber-500/10" : "p-2"}`}
    >
      <div className="flex gap-5">
        <Link to={profileLink} className="shrink-0 relative group/avatar">
          <div
            className={`w-14 h-14 rounded-full ring-2 overflow-hidden transition-all group-hover/avatar:scale-105 ${isMaster ? "ring-amber-500 shadow-lg shadow-amber-500/20" : "bg-zinc-800 ring-zinc-950"}`}
          >
            {review.userPhoto ? (
              <img
                src={review.userPhoto}
                className="w-full h-full object-cover"
                alt="User"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-300 font-bold text-xl select-none border border-white/5">
                {(review.username || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isMaster && (
            <div className="absolute -top-1 -right-1 bg-amber-500 text-black p-1 rounded-full shadow-lg">
              <Trophy size={10} fill="currentColor" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to={profileLink}
                className={`font-black text-lg transition-colors truncate ${isMaster ? "text-amber-500 hover:text-amber-400" : "text-white hover:text-violet-400"}`}
              >
                @{review.username}
                {isMaster && (
                  <Trophy
                    size={14}
                    className="fill-amber-500 inline-block ml-1"
                  />
                )}
              </Link>
              <span
                className={`text-xs font-black uppercase px-2.5 py-0.5 rounded border ${isMaster ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-white/5 text-zinc-500 border-white/5"}`}
              >
                {review.levelTitle || "Espectador"}
              </span>
              <span className="text-zinc-600 text-xs font-medium">
                •{" "}
                {review.createdAt
                  ? new Date(
                      review.createdAt._seconds * 1000,
                    ).toLocaleDateString()
                  : "agora"}
              </span>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ml-2 ${isMaster ? "bg-amber-500/10 border-amber-500/20" : "bg-zinc-800/50 border-white/5"}`}
              >
                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                <span
                  className={`text-xs font-bold ${isMaster ? "text-amber-500" : "text-yellow-500"}`}
                >
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={() => onDelete(review.id)}
                className="text-zinc-600 hover:text-red-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <p
            className={`leading-relaxed mb-4 whitespace-pre-wrap font-normal ${isMaster ? "text-lg text-white" : "text-lg text-zinc-200"}`}
          >
            {review.text}
          </p>

          <div className="flex items-center gap-6 mb-6">
            <button
                onClick={handleLikeClick}
                className={`flex items-center gap-2 transition-all duration-200 group ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-white'} ${isLikeAnimating ? 'scale-125' : 'scale-100'}`}
            >
                <Heart size={18} className={isLiked ? "fill-red-500" : "group-hover:scale-110 transition-transform"} />
                {(review.likesCount > 0) && (
                    <span className="text-xs font-bold">{review.likesCount}</span>
                )}
            </button>

            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-200 transition-colors tracking-widest uppercase"
            >
              <MessageCircle size={18} /> Responder
            </button>
          </div>

          {isReplying && (
            <div className="flex flex-col gap-2 mb-6 animate-in slide-in-from-top-2">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Adicionar resposta..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
                  autoFocus
                />
                <button
                  onClick={() => handleSubmitReply()}
                  className="bg-violet-600 text-white p-3 rounded-xl hover:bg-violet-500 shadow-lg"
                >
                  <Send size={18} />
                </button>
              </div>
              {errorMsg && (
                <span className="text-sm text-red-500 font-bold">
                  {errorMsg}
                </span>
              )}
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-4">
              {!showReplies ? (
                <button
                  onClick={() => setShowReplies(true)}
                  className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-zinc-300"
                >
                  <div className="w-8 h-[1px] bg-zinc-800" /> Ver respostas (
                  {replies.length})
                </button>
              ) : (
                <>
                  <div className="space-y-6 pt-4 border-l-2 border-zinc-800/50 ml-2">
                    {displayedReplies.map((reply) => (
                      <ReplyItem
                        key={reply.id}
                        reply={reply}
                        reviewId={review.id}
                        onReply={onReply}
                        currentUser={currentUser}
                        onDeleteComment={onDeleteComment}
                        onReplyClick={() => {
                          setIsReplying(true);
                          setReplyText(`@${reply.username} `);
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pl-8 pt-4">
                    {visibleReplies < replies.length && (
                      <button
                        onClick={() => setVisibleReplies((prev) => prev + 3)}
                        className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 bg-violet-500/10 px-3 py-1.5 rounded-lg hover:bg-violet-500/20"
                      >
                        <ChevronDown size={14} /> Ver mais respostas (
                        {replies.length - visibleReplies})
                      </button>
                    )}
                    <button
                      onClick={() => setShowReplies(false)}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 hover:bg-white/5 px-3 py-1.5 rounded-lg"
                    >
                      <ChevronUp size={14} /> Ocultar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyItem({
  reply,
  reviewId,
  onReply,
  currentUser,
  onDeleteComment,
  onReplyClick,
}) {
  const isOwner = currentUser?.uid === reply.userId;

  return (
    <div className="flex gap-3 pl-6 animate-in fade-in group/reply">
      <div className="shrink-0 pt-1">
        <div className="w-9 h-9 rounded-full bg-zinc-800 ring-1 ring-zinc-900 overflow-hidden flex items-center justify-center text-white font-bold text-xs uppercase">
          {reply.userPhoto ? (
            <img
              src={reply.userPhoto}
              className="w-full h-full object-cover"
              alt="U"
            />
          ) : (
            reply.username?.charAt(0) || "U"
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Link
            to={`/app/profile/${reply.username}`}
            className="font-bold text-zinc-200 text-sm hover:text-violet-400 transition-colors"
          >
            {reply.username}
          </Link>
          <span className="text-[10px] font-black uppercase text-zinc-500 px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
            {reply.levelTitle || "Espectador"}
          </span>
          <span className="text-[10px] text-zinc-600 font-medium">
            {reply.createdAt
              ? new Date(reply.createdAt._seconds * 1000).toLocaleDateString()
              : "agora"}
          </span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{reply.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={onReplyClick}
            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-200 uppercase tracking-widest transition-colors"
          >
            Responder
          </button>
          {isOwner && (
            <button
              onClick={() => onDeleteComment(reply.id)}
              className="text-[10px] font-bold text-zinc-500 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors opacity-0 group-hover/reply:opacity-100"
            >
              <Trash2 size={12} /> Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}