import { MapPin, Share2, TrendingUp } from "lucide-react";
import { useToast } from "@shared/context/useToast";

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
    <header className="relative h-[72svh] min-h-[570px] max-h-[790px] sm:min-h-[650px]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-28 overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 56%, rgba(0,0,0,0.78) 76%, rgba(0,0,0,0.22) 92%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 56%, rgba(0,0,0,0.78) 76%, rgba(0,0,0,0.22) 92%, transparent 100%)",
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            className="h-full w-full scale-110 object-cover object-top opacity-40 blur-[3px]"
          />
        ) : (
          <div className="h-full w-full bg-[#181a20]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.8)_42%,rgba(9,9,11,0.22)_78%,rgba(9,9,11,0.1)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#111216_0%,rgba(17,18,22,0.86)_12%,transparent_56%,rgba(17,18,22,0.36)_100%)]" />
        <div className="absolute -bottom-12 left-[20%] h-80 w-[38rem] rounded-full bg-violet-700/[0.08] blur-[125px]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-28 z-[1] h-56 bg-gradient-to-b from-transparent via-[#111216]/75 to-[#111216]" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1380px] items-end px-4 pb-10 pt-24 sm:px-8 sm:pb-12 md:px-10 md:pb-16 xl:px-12">
        <div className="flex w-full min-w-0 flex-col items-start gap-5 sm:gap-6 md:flex-row md:items-end md:gap-7 xl:gap-9">
          {image && (
            <div className="w-[92px] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181a20] sm:w-[104px] md:w-[170px] xl:w-[190px]">
              <img
                src={image}
                alt={details.name}
                className="aspect-[2/3] w-full object-cover object-top"
                fetchPriority="high"
              />
            </div>
          )}

          <div className="max-w-3xl min-w-0 pb-1">
            <span className="mb-3 block h-1 w-12 rounded-full bg-violet-400/80 sm:mb-4" />
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">
                {details.known_for_department === "Acting"
                  ? "Atuação"
                  : details.known_for_department || "Cinema"}
              </span>
              {details.deathday && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  In memoriam
                </span>
              )}
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl md:text-5xl">
              {details.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-300 sm:mt-4 md:text-sm">
              {details.popularity > 0 && (
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <TrendingUp size={14} /> Popularidade {details.popularity.toFixed(0)}
                </span>
              )}
              {details.place_of_birth && (
                <span className="inline-flex items-center gap-1.5 text-zinc-300">
                  <MapPin className="shrink-0" size={14} /> {details.place_of_birth}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartilhar pessoa"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-zinc-100 transition-colors hover:bg-white/[0.08]"
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
