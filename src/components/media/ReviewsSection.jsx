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
  Heart,
  Loader2,
  Zap,
  Eye,
  Flame
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LevelBadge from "../ui/LevelBadge";

export default function ReviewsSection({
  reviews = [],
  onPostReview,
  onReply,
  onDelete,
  onDeleteComment,
  onLike,
  onLoadReplies,
  isEliteUser
}) {
  const { user } = useAuth();

  const [generalRating, setGeneralRating] = useState(5);
  const [generalText, setGeneralText] = useState("");
  const [isPostingGeneral, setIsPostingGeneral] = useState(false);
  const [isFocusedGeneral, setIsFocusedGeneral] = useState(false);
  const [errorMsgGeneral, setErrorMsgGeneral] = useState(null);

  const [eliteRating, setEliteRating] = useState(5);
  const [eliteText, setEliteText] = useState("");
  const [isPostingElite, setIsPostingElite] = useState(false);
  const [errorMsgElite, setErrorMsgElite] = useState(null);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const validReviews = reviews.filter((r) => r.rating !== undefined);
    if (validReviews.length === 0) return null;
    const total = validReviews.reduce((acc, curr) => acc + Number(curr.rating), 0);
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

  const { topEliteReview, regularReviews } = useMemo(() => {
    if (typeof isEliteUser !== 'function') return { topEliteReview: null, regularReviews: reviews };
    const valid = reviews.filter(r => r.rating !== undefined);
    const eliteOnes = valid
      .filter(r => isEliteUser(r.levelTitle))
      .sort((a, b) => (a.createdAt?._seconds || 0) - (b.createdAt?._seconds || 0));
    const fixed = eliteOnes[0] || null;
    const others = valid.filter(r => r.id !== fixed?.id).sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));
    return { topEliteReview: fixed, regularReviews: others };
  }, [reviews, isEliteUser]);

  const userIsElite = typeof isEliteUser === 'function' && isEliteUser(user?.levelTitle);
  const showEliteInput = userIsElite && !topEliteReview;

  const getEliteHeaderInfo = (title) => {
    switch (title) {
      case "Divindade do Cinema": 
        return { 
          label: "Veredito da Divindade", 
          color: "text-cyan-400", 
          icon: <Eye size={20} className="animate-pulse" />,
          greeting: "Vossa Onipotência possui a primazia de selar o destino desta obra."
        };
      case "Entidade Cinematográfica": 
        return { 
          label: "Veredito da Entidade", 
          color: "text-purple-400", 
          icon: <Sparkles size={20} className="animate-pulse" />,
          greeting: "Sua essência transcende a tela; agracie-nos com seu veredito supremo."
        };
      case "Oráculo da Sétima Arte": 
        return { 
          label: "Veredito do Oráculo", 
          color: "text-emerald-400", 
          icon: <Zap size={20} className="animate-pulse" />,
          greeting: "As visões lhe foram dadas. É chegado o momento de manifestar a verdade."
        };
      case "Mestre da Crítica": 
        return { 
          label: "Veredito do Mestre", 
          color: "text-amber-500", 
          icon: <Crown size={20} className="animate-pulse" />,
          greeting: "Ilustre Mestre, vossa palavra detém a primazia do saber sobre este título."
        };
      default: 
        return { 
          label: "Veredito de Elite", 
          color: "text-zinc-400", 
          icon: <Trophy size={20} />,
          greeting: "Sua distinção lhe permite o destaque honroso nesta discussão."
        };
    }
  };

  const handleSubmitGeneral = async () => {
    if (!generalText.trim()) return;
    if (generalText.length < 5) { setErrorMsgGeneral("Mínimo de 5 caracteres."); return; }
    setIsPostingGeneral(true);
    try {
      await onPostReview(generalRating, generalText);
      setGeneralText("");
      setGeneralRating(5);
      setIsFocusedGeneral(false);
    } catch (error) { setErrorMsgGeneral("Erro ao publicar."); } finally { setIsPostingGeneral(false); }
  };

  const handleSubmitElite = async () => {
    if (!eliteText.trim()) return;
    if (eliteText.length < 10) { setErrorMsgElite("A análise deve ser mais detalhada."); return; }
    setIsPostingElite(true);
    try {
      await onPostReview(eliteRating, eliteText);
      setEliteText("");
      setEliteRating(5);
    } catch (error) { setErrorMsgElite("Erro ao publicar."); } finally { setIsPostingElite(false); }
  };

  return (
    <section className="max-w-5xl mx-auto py-8">
      {stats && (
        <div className="mb-10 bg-zinc-900/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-16 h-16 bg-zinc-800 rounded-2xl border border-white/10 shadow-lg">
              <span className="text-2xl font-bold text-white">{stats.average}</span>
              <Star size={12} className="text-yellow-500 fill-yellow-500 mt-1" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Média da Comunidade</h3>
              <p className="text-zinc-400 text-sm">Baseado em {stats.count} avaliações</p>
            </div>
          </div>
          <div className="flex-1 w-full md:max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-zinc-300 text-sm font-medium">
                <strong className="text-white">{Math.round((stats.distribution.positive / (stats.distribution.total || 1)) * 100)}%</strong> aprovam esta obra
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${(stats.distribution.positive / (stats.distribution.total || 1)) * 100}%` }} className="bg-green-500 h-full" />
              <div className="bg-zinc-700 h-full flex-1" />
            </div>
          </div>
        </div>
      )}

      {topEliteReview && (
        <div className="mb-16">
          <div className={`flex items-center gap-2 mb-4 px-2 ${getEliteHeaderInfo(topEliteReview.levelTitle).color}`}>
            {getEliteHeaderInfo(topEliteReview.levelTitle).icon}
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">{getEliteHeaderInfo(topEliteReview.levelTitle).label}</h2>
          </div>
          <ReviewItem
            review={topEliteReview}
            currentUser={user}
            onReply={onReply}
            onDelete={onDelete}
            onDeleteComment={onDeleteComment}
            onLike={onLike}
            onLoadReplies={onLoadReplies}
            isElite
          />
        </div>
      )}

      {showEliteInput && (
        <div className="mb-16 bg-gradient-to-r from-violet-900/20 to-transparent p-[1px] rounded-[32px]">
          <div className="bg-zinc-950/80 backdrop-blur-md rounded-[32px] p-8 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <LevelBadge title={user.levelTitle} size="md" />
              <span className="font-black italic text-xs text-zinc-400 tracking-wide">
                {getEliteHeaderInfo(user.levelTitle).greeting}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <textarea
                value={eliteText}
                onChange={(e) => { setEliteText(e.target.value); setErrorMsgElite(null); }}
                placeholder="Discorra sobre vossa percepção..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-violet-500/50 focus:outline-none resize-none text-lg min-h-[120px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setEliteRating(star)} className="hover:scale-125 transition-transform">
                      <Star size={20} className={star <= eliteRating ? "fill-violet-500 text-violet-500" : "fill-zinc-800 text-zinc-800"} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  {errorMsgElite && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errorMsgElite}</span>}
                  <button onClick={handleSubmitElite} disabled={!eliteText.trim() || isPostingElite} className="bg-violet-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg hover:bg-violet-500 flex items-center gap-2">
                    {isPostingElite ? "..." : "Manifestar Veredito"} <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 border-t border-white/5 pt-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Discussão Geral</h2>
        <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-sm font-bold border border-white/5">{regularReviews.length}</span>
      </div>

      <div className="flex gap-5 mb-12">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-zinc-800 ring-2 ring-zinc-950 overflow-hidden flex items-center justify-center text-white font-bold uppercase text-lg">
            {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : user?.username?.charAt(0).toUpperCase() || <User size={24} />}
          </div>
        </div>
        <div className="flex-1">
          <div className={`relative bg-zinc-900/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${isFocusedGeneral ? "border-violet-500/50 ring-1 ring-violet-500/30" : "border-white/10"}`}>
            {isFocusedGeneral && (
              <div className="px-5 pt-5 flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setGeneralRating(star)} className="hover:scale-125 transition-transform">
                      <Star size={20} className={star <= generalRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700"} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <textarea
              value={generalText}
              onChange={(e) => { setGeneralText(e.target.value); setErrorMsgGeneral(null); }}
              onFocus={() => setIsFocusedGeneral(true)}
              placeholder="O que tens a dizer?"
              className={`w-full bg-transparent text-zinc-100 px-5 py-4 focus:outline-none resize-none text-base ${isFocusedGeneral ? "min-h-[120px]" : "min-h-[64px]"}`}
            />
            {isFocusedGeneral && (
              <div className="flex justify-between items-center px-4 pb-4">
                <span className="text-xs text-zinc-500">{generalText.length}/1000</span>
                <div className="flex gap-2">
                  <button onClick={() => setIsFocusedGeneral(false)} className="px-4 py-2 text-sm font-bold text-zinc-400">Cancelar</button>
                  <button onClick={handleSubmitGeneral} disabled={!generalText.trim() || isPostingGeneral} className="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-bold">Publicar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {regularReviews.map((review, index) => (
          <div key={review.id} className={index !== regularReviews.length - 1 ? "border-b border-zinc-800/50 pb-10 mb-10" : ""}>
            <ReviewItem review={review} currentUser={user} onReply={onReply} onDelete={onDelete} onDeleteComment={onDeleteComment} onLike={onLike} onLoadReplies={onLoadReplies} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewItem({ review, currentUser, onReply, onDelete, onDeleteComment, onLike, onLoadReplies, isElite }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const replies = review.replies || [];
  const isLiked = !!review.isLikedByCurrentUser;
  const isOwner = currentUser?.uid === review.userId;

  const getEliteCardStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema": return "border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-cyan-500/10";
      case "Entidade Cinematográfica": return "border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)] ring-purple-500/10";
      case "Oráculo da Sétima Arte": return "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] ring-emerald-500/10";
      case "Mestre da Crítica": return "border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] ring-amber-500/10";
      default: return "border-violet-500/30 shadow-2xl ring-violet-500/10";
    }
  };

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
    try { await onReply(review.id, replyText); setReplyText(""); setIsReplying(false); setShowReplies(true); } catch (e) {}
  };

  return (
    <div className={`group rounded-3xl transition-all duration-500 ${isElite ? `p-8 bg-zinc-900 border ring-1 ${getEliteCardStyle(review.levelTitle)}` : "p-2"}`}>
      <div className="flex gap-5">
        <Link to={`/app/profile/${review.username}`} className="shrink-0">
          <div className={`w-14 h-14 rounded-full ring-2 overflow-hidden transition-transform duration-300 group-hover:scale-105 ${isElite ? "ring-white/20" : "bg-zinc-800 ring-zinc-950"}`}>
            {review.userPhoto ? <img src={review.userPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-300 font-bold">{(review.username || "U").charAt(0).toUpperCase()}</div>}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={`/app/profile/${review.username}`} className={`font-black text-lg transition-colors ${isElite ? "text-zinc-100 hover:text-white" : "text-white"}`}>@{review.username}</Link>
              <LevelBadge title={review.levelTitle} size="md" />
              <span className="text-zinc-600 text-xs font-medium">• {review.createdAt ? new Date(review.createdAt._seconds * 1000).toLocaleDateString() : "agora"}</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-zinc-800/50 ml-2">
                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold text-yellow-500">{review.rating.toFixed(1)}</span>
              </div>
            </div>
            {isOwner && <button onClick={() => onDelete(review.id)} className="text-zinc-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>}
          </div>
          <p className={`leading-relaxed mb-4 whitespace-pre-wrap ${isElite ? "text-xl text-white font-medium" : "text-lg text-zinc-200"}`}>{review.text}</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onLike(review.id)} className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}>
              <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
              {review.likesCount > 0 && <span className="text-xs font-bold">{review.likesCount}</span>}
            </button>
            <button onClick={() => setIsReplying(!isReplying)} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-200 uppercase tracking-widest">
              <MessageCircle size={18} /> Responder
            </button>
          </div>
          {isReplying && (
            <div className="flex gap-2 mt-4 animate-in slide-in-from-top-2">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Responder..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none" />
              <button onClick={handleSubmitReply} className="bg-violet-600 text-white p-2 rounded-xl hover:bg-violet-500 transition-colors"><Send size={18} /></button>
            </div>
          )}
          {review.commentsCount > 0 && (
            <div className="mt-4">
              {!showReplies ? (
                <button onClick={handleShowReplies} className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-zinc-300">
                  <div className="w-8 h-[1px] bg-zinc-800" />
                  {isLoadingReplies ? <Loader2 size={12} className="animate-spin" /> : `Ver respostas (${review.commentsCount})`}
                </button>
              ) : (
                <div className="space-y-4 pt-4 border-l-2 border-zinc-800/50 ml-2 pl-4">
                  {replies.map(reply => (
                    <div key={reply.id} className="flex gap-3 group/reply">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                        {reply.userPhoto ? <img src={reply.userPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">U</div>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/app/profile/${reply.username}`} className="font-bold text-zinc-200 text-sm hover:text-violet-400">@{reply.username}</Link>
                          <span className="text-[10px] text-zinc-600">{reply.createdAt ? new Date(reply.createdAt._seconds * 1000).toLocaleDateString() : "agora"}</span>
                        </div>
                        <p className="text-zinc-300 text-sm">{reply.text}</p>
                        {currentUser?.uid === reply.userId && (
                          <button onClick={() => onDeleteComment(reply.id)} className="text-[10px] text-zinc-600 hover:text-red-500 mt-1 opacity-0 group-hover/reply:opacity-100 uppercase font-bold">Excluir</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowReplies(false)} className="text-[10px] font-bold text-zinc-600 uppercase hover:text-zinc-400">Ocultar</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}