import { MapPin, Share2, TrendingUp } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function PersonHeader({ details }) {
  const toast = useToast();
  const image = details.profile_path
    ? `https://image.tmdb.org/t/p/original${details.profile_path}`
    : null;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/person/${details.id}`);
    toast.success("Copiado", "Link público copiado!");
  };

  return (
    <header className="relative h-[82svh] min-h-[690px] max-h-[880px]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-52"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.78) 78%, rgba(0,0,0,0.22) 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.78) 78%, rgba(0,0,0,0.22) 92%, transparent 100%)",
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full scale-110 object-cover object-top opacity-55 blur-[2px]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-950/30 to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.8)_42%,rgba(9,9,11,0.22)_78%,rgba(9,9,11,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#09090b_0%,rgba(9,9,11,0.86)_12%,transparent_56%,rgba(9,9,11,0.36)_100%)]" />
        <div className="absolute -bottom-12 left-[20%] h-80 w-[38rem] rounded-full bg-violet-700/12 blur-[125px]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-48 z-[1] h-80 bg-gradient-to-b from-transparent via-zinc-950/75 to-zinc-950" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-end px-5 pb-20 pt-28 sm:px-8 md:px-12 md:pb-24 xl:px-16">
        <div className="flex w-full items-end gap-8 xl:gap-12">
          {image && (
            <div className="hidden w-[210px] shrink-0 overflow-hidden rounded-[1.75rem] border border-white/15 bg-zinc-900 shadow-[0_30px_80px_rgba(0,0,0,0.7)] md:block xl:w-[250px]">
              <img
                src={image}
                alt={details.name}
                className="aspect-[2/3] w-full object-cover object-top"
              />
            </div>
          )}

          <div className="max-w-4xl pb-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/20 bg-violet-500/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-200 backdrop-blur-xl">
                {details.known_for_department === "Acting"
                  ? "Atuação"
                  : details.known_for_department || "Cinema"}
              </span>
              {details.deathday && (
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300 backdrop-blur-xl">
                  In memoriam
                </span>
              )}
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-black leading-[0.98] tracking-[-0.03em] text-white/95 sm:text-4xl md:text-[3rem] xl:text-[3.6rem]">
              {details.name}
            </h1>

            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-semibold text-zinc-300">
              {details.popularity > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/[0.08] px-3 py-2 text-emerald-300 backdrop-blur-xl">
                  <TrendingUp size={14} /> Popularidade {details.popularity.toFixed(0)}
                </span>
              )}
              {details.place_of_birth && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 backdrop-blur-xl">
                  <MapPin size={14} /> {details.place_of_birth}
                </span>
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartilhar pessoa"
                className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/15 bg-black/25 px-4 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white hover:text-black"
              >
                <Share2 size={17} />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
