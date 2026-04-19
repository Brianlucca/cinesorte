import { useMemo, useRef, useState } from "react";
import { Star, User, TrendingUp, Sparkles, Pin } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { MentionTextarea } from "./MentionTextarea";
import ReviewItem from "./ReviewItem";
import RichTextToolbar from "./RichTextToolbar";

const PRIVILEGED_LEVELS = new Set([
  "mestre da critica",
  "oraculo da setima arte",
  "entidade cinematografica",
  "divindade do cinema",
]);

const ELITE_THEME = {
  "divindade do cinema": { chip: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" },
  "entidade cinematografica": { chip: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200" },
  "oraculo da setima arte": { chip: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" },
  "mestre da critica": { chip: "border-amber-400/20 bg-amber-400/10 text-amber-200" },
};

function normalizeLevelTitle(title) {
  return (title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
  const userLevelKey = normalizeLevelTitle(user?.levelTitle);
  const canUseRichFormatting = PRIVILEGED_LEVELS.has(userLevelKey);
  const currentUserTheme = ELITE_THEME[userLevelKey] || {
    chip: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  };

  const generalInputRef = useRef(null);
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
      setErrorMsgGeneral("Por favor, adicione um comentário ou nota.");
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
      setErrorMsgGeneral(null);
    } catch {
      setErrorMsgGeneral("Erro ao publicar.");
    } finally {
      setIsPostingGeneral(false);
    }
  };

  const reviewItemProps = {
    onReply,
    onDelete,
    onDeleteComment,
    onLike,
    onLoadReplies,
    onEditReview,
    onEditReply,
    followingList,
    canUseRichFormatting,
  };

  return (
    <div className="w-full">
      {stats && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#1a1a1d] px-4 py-4">
          <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#19191c]">
                <span className="text-[2rem] font-bold leading-none text-white">{stats.average}</span>
                <Star size={13} className="mt-1 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-tight text-white">Média da Comunidade</h3>
                <p className="mt-1 text-sm font-medium text-zinc-400">{`Baseado em ${stats.count} avaliações`}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[#1d1d21] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp size={15} />
                </div>
                <p className="min-w-0 text-sm font-semibold text-zinc-300">
                  <span className="mr-2 font-bold text-white">{stats.positivePercent}%</span>
                  aprovam esta obra
                </p>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-800">
                <div
                  style={{ width: `${stats.positivePercent}%` }}
                  className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {topEliteReview && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-200">
              <Pin size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Review Fixada</h2>
              <p className="text-sm text-zinc-500">Comentário destacado de um usuário elite.</p>
            </div>
          </div>
          <ReviewItem review={topEliteReview} isElite {...reviewItemProps} />
        </div>
      )}

      <div className="mb-10 flex gap-5">
        <div className="hidden shrink-0 sm:block">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-xl font-bold uppercase text-white shadow-lg ring-4 ring-zinc-900">
            {user?.photoURL ? (
              <img src={user.photoURL} className="h-full w-full object-cover" alt="" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || <User size={24} />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div
            className={`relative rounded-3xl border bg-zinc-900/55 backdrop-blur-md transition-all duration-300 ${
              isFocusedGeneral ? "z-[30] border-violet-500 shadow-[0_0_24px_rgba(139,92,246,0.16)]" : "border-white/10 hover:border-white/20"
            }`}
          >
            {isFocusedGeneral && (
              <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 pb-4 pt-5">
                <span className="text-sm font-medium text-zinc-400">Sua nota:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setGeneralRating(star)} className="transition-transform hover:scale-110 focus:outline-none">
                      <Star
                        size={24}
                        className={generalRating && star <= generalRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700 hover:text-zinc-500"}
                      />
                    </button>
                  ))}
                </div>
                {generalRating !== null && (
                  <button
                    type="button"
                    onClick={() => setGeneralRating(null)}
                    className="ml-auto rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}

            <div className="space-y-4 p-5">
              {isFocusedGeneral && (
                <div className="space-y-3">
                  {canUseRichFormatting && (
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${currentUserTheme.chip}`}>
                      <Sparkles size={12} />
                      Formatação elite liberada
                    </div>
                  )}
                  <RichTextToolbar
                    inputRef={generalInputRef}
                    onChange={setGeneralText}
                    allowFormatting={canUseRichFormatting}
                    allowSpoiler
                    allowEmoji
                    allowTemplates
                  />
                </div>
              )}

              <MentionTextarea
                value={generalText}
                onChange={(val) => {
                  setGeneralText(val);
                  setErrorMsgGeneral(null);
                }}
                followingList={followingList}
                onFocus={() => setIsFocusedGeneral(true)}
                placeholder="Escreva sua avaliação sobre a obra..."
                inputRefExternal={generalInputRef}
                className={`w-full resize-none bg-transparent text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none ${
                  isFocusedGeneral ? "min-h-[150px]" : "min-h-[68px]"
                }`}
              />
            </div>

            {isFocusedGeneral && (
              <div className="flex flex-col px-5 pb-5">
                {errorMsgGeneral && <span className="mb-3 text-sm font-medium text-red-400">{errorMsgGeneral}</span>}
                <div className="flex w-full items-center justify-between">
                  <span className={`text-xs font-medium ${generalText.length > 450 ? "text-yellow-500" : "text-zinc-500"}`}>
                    {generalText.length}/500
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFocusedGeneral(false);
                        setErrorMsgGeneral(null);
                      }}
                      className="text-sm font-semibold text-zinc-500 transition-colors hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitGeneral}
                      disabled={isPostingGeneral}
                      className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-violet-500 disabled:opacity-60"
                    >
                      {isPostingGeneral ? "Publicando..." : "Publicar review"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="mb-1 flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Comentários Recentes</h2>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/8 px-3 text-sm font-bold text-zinc-300">
            {reviews.length}
          </span>
        </div>

        {regularReviews.length > 0 ? (
          regularReviews.map((review) => <ReviewItem key={review.id} review={review} isElite={false} {...reviewItemProps} />)
        ) : !topEliteReview ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-zinc-500">
            Ainda não há reviews para esta obra.
          </div>
        ) : null}
      </div>
    </div>
  );
}
