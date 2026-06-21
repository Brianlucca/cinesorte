import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";

export default function MediaImages({ images, title = "Galeria" }) {
  const [selectedImage, setSelectedImage] = useState(null);

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

  const backdrops = images?.backdrops?.slice(0, 5) || [];
  const posters = images?.posters?.slice(0, 12) || [];

  if (backdrops.length === 0 && posters.length === 0) return null;

  const ImageButton = ({ image, className, label }) => (
    <button
      type="button"
      onClick={() => setSelectedImage(image.file_path)}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900 text-left shadow-xl transition-all hover:-translate-y-1 hover:border-violet-300/30 ${className}`}
      aria-label={label}
    >
      <img
        src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
        alt=""
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-all group-hover:bg-black/35 group-hover:opacity-100">
        <Maximize2 className="text-white drop-shadow-xl" size={28} />
      </span>
    </button>
  );

  return (
    <section>
      <div className="mb-6">
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
          Bastidores visuais
        </span>
        <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Galeria</h2>
      </div>

      {backdrops.length > 0 && (
        <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-2.5 md:h-[520px] md:grid-cols-4 md:gap-3">
          <ImageButton
            image={backdrops[0]}
            label="Ampliar imagem principal"
            className="col-span-2 row-span-2"
          />
          {backdrops.slice(1, 5).map((image) => (
            <ImageButton
              key={image.file_path}
              image={image}
              label="Ampliar cena"
              className="hidden md:block"
            />
          ))}
        </div>
      )}

      {posters.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Pôsteres oficiais
          </h3>
          <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-3 scrollbar-hide md:gap-4">
            {posters.map((image, index) => (
              <button
                type="button"
                key={image.file_path}
                onClick={() => setSelectedImage(image.file_path)}
                className="group relative aspect-[2/3] w-28 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900 transition-all hover:-translate-y-1 hover:border-violet-300/30 md:w-40"
                aria-label={`Ampliar pôster ${index + 1}`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

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
