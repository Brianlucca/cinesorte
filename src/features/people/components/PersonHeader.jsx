import { useState } from "react";
import { MapPin, Share2, TrendingUp } from "lucide-react";
import PersonImages from "@features/people/components/PersonImages";
import { useToast } from "@shared/context/useToast";

export default function PersonHeader({ details }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const toast = useToast();
  const image = details.profile_path
    ? `https://image.tmdb.org/t/p/original${details.profile_path}`
    : null;
  const galleryImages = (details.images?.profiles || [])
    .filter((profile) => profile.file_path)
    .slice(0, 3);
  const totalGalleryImages = (details.images?.profiles || []).filter(
    (profile) => profile.file_path,
  ).length;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/person/${details.id}`);
    toast.success("Copiado", "Link público copiado!");
  };
  const openGallery = (index) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  return (
    <header className="relative overflow-hidden bg-[#111216]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_30%,rgba(124,58,237,0.08),transparent_38%),linear-gradient(180deg,rgba(24,26,32,0.42),transparent_68%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#111216]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px] px-4 pb-8 pt-44 sm:px-8 sm:pb-10 md:px-10 md:pb-14 md:pt-28 xl:px-12">
        <div className="flex min-w-0 flex-col gap-8 md:min-h-[470px] md:flex-row md:items-end md:justify-between md:gap-10 lg:min-h-[520px]">
          <div className="flex min-w-0 items-end gap-4 sm:gap-6 md:flex-1 xl:gap-8">
            {image && (
              <div className="w-[92px] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#181a20] sm:w-[112px] md:w-[150px] lg:w-[170px] xl:w-[190px]">
                <img
                  src={image}
                  alt={details.name}
                  className="aspect-[2/3] w-full object-cover object-top"
                  fetchPriority="high"
                />
              </div>
            )}

            <div className="min-w-0 flex-1 pb-1">
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

          {galleryImages.length > 0 && (
            <div className="group relative block w-full min-w-0 rounded-xl md:w-[min(42%,520px)] md:shrink-0">
              <div className="grid h-[190px] grid-cols-3 grid-rows-2 gap-1.5 overflow-hidden rounded-xl sm:h-[250px] sm:gap-2 md:h-[300px] lg:h-[340px]">
                {galleryImages.map((profile, index) => (
                  <button
                    type="button"
                    key={profile.file_path}
                    onClick={() => openGallery(index)}
                    aria-label={`Abrir foto ${index + 1} de ${details.name}`}
                    className={`relative min-h-0 overflow-hidden bg-[#181a20] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400 ${
                      index === 0
                        ? galleryImages.length === 1
                          ? "col-span-3 row-span-2"
                          : "col-span-2 row-span-2"
                        : galleryImages.length === 2
                          ? "row-span-2"
                          : ""
                    }`}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w780${profile.file_path}`}
                      alt={`${details.name} — foto ${index + 1}`}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    {index === 0 && (
                      <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    )}
                  </button>
                ))}
              </div>
              <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center rounded-lg bg-black/65 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition-colors group-hover:bg-black/80 sm:bottom-3 sm:left-3 sm:px-3">
                Abrir galeria · {totalGalleryImages} fotos
              </span>
            </div>
          )}
        </div>
      </div>
      <PersonImages
        images={details.images}
        name={details.name}
        isOpen={isGalleryOpen}
        initialIndex={galleryStartIndex}
        onClose={() => setIsGalleryOpen(false)}
      />
    </header>
  );
}
