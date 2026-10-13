import { useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon, X } from "lucide-react";

export default function PersonImages({ images, name }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const profiles = images?.profiles || [];

  if (profiles.length === 0) return null;

  const displayImages = profiles.slice(0, 12);

  return (
    <section id="person-gallery" className="scroll-mt-24">
      <div className="mb-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
          Registros
        </span>
        <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">
          Galeria de fotos
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
        {displayImages.map((img, idx) => (
          <button
            key={img.file_path || idx}
            type="button"
            onClick={() => setSelectedImage(img.file_path)}
            aria-label={`Ampliar foto ${idx + 1} de ${name}`}
            className="group relative aspect-[2/3] cursor-zoom-in overflow-hidden rounded-xl bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <img
              src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
              className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-85"
              alt={`${name} — foto ${idx + 1}`}
              loading="lazy"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/0 text-white/0 transition-colors group-hover:bg-black/20 group-hover:text-white/80">
              <ImageIcon size={26} />
            </span>
          </button>
        ))}
      </div>

      {selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100000] flex animate-in items-center justify-center bg-black/95 p-4 backdrop-blur-xl fade-in duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              aria-label="Fechar foto ampliada"
              className="absolute right-6 top-6 rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white md:right-8 md:top-8"
              onClick={() => setSelectedImage(null)}
            >
              <X size={22} />
            </button>
            <img
              src={`https://image.tmdb.org/t/p/original${selectedImage}`}
              className="max-h-[90vh] max-w-full animate-in rounded-xl object-contain zoom-in-95 duration-300"
              alt={`Foto ampliada de ${name}`}
              onClick={(event) => event.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </section>
  );
}