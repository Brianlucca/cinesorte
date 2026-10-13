import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function PersonImages({
  images,
  name,
  isOpen,
  initialIndex = 0,
  onClose,
}) {
  const profiles = (images?.profiles || []).filter((image) => image.file_path);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(null);
  const totalImages = profiles.length;

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setCurrentIndex((index) => (index - 1 + totalImages) % totalImages);
      }
      if (event.key === "ArrowRight") {
        setCurrentIndex((index) => (index + 1) % totalImages);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, totalImages]);

  if (!isOpen || totalImages === 0) return null;

  const currentImage = profiles[currentIndex];
  const move = (direction) => {
    setCurrentIndex((index) => (index + direction + totalImages) % totalImages);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex flex-col bg-black/95 text-white backdrop-blur-xl animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos de ${name}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-white sm:text-base">{name}</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Foto {currentIndex + 1} de {totalImages}
          </p>
        </div>
        <button
          type="button"
          aria-label="Fechar galeria"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-zinc-300 transition-colors hover:bg-white/[0.12] hover:text-white"
        >
          <X size={20} />
        </button>
      </header>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-4 sm:px-20 sm:py-6"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const deltaX = event.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(deltaX) > 50) move(deltaX > 0 ? -1 : 1);
        }}
      >
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={() => move(-1)}
          className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/[0.08] bg-black/55 text-white transition-colors hover:bg-white/[0.15] sm:left-5 sm:h-12 sm:w-12"
        >
          <ChevronLeft size={24} />
        </button>

        <img
          key={currentImage.file_path}
          src={`https://image.tmdb.org/t/p/original${currentImage.file_path}`}
          alt={`${name} — foto ${currentIndex + 1}`}
          className="max-h-full max-w-full animate-in object-contain fade-in duration-200"
        />

        <button
          type="button"
          aria-label="Próxima foto"
          onClick={() => move(1)}
          className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/[0.08] bg-black/55 text-white transition-colors hover:bg-white/[0.15] sm:right-5 sm:h-12 sm:w-12"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
