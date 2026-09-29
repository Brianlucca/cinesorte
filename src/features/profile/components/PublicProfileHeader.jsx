import {
  Calendar,
  Loader2,
  MessageCircle,
  MessageSquare,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  Ban,
} from 'lucide-react';
import LevelBadge from '@shared/components/ui/LevelBadge';
import { useAuth } from '@shared/context/useAuth';

const getCreatedYear = (value) => {
  if (!value) return null;
  const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
};

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

  return (
    <section className="group/header relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20]">
      <div className="relative min-h-[390px] overflow-hidden md:min-h-[420px]">
        {user?.backgroundURL ? (
          <img
            key={user.backgroundURL}
            src={user.backgroundURL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-85 transition-transform duration-[1400ms] group-hover/header:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(124,58,237,0.18),transparent_36%),linear-gradient(135deg,#181a20_0%,#111216_100%)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,18,22,0.97)_0%,rgba(17,18,22,0.70)_44%,rgba(17,18,22,0.20)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#181a20_0%,rgba(24,26,32,0.76)_18%,transparent_62%,rgba(17,18,22,0.22)_100%)]" />

        <div className="relative z-10 flex min-h-[390px] flex-col justify-end px-5 pb-7 pt-20 sm:px-7 md:min-h-[420px] md:px-9 md:pb-8 xl:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
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

              {user?.levelTitle && (
                <div className="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap drop-shadow-xl">
                  <LevelBadge title={user.levelTitle} size="md" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {createdYear && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-1.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-xl">
                    <Calendar size={13} /> Desde {createdYear}
                  </span>
                )}

                {followsYou && !isMe && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-1.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-xl">
                    <UserCheck size={13} /> Te segue
                  </span>
                )}

                {compatibility > 0 && !isMe && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 backdrop-blur-xl">
                    <Sparkles size={13} /> {compatibility}% compatível
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl md:text-4xl">
                    {user?.name || 'Usuário'}
                  </h2>
                  <p className="mt-1.5 text-sm font-medium text-violet-300 md:text-base">@{user?.username}</p>
                </div>

                {!isMe && (
                  <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                    <button
                      type="button"
                      onClick={onFollow}
                      disabled={isBlocked}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors ${
                        isFollowing
                          ? 'border border-white/[0.06] bg-white/[0.018] text-zinc-300 hover:border-red-300/20 hover:bg-red-500/10 hover:text-red-300'
                          : 'bg-white text-zinc-950 hover:bg-violet-100'
                      }`}
                    >
                      {isFollowing ? <UserCheck size={17} /> : <UserPlus size={17} />}
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>

                    <button
                      type="button"
                      onClick={onMessage}
                      disabled={messaging || isBlocked}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {messaging ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}
                      Mensagem
                    </button>

                    <button
                      type="button"
                      onClick={onBlock}
                      disabled={blocking}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${isBlocked ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border-red-400/15 bg-red-500/[0.07] text-red-300 hover:bg-red-500/15'}`}
                    >
                      {blocking ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                      {isBlocked ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {user?.bio ? (
                  <p className="mx-auto max-w-3xl text-sm font-medium leading-7 text-zinc-300 md:mx-0">
                    {user.bio}
                  </p>
                ) : (
                  <div className="mx-auto inline-flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-xs font-semibold text-zinc-500 md:mx-0">
                    <MessageSquare size={15} />
                    Sem biografia ainda
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                <div className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-xl">
                  <Users size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followersCount || 0}</strong>
                  seguidores
                </div>

                <div className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-xl">
                  <UserPlus size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followingCount || 0}</strong>
                  seguindo
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
