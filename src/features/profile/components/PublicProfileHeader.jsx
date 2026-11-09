import {
  Calendar,
  Loader2,
  MessageCircle,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  Ban,
} from 'lucide-react';
import LevelBadge, { LevelMedal } from '@shared/components/ui/LevelBadge';
import { useAuth } from '@shared/context/useAuth';

const getCreatedYear = (value) => {
  if (!value) return null;
  const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
};

const metaChip = 'inline-flex h-8 items-center gap-1.5 rounded-xl border border-white/[0.10] bg-[#111216]/80 px-3 text-[11px] font-semibold text-zinc-300 backdrop-blur-xl';
const counterChip = 'inline-flex h-8 items-center gap-2 rounded-xl border border-white/[0.10] bg-[#111216]/80 px-3 text-[11px] font-semibold text-zinc-400 backdrop-blur-xl';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111216]';
const secondaryButton = `inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-[#111216]/85 px-4 text-sm font-semibold text-zinc-100 backdrop-blur-xl transition-colors hover:border-white/[0.25] hover:bg-[#181a20] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export default function PublicProfileHeader({
  user,
  isFollowing,
  followsYou,
  onFollow,
  onMessage,
  messaging,
  compatibility,
  isBlocked,
  blocking,
  onBlock,
}) {
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.username === user?.username;
  const createdYear = getCreatedYear(user?.createdAt);
  const bio = typeof user?.bio === 'string' ? user.bio.trim() : '';

  return (
    <section className="group/header relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20]">
      <div className="relative min-h-[390px] overflow-hidden md:min-h-[420px]">
        {user?.backgroundURL ? (
          <img
            key={user.backgroundURL}
            src={user.backgroundURL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center saturate-[1.06] transition-transform duration-[1400ms] group-hover/header:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(124,58,237,0.18),transparent_36%),linear-gradient(135deg,#181a20_0%,#111216_100%)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,22,0.94)_0%,rgba(17,18,22,0.64)_30%,rgba(17,18,22,0.16)_58%,transparent_82%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#181a20_0%,rgba(24,26,32,0.74)_14%,rgba(24,26,32,0.18)_38%,transparent_62%)]" />

        <div className="relative z-10 flex min-h-[390px] flex-col justify-end px-5 pb-6 pt-20 sm:px-7 md:min-h-[420px] md:px-9 md:pb-7 xl:px-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-6">
            <div className="relative mx-auto shrink-0 md:mx-0">
              <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181a20] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:h-40 md:w-40">
                <div className="group/avatar relative h-full w-full overflow-hidden rounded-lg bg-[#181a20]">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="h-full w-full object-cover transition-transform duration-700 group-hover/avatar:scale-105" alt={user.name || 'Avatar'} />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-violet-600/15 text-5xl font-semibold uppercase text-violet-300">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
              </div>

              {(user?.levelTitle || user?.reviewsCount != null) && (
                <LevelMedal
                  reviewsCount={user?.reviewsCount}
                  title={user?.levelTitle}
                  className="pointer-events-none absolute bottom-1.5 right-1.5 z-20"
                />
              )}
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <h2 className="break-words text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl md:text-4xl">
                {user?.name || 'Usuário'}
              </h2>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-[10px] gap-y-2 md:justify-start">
                <p className="text-sm font-medium text-violet-300 md:text-base">@{user?.username}</p>
                {(user?.levelTitle || user?.reviewsCount != null) && (
                  <LevelBadge reviewsCount={user?.reviewsCount} title={user?.levelTitle} />
                )}
                {followsYou && !isMe && (
                  <span className={metaChip}>
                    <UserCheck size={13} className="text-violet-300" /> Te segue
                  </span>
                )}
              </div>

              {bio && (
                <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-7 text-zinc-300 md:mx-0">
                  {bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {createdYear && (
                  <span className={metaChip}>
                    <Calendar size={13} className="text-violet-300" /> Desde {createdYear}
                  </span>
                )}

                {compatibility > 0 && !isMe && (
                  <span className={metaChip}>
                    <Sparkles size={13} className="text-emerald-300" /> {compatibility}% compatível
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <div className={counterChip}>
                    <Users size={14} className="text-violet-300" />
                    <strong className="text-white">{user?.followersCount || 0}</strong>
                    seguidores
                  </div>

                  <div className={counterChip}>
                    <UserPlus size={14} className="text-violet-300" />
                    <strong className="text-white">{user?.followingCount || 0}</strong>
                    seguindo
                  </div>
                </div>

                {!isMe && (
                  <div className="grid w-full grid-cols-2 gap-2.5 lg:flex lg:w-auto lg:items-center">
                    <button
                      type="button"
                      onClick={onFollow}
                      disabled={isBlocked}
                      aria-label={isFollowing ? `Deixar de seguir @${user?.username}` : `Seguir @${user?.username}`}
                      className={secondaryButton}
                    >
                      {isFollowing ? <UserCheck size={17} /> : <UserPlus size={17} />}
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>

                    <button
                      type="button"
                      onClick={onMessage}
                      disabled={messaging || isBlocked}
                      aria-label={`Enviar mensagem para @${user?.username}`}
                      className={secondaryButton}
                    >
                      {messaging ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}
                      Mensagem
                    </button>

                    <button
                      type="button"
                      onClick={onBlock}
                      disabled={blocking}
                      aria-label={isBlocked ? `Desbloquear @${user?.username}` : `Bloquear @${user?.username}`}
                      className={`col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-1 ${focusRing} ${
                        isBlocked
                          ? 'border-emerald-400/25 bg-emerald-500/[0.07] text-emerald-200 hover:border-emerald-400/40 hover:bg-emerald-500/[0.12]'
                          : 'border-red-400/25 bg-red-500/[0.07] text-red-300 hover:border-red-400/40 hover:bg-red-500/[0.12]'
                      }`}
                    >
                      {blocking ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                      {isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
