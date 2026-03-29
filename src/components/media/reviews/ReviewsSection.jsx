import { useState, useMemo } from "react";
import { Star, User, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { MentionTextarea } from "./MentionTextarea";
import ReviewItem from "./ReviewItem";

export default function ReviewsSection({
  reviews = [],
  onPostReview,
  onReply,
  onDelete,
  onDeleteComment,
  onLike,
  onLoadReplies,
  onEditReview,
  onEditReply,
  isEliteUser,
  user: propUser,
  followingList = [],
}) {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser;

  const [generalRating, setGeneralRating] = useState(null);
  const [generalText, setGeneralText] = useState("");
  const [isPostingGeneral, setIsPostingGeneral] = useState(false);
  const [isFocusedGeneral, setIsFocusedGeneral] = useState(false);
  const [errorMsgGeneral, setErrorMsgGeneral] = useState(null);

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const valid = reviews.filter((r) => r.rating !== undefined && r.rating !== null);
    if (valid.length === 0) return null;
    const total = valid.reduce((acc, r) => acc + Number(r.rating), 0);
    const avg = total / valid.length;
    return {
      average: avg.toFixed(1),
      count: valid.length,
      positivePercent: Math.round((valid.filter((r) => r.rating >= 4).length / valid.length) * 100),
    };
  }, [reviews]);

  const { topEliteReview, regularReviews } = useMemo(() => {
    if (typeof isEliteUser !== "function") return { topEliteReview: null, regularReviews: reviews };
    const valid = reviews.filter((r) => r.rating !== undefined && r.rating !== null);
    const eliteOnes = valid
      .filter((r) => isEliteUser(r.levelTitle))
      .sort((a, b) => (a.createdAt?._seconds || 0) - (b.createdAt?._seconds || 0));
    const fixed = eliteOnes[0] || null;
    const others = reviews
      .filter((r) => r.id !== fixed?.id)
      .sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));
    return { topEliteReview: fixed, regularReviews: others };
  }, [reviews, isEliteUser]);

  const handleSubmitGeneral = async () => {
    if (generalRating === null && generalText.trim().length === 0) {
      setErrorMsgGeneral("Por favor, adicione um comentário ou uma nota.");
      return;
    }
    if (generalText.trim().length > 0 && generalText.trim().length < 3) {
      setErrorMsgGeneral("Mínimo de 3 caracteres.");
      return;
    }
    setIsPostingGeneral(true);
    try {
      await onPostReview(generalRating, generalText);
      setGeneralText("");
      setGeneralRating(null);
      setIsFocusedGeneral(false);
    } catch {
      setErrorMsgGeneral("Erro ao publicar.");
    } finally {
      setIsPostingGeneral(false);
    }
  };

  const reviewItemProps = { onReply, onDelete, onDeleteComment, onLike, onLoadReplies, onEditReview, onEditReply, followingList };

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
                <strong className="text-white">{stats.positivePercent}%</strong> aprovam esta obra
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${stats.positivePercent}%` }} className="bg-green-500 h-full" />
              <div className="bg-zinc-700 h-full flex-1" />
            </div>
          </div>
        </div>
      )}

      {topEliteReview && (
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4 px-2 text-violet-400">
            <Trophy size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Veredito em Destaque</h2>
          </div>
          <ReviewItem review={topEliteReview} isElite {...reviewItemProps} />
        </div>
      )}

      <div className="flex items-center gap-3 mb-8 border-t border-white/5 pt-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Discussão Geral</h2>
        <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-sm font-bold border border-white/5">
          {regularReviews.length}
        </span>
      </div>

      <div className="flex gap-5 mb-12">
        <div className="shrink-0">
          <div className="w-12 h-12 rounded-full bg-zinc-800 ring-2 ring-zinc-950 overflow-hidden flex items-center justify-center text-white font-bold uppercase text-lg">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || <User size={24} />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div
            className={`relative bg-zinc-900/80 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${
              isFocusedGeneral ? "border-violet-500/50 ring-1 ring-violet-500/30 z-[100]" : "border-white/10 z-10"
            }`}
          >
            {isFocusedGeneral && (
              <div className="px-5 pt-5 flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setGeneralRating(star)} className="hover:scale-125 transition-transform">
                      <Star
                        size={20}
                        className={generalRating && star <= generalRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700"}
                      />
                    </button>
                  ))}
                </div>
                {generalRating !== null && (
                  <button
                    onClick={() => setGeneralRating(null)}
                    className="ml-2 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-wider"
                  >
                    Remover Nota
                  </button>
                )}
              </div>
            )}

            <MentionTextarea
              value={generalText}
              onChange={(val) => { setGeneralText(val); setErrorMsgGeneral(null); }}
              followingList={followingList}
              onFocus={() => setIsFocusedGeneral(true)}
              placeholder="Escreva o que achou... (ou deixe em branco para enviar apenas a nota)"
              className={`w-full bg-transparent text-zinc-100 px-5 py-4 focus:outline-none resize-none text-base ${
                isFocusedGeneral ? "min-h-[120px]" : "min-h-[64px]"
              }`}
            />

            {isFocusedGeneral && (
              <div className="flex flex-col px-4 pb-4">
                {errorMsgGeneral && (
                  <span className="text-red-500 text-xs font-bold mb-2 ml-1">{errorMsgGeneral}</span>
                )}
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-zinc-500">{generalText.length}/500</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFocusedGeneral(false)}
                      className="px-4 py-2 text-sm font-bold text-zinc-400"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitGeneral}
                      disabled={isPostingGeneral}
                      className="bg-violet-600 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      Publicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {regularReviews.map((review, index) => (
          <div
            key={review.id}
            className={index !== regularReviews.length - 1 ? "border-b border-zinc-800/50 pb-10 mb-10" : ""}
          >
            <ReviewItem review={review} {...reviewItemProps} />
          </div>
        ))}
      </div>
    </section>
  );
}