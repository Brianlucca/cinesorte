import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function TrailerModal({ isOpen, onClose, videoKey, title = "Trailer" }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoKey) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] bg-black trailer-cinema-enter"
      role="dialog"
      aria-modal="true"
      aria-label={`Trailer de ${title}`}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`}
        title={`Trailer de ${title}`}
        className="absolute inset-0 h-full w-full trailer-cinema-video-enter"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/80 to-transparent" />
      <div className="absolute left-5 top-5 z-20 max-w-[70%] md:left-8 md:top-7">
        <span className="block text-[9px] font-black uppercase tracking-[0.24em] text-violet-300 md:text-[10px]">
          Modo cinema
        </span>
        <span className="mt-1 block truncate text-sm font-bold text-white/90 md:text-base">
          {title}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar trailer"
        className="absolute right-5 top-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-xl transition-all hover:scale-105 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 md:right-8 md:top-7 md:h-12 md:w-12"
      >
        <X size={22} />
      </button>
    </div>,
    document.body,
  );
}
