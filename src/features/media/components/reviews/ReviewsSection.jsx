import { useMemo, useRef, useState } from "react";
import { LogIn, Pin, Sparkles, Star, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@shared/context/useAuth";
import { MentionTextarea } from "@features/media/components/reviews/MentionTextarea";
import ReviewItem from "@features/media/components/reviews/ReviewItem";
import RichTextToolbar from "@features/media/components/reviews/RichTextToolbar";

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
  const location = useLocation();
  const user = propUser || contextUser;
  const loginPath = `/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)}`;
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
    const valid = reviews.filter(
      (review) => review.rating !== undefined && review.rating !== null,
    );
    if (valid.length === 0) return null;
    const total = valid.reduce((sum, review) => sum + Number(review.rating), 0);
    return {
      average: (total / valid.length).toFixed(1),
      count: valid.length,
      positivePercent: Math.round(
        (valid.filter((review) => review.rating >= 4).length / valid.length) * 100,
      ),
    };
  }, [reviews]);

  const { topEliteReview, regularReviews } = useMemo(() => {
    if (typeof isEliteUser !== "function") {
      return { topEliteReview: null, regularReviews: reviews };
    }
    const eliteReviews = reviews
      .filter(
        (review) =>
          review.rating !== undefined &&
          review.rating !== null &&
          isEliteUser(review.levelTitle),
      )
      .sort(
        (first, second) =>
          (first.createdAt?._seconds || 0) - (second.createdAt?._seconds || 0),
      );
    const fixed = eliteReviews[0] || null;
    const others = reviews
      .filter((review) => review.id !== fixed?.id)
      .sort(
        (first, second) =>
          (second.createdAt?._seconds || 0) - (first.createdAt?._seconds || 0),
      );
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
    canInteract: Boolean(user),
  };

  return (
    <div className="w-full">
      {stats && (
        <div className="mb-8 grid gap-3 border-y border-white/[0.07] py-5 md:grid-cols-2">
          <div className="relative px-1 md:border-r md:border-white/[0.07] md:px-4">
            <div className="relative flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center">
                <div className="text-center">
                  <span className="block text-3xl font-semibold tracking-[-0.04em] text-white">{stats.average}</span>
                  <Star size={12} className="mx-auto mt-1 fill-yellow-300 text-yellow-300" />
                </div>
              </div>
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-200/60">
                  Nota CineSorte
                </span>
                <h3 className="mt-1 text-sm font-semibold text-white">Média da comunidade</h3>
                <p className="mt-1 text-xs text-zinc-500">{stats.count} avaliações publicadas</p>
              </div>
            </div>
          </div>

          <div className="px-1 md:px-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/10 text-emerald-300">
                <TrendingUp size={17} />
              </span>
              <div>
                <span className="text-2xl font-semibold text-white">{stats.positivePercent}%</span>
                <span className="ml-2 text-sm text-zinc-400">recomendam esta obra</span>
              </div>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                style={{ width: `${stats.positivePercent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      )}

      {user ? (
      <div className="mb-10 flex gap-3 sm:gap-4">
        <div className="hidden shrink-0 sm:block">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-zinc-800 text-sm font-semibold uppercase text-white ring-1 ring-white/[0.08]">
            {user?.photoURL ? (
              <img src={user.photoURL} className="h-full w-full object-cover" alt="" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || <User size={20} />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`relative overflow-visible rounded-xl border bg-white/[0.025] transition-colors duration-200 ${
              isFocusedGeneral
                ? "z-[30] border-violet-400/35"
                : "border-white/[0.07] hover:border-white/12"
            }`}
          >
            <div className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Compartilhe sua visão</h3>
                <p className="mt-0.5 text-[11px] text-zinc-500">Uma nota, uma análise ou os dois.</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Dar nota ${star}`}
                    onClick={() => {
                      setGeneralRating(star);
                      setIsFocusedGeneral(true);
                    }}
                    className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      size={21}
                      className={
                        generalRating && star <= generalRating
                          ? "fill-yellow-300 text-yellow-300"
                          : "fill-white/[0.04] text-zinc-700 hover:text-zinc-500"
                      }
                    />
                  </button>
                ))}
                {generalRating !== null && (
                  <button
                    type="button"
                    onClick={() => setGeneralRating(null)}
                    className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-zinc-600 hover:text-white"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              {isFocusedGeneral && (
                <div className="space-y-3">
                  {canUseRichFormatting && (
                    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${currentUserTheme.chip}`}>
                      <Sparkles size={11} /> Formatação elite
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
                onChange={(value) => {
                  setGeneralText(value);
                  setErrorMsgGeneral(null);
                }}
                followingList={followingList}
                onFocus={() => setIsFocusedGeneral(true)}
                placeholder="O que esta obra fez você sentir?"
                inputRefExternal={generalInputRef}
                className={`w-full resize-none bg-transparent text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none sm:text-base ${
                  isFocusedGeneral ? "min-h-[140px]" : "min-h-[58px]"
                }`}
              />
            </div>

            {isFocusedGeneral && (
              <div className="flex flex-col gap-3 border-t border-white/[0.05] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  {errorMsgGeneral && <span className="block text-xs font-semibold text-red-400">{errorMsgGeneral}</span>}
                  <span className={`text-[10px] font-bold ${generalText.length > 450 ? "text-yellow-400" : "text-zinc-600"}`}>
                    {generalText.length}/500
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFocusedGeneral(false);
                      setErrorMsgGeneral(null);
                    }}
                    className="rounded-full px-4 py-2.5 text-xs font-bold text-zinc-500 transition-colors hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitGeneral}
                    disabled={isPostingGeneral}
                    className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-violet-100 disabled:opacity-60"
                  >
                    {isPostingGeneral ? "Publicando..." : "Publicar review"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      ) : (
        <div className="mb-10 flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 text-violet-300">
              <LogIn size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">Entre para participar</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Você pode ler as reviews livremente. Para avaliar, comentar ou curtir, entre na sua conta.
              </p>
            </div>
          </div>
          <Link
            to={loginPath}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100"
          >
            Entrar
          </Link>
        </div>
      )}

      {topEliteReview && (
        <div className="mb-9">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/10 text-violet-300">
              <Pin size={14} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-white">Review em destaque</h3>
              <p className="text-[11px] text-zinc-500">Uma análise selecionada da comunidade elite.</p>
            </div>
          </div>
          <ReviewItem review={topEliteReview} isElite {...reviewItemProps} />
        </div>
      )}

      <div>
        <div className="mb-5 flex items-center justify-between border-b border-white/[0.06] pb-4">
          <h3 className="text-base font-semibold text-white">Reviews recentes</h3>
          <span className="text-[11px] font-medium text-zinc-500">
            {reviews.length}
          </span>
        </div>
        {regularReviews.length > 0 ? (
          regularReviews.map((review) => (
            <ReviewItem key={review.id} review={review} isElite={false} {...reviewItemProps} />
          ))
        ) : !topEliteReview ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.015] p-10 text-center">
            <Star size={22} className="mx-auto text-zinc-700" />
            <p className="mt-3 text-sm font-semibold text-zinc-500">
              Ainda não há reviews. Seja a primeira pessoa a publicar.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
