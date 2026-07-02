import { Calendar, Camera, Edit3, Image as ImageIcon, Settings, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import LevelBadge from '../ui/LevelBadge';

const getCreatedYear = (value) => {
  if (!value) return null;
  const date = value._seconds ? new Date(value._seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
};

export default function ProfileHeader({ user, onEditAvatar, onEditBackground, onShowFollowers, onShowFollowing }) {
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

        <button
          type="button"
          onClick={onEditBackground}
          className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-200 opacity-100 backdrop-blur-xl transition-all hover:bg-white hover:text-black md:right-6 md:top-6 md:opacity-0 md:group-hover/header:opacity-100"
        >
          <ImageIcon size={15} />
          Alterar capa
        </button>

        <div className="relative z-10 flex min-h-[500px] flex-col justify-end px-5 pb-8 pt-24 sm:px-7 md:min-h-[460px] md:px-10 md:pb-9 xl:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className="relative mx-auto shrink-0 md:mx-0">
              <div className="relative h-36 w-36 overflow-hidden rounded-[1.5rem] border border-white/15 bg-zinc-900 p-1.5 shadow-[0_24px_62px_rgba(0,0,0,0.58)] md:h-44 md:w-44">
                <div className="group/avatar relative h-full w-full overflow-hidden rounded-[1.55rem] bg-zinc-900">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="h-full w-full object-cover transition-transform duration-700 group-hover/avatar:scale-105" alt={user.name || 'Avatar'} />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-violet-600/20 text-6xl font-black uppercase text-violet-300">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onEditAvatar}
                    className="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover/avatar:opacity-100"
                  >
                    <span className="flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 backdrop-blur-xl">
                    <Calendar size={13} /> Desde {createdYear}
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black leading-[1.02] tracking-[-0.035em] text-white drop-shadow-2xl sm:text-3xl md:text-4xl">
                    {user?.name || 'Usuario'}
                  </h2>
                  <p className="mt-2 text-sm font-black tracking-tight text-violet-300 md:text-base">@{user?.username}</p>
                </div>

                <Link
                  to="/app/settings"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-zinc-950 shadow-xl shadow-black/20 transition-all hover:scale-[1.02] hover:bg-violet-100 active:scale-[0.98]"
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
                  <div className="mx-auto inline-flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 md:mx-0">
                    <Edit3 size={15} />
                    Adicione uma biografia
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                <button
                  type="button"
                  onClick={onShowFollowers}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-400 backdrop-blur-xl transition-all hover:border-violet-300/25 hover:bg-white/10 hover:text-white"
                >
                  <Users size={15} className="text-violet-300" />
                  <strong className="text-white">{user?.followersCount || 0}</strong>
                  seguidores
                </button>

                <button
                  type="button"
                  onClick={onShowFollowing}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2.5 text-xs font-bold text-zinc-400 backdrop-blur-xl transition-all hover:border-violet-300/25 hover:bg-white/10 hover:text-white"
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
