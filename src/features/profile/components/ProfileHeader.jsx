import { Calendar, Camera, Edit3, Image as ImageIcon, Settings, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import LevelBadge from '@shared/components/ui/LevelBadge';

const getCreatedYear = (value) => {
  if (!value) return null;
  const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
};

export default function ProfileHeader({ user, onEditAvatar, onEditBackground, onShowFollowers, onShowFollowing }) {
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

        <button
          type="button"
          onClick={onEditBackground}
          className="absolute right-4 top-4 z-20 inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.06] bg-black/35 px-3.5 text-xs font-semibold text-zinc-200 backdrop-blur-xl transition-colors hover:bg-white hover:text-black md:right-6 md:top-6"
        >
          <ImageIcon size={15} />
          Alterar capa
        </button>

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
                  <button
                    type="button"
                    onClick={onEditAvatar}
                    className="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/avatar:opacity-100"
                  >
                    <span className="flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                        <Camera size={23} />
                      </span>
                      Alterar
                    </span>
                  </button>
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
              </div>

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl md:text-4xl">
                    {user?.name || 'Usuario'}
                  </h2>
                  <p className="mt-1.5 text-sm font-medium text-violet-300 md:text-base">@{user?.username}</p>
                </div>

                <Link
                  to="/app/settings"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100"
                >
                  <Settings size={17} />
                  Editar perfil
                </Link>
              </div>

              <div className="mt-6">
                {user?.bio ? (
                  <p className="mx-auto max-w-3xl text-sm font-medium leading-7 text-zinc-300 drop-shadow-sm md:mx-0">
                    {user.bio}
                  </p>
                ) : (
                  <div className="mx-auto inline-flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-3 text-xs font-semibold text-zinc-500 md:mx-0">
                    <Edit3 size={15} />
                    Adicione uma biografia
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                <button
                  type="button"
                  onClick={onShowFollowers}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-xl transition-colors hover:border-violet-300/25 hover:bg-white/[0.06] hover:text-white"
                >
                  <Users size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followersCount || 0}</strong>
                  seguidores
                </button>

                <button
                  type="button"
                  onClick={onShowFollowing}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.018] px-4 py-2.5 text-xs font-semibold text-zinc-400 backdrop-blur-xl transition-colors hover:border-violet-300/25 hover:bg-white/[0.06] hover:text-white"
                >
                  <UserPlus size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followingCount || 0}</strong>
                  seguindo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
