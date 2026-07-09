import {
  Calendar,
  Loader2,
  MessageCircle,
  MessageSquare,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
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
}) {
  const { user: currentUser } = useAuth();
  const isMe = currentUser?.username === user?.username;
  const createdYear = getCreatedYear(user?.createdAt);

  return (
    <section className="group/header relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0d0d11] shadow-[0_30px_100px_rgba(0,0,0,0.36)]">
      <div className="relative min-h-[500px] overflow-hidden md:min-h-[460px]">
        {user?.backgroundURL ? (
          <img
            key={user.backgroundURL}
            src={user.backgroundURL}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-transform duration-[1400ms] group-hover/header:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(124,58,237,0.32),transparent_34%),linear-gradient(135deg,#18111f_0%,#09090b_58%,#050507_100%)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,11,0.98)_0%,rgba(8,8,11,0.72)_42%,rgba(8,8,11,0.25)_76%,rgba(8,8,11,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#0d0d11_0%,rgba(13,13,17,0.88)_16%,transparent_58%,rgba(13,13,17,0.36)_100%)]" />
        <div className="pointer-events-none absolute -bottom-20 left-[18%] h-80 w-[36rem] rounded-full bg-violet-700/10 blur-[120px]" />

        <div className="relative z-10 flex min-h-[500px] flex-col justify-end px-5 pb-8 pt-24 sm:px-7 md:min-h-[460px] md:px-10 md:pb-9 xl:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative mx-auto shrink-0 md:mx-0">
              <div className="relative h-36 w-36 overflow-hidden rounded-[1.5rem] border border-white/15 bg-zinc-900 p-1.5 shadow-[0_24px_62px_rgba(0,0,0,0.58)] md:h-44 md:w-44">
                <div className="relative h-full w-full overflow-hidden rounded-[1.55rem] bg-zinc-900">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="h-full w-full object-cover" alt={user.name || 'Avatar'} />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-violet-600/20 text-6xl font-black uppercase text-violet-300">
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-xl">
                    <Calendar size={13} /> Desde {createdYear}
                  </span>
                )}

                {followsYou && !isMe && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-xl">
                    <UserCheck size={13} /> Te segue
                  </span>
                )}

                {compatibility > 0 && !isMe && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-300 backdrop-blur-xl">
                    <Sparkles size={13} /> {compatibility}% compatível
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black leading-[1.02] tracking-[-0.035em] text-white drop-shadow-2xl sm:text-3xl md:text-4xl">
                    {user?.name || 'Usuário'}
                  </h2>
                  <p className="mt-2 text-sm font-black tracking-tight text-violet-300 md:text-base">@{user?.username}</p>
                </div>

                {!isMe && (
                  <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
                    <button
                      type="button"
                      onClick={onFollow}
                      className={`inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-black/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isFollowing
                          ? 'border border-white/10 bg-black/35 text-zinc-300 hover:border-red-300/25 hover:bg-red-500/10 hover:text-red-300'
                          : 'bg-white text-zinc-950 hover:bg-violet-100'
                      }`}
                    >
                      {isFollowing ? <UserCheck size={17} /> : <UserPlus size={17} />}
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>

                    <button
                      type="button"
                      onClick={onMessage}
                      disabled={messaging}
                      className="inline-flex items-center justify-center gap-2.5 rounded-full border border-violet-300/20 bg-violet-500/15 px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-violet-100 shadow-xl shadow-black/20 transition-all hover:scale-[1.02] hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
                    >
                      {messaging ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}
                      Mensagem
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {user?.bio ? (
                  <p className="mx-auto max-w-3xl text-sm font-medium leading-7 text-zinc-300 drop-shadow-sm md:mx-0">
                    {user.bio}
                  </p>
                ) : (
                  <div className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 md:mx-0">
                    <MessageSquare size={15} />
                    Sem biografia ainda
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                <div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-400 backdrop-blur-xl">
                  <Users size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followersCount || 0}</strong>
                  seguidores
                </div>

                <div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-400 backdrop-blur-xl">
                  <UserPlus size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followingCount || 0}</strong>
                  seguindo
                </div>

                <div className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-400 backdrop-blur-xl">
                  <MessageSquare size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.reviewsCount || 0}</strong>
                  reviews
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
