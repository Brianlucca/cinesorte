import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

function GalleryRail({ title, count, images, variant, onSelect }) {
  const rowRef = useRef(null);
  const isPoster = variant === "poster";

  const slide = (direction) => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black text-white md:text-base">{title}</h3>
          <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-[10px] font-bold text-zinc-500">
            {count}
          </span>
        </div>

        {images.length > 1 && (
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => slide("left")}
              aria-label={`Voltar em ${title}`}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => slide("right")}
              aria-label={`Avançar em ${title}`}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={rowRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 scrollbar-hide md:snap-none md:gap-4"
      >
        {images.map((image, index) => (
          <button
            type="button"
            key={image.file_path}
            onClick={() => onSelect(image.file_path)}
            aria-label={`Ampliar ${title.toLowerCase()} ${index + 1}`}
            className={`group relative shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/30 ${
              isPoster
                ? "aspect-[2/3] w-28 sm:w-36 md:w-44"
                : "aspect-video w-[78vw] max-w-[310px] sm:w-[360px] sm:max-w-none md:w-[420px]"
            }`}
          >
            <img
              src={`https://image.tmdb.org/t/p/${isPoster ? "w500" : "w780"}${image.file_path}`}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-40 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:opacity-100">
              <Maximize2 size={15} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MediaImages({ images, title = "Galeria" }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const backdrops = images?.backdrops?.slice(0, 16) || [];
  const posters = images?.posters?.slice(0, 16) || [];

  useEffect(() => {
    if (!selectedImage) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  if (backdrops.length === 0 && posters.length === 0) return null;

  return (
    <section>
      <div className="mb-7">
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
          Arquivo visual
        </span>
        <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Galeria</h2>
      </div>

      <div className="space-y-9 md:space-y-11">
        {backdrops.length > 0 && (
          <GalleryRail
            title="Cenas"
            count={backdrops.length}
            images={backdrops}
            variant="backdrop"
            onSelect={setSelectedImage}
          />
        )}
        {posters.length > 0 && (
          <GalleryRail
            title="Pôsteres oficiais"
            count={posters.length}
            images={posters}
            variant="poster"
            onSelect={setSelectedImage}
          />
        )}
      </div>

      {selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-zinc-950/95 p-4 backdrop-blur-xl md:p-8"
            onClick={() => setSelectedImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Imagem ampliada de ${title}`}
          >
            <button
              type="button"
              aria-label="Fechar imagem"
              className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-black/40 text-zinc-300 backdrop-blur-xl transition-all hover:bg-white hover:text-black md:right-8 md:top-8"
              onClick={() => setSelectedImage(null)}
            >
              <X size={22} />
            </button>
            <img
              src={`https://image.tmdb.org/t/p/original${selectedImage}`}
              className="max-h-[90vh] max-w-full select-none rounded-2xl border border-white/5 object-contain shadow-2xl trailer-cinema-video-enter"
              alt={`Imagem de ${title}`}
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </section>
  );
}
