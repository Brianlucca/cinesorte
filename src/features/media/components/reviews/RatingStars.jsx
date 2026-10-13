import { Star } from "lucide-react";

export default function RatingStars({ value, onChange, size = 20 }) {
  const interactive = typeof onChange === "function";
  const rating = Number(value) || 0;

  return (
    <span
      className="inline-flex items-center gap-0.5"
      role={interactive ? "group" : undefined}
      aria-label={interactive ? "Escolha uma nota de meia a cinco estrelas" : `Nota ${rating.toFixed(1)} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.max(0, Math.min(100, (rating - star + 1) * 100));
        const starIcon = (className) => <Star size={size} className={className} />;

        return (
          <span
            key={star}
            className="relative inline-flex shrink-0"
            style={{ width: size, height: size }}
          >
            {starIcon("fill-zinc-800 text-zinc-700")}
            {fillPercent > 0 && (
              <span
                className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
                aria-hidden="true"
              >
                {starIcon("max-w-none shrink-0 fill-yellow-400 text-yellow-400")}
              </span>
            )}
            {interactive && (
              <>
                <button
                  type="button"
                  onClick={() => onChange(rating === star - 0.5 ? star : star - 0.5)}
                  aria-label={`Selecionar ${rating === star - 0.5 ? star : star - 0.5} ${star === 1 ? "estrela" : "estrelas"}; clique novamente para completar`}
                  aria-pressed={rating === star - 0.5 || rating === star}
                  className="absolute inset-0 z-10 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-300"
                />
              </>
            )}
          </span>
        );
      })}
    </span>
  );
}
