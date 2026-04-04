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
    <div className="w-full">
      {stats && (
        <div className="mb-10 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center justify-center w-20 h-20 bg-zinc-900 rounded-2xl border border-white/5 shadow-inner">
              <span className="text-3xl font-black text-white">{stats.average}</span>
              <div className="flex mt-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Média da Comunidade</h3>
              <p className="text-zinc-400 text-sm font-medium">Baseado em {stats.count} avaliações</p>
            </div>
          </div>
          <div className="flex-1 w-full md:max-w-md bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={18} className="text-green-500" />
              <span className="text-zinc-300 text-sm font-medium">
                <strong className="text-white text-base">{stats.positivePercent}%</strong> aprovam esta obra
              </span>
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${stats.positivePercent}%` }} className="bg-green-500 h-full transition-all duration-1000" />
              <div className="bg-transparent h-full flex-1" />
            </div>
          </div>
        </div>
      )}

      {topEliteReview && (
        <div className="mb-12 bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-3xl rounded-full"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-500/20 rounded-xl text-violet-400">
              <Trophy size={20} />
            </div>
            <h2 className="text-sm font-black text-violet-400 uppercase tracking-[0.2em]">Veredito em Destaque</h2>
          </div>
          <ReviewItem review={topEliteReview} isElite {...reviewItemProps} />
        </div>
      )}

      <div className="flex gap-5 mb-12">
        <div className="shrink-0 hidden sm:block">
          <div className="w-14 h-14 rounded-full bg-zinc-800 ring-4 ring-zinc-900 overflow-hidden flex items-center justify-center text-white font-bold uppercase text-xl shadow-lg">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || <User size={24} />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div
            className={`relative bg-zinc-900/50 backdrop-blur-md border rounded-2xl transition-all duration-300 ${
              isFocusedGeneral ? "border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] z-[100]" : "border-white/10 hover:border-white/20 z-10"
            }`}
          >
            {isFocusedGeneral && (
              <div className="px-5 pt-5 flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-zinc-400">Sua nota:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setGeneralRating(star)} className="hover:scale-110 transition-transform focus:outline-none">
                      <Star
                        size={24}
                        className={generalRating && star <= generalRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700 hover:text-zinc-500"}
                      />
                    </button>
                  ))}
                </div>
                {generalRating !== null && (
                  <button
                    onClick={() => setGeneralRating(null)}
                    className="ml-auto text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}

            <MentionTextarea
              value={generalText}
              onChange={(val) => { setGeneralText(val); setErrorMsgGeneral(null); }}
              followingList={followingList}
              onFocus={() => setIsFocusedGeneral(true)}
              placeholder="Escreva sua avaliação sobre a obra..."
              className={`w-full bg-transparent text-zinc-100 px-6 py-5 focus:outline-none resize-none text-base placeholder:text-zinc-600 ${
                isFocusedGeneral ? "min-h-[140px]" : "min-h-[60px]"
              }`}
            />

            {isFocusedGeneral && (
              <div className="flex flex-col px-5 pb-5">
                {errorMsgGeneral && (
                  <span className="text-red-400 text-sm font-medium mb-3">{errorMsgGeneral}</span>
                )}
                <div className="flex justify-between items-center w-full">
                  <span className={`text-xs font-medium ${generalText.length > 450 ? 'text-yellow-500' : 'text-zinc-500'}`}>
                    {generalText.length}/500
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFocusedGeneral(false)}
                      className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitGeneral}
                      disabled={isPostingGeneral}
                      className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-lg"
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

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          Comentários Recentes
          <span className="bg-white/10 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold">
            {regularReviews.length}
          </span>
        </h3>
        
        {regularReviews.map((review, index) => (
          <div
            key={review.id}
            className={index !== regularReviews.length - 1 ? "border-b border-white/5 pb-8 mb-8" : ""}
          >
            <ReviewItem review={review} {...reviewItemProps} />
          </div>
        ))}

        {regularReviews.length === 0 && (
          <div className="text-center py-12 border border-white/5 border-dashed rounded-3xl bg-white/[0.01]">
            <p className="text-zinc-500 font-medium">Nenhuma avaliação recente. Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
}