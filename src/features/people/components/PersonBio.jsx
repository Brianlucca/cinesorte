import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PersonBio({ biography }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!biography) return null;
  const isLong = biography.length > 700;
  const displayBio = isExpanded || !isLong ? biography : `${biography.slice(0, 700)}…`;

  return (
    <section className="max-w-4xl border-t border-white/[0.07] pt-8">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
        Sobre a pessoa
      </span>
      <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl">Biografia</h2>
      <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-zinc-300 md:text-base md:leading-8">
        {displayBio}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
        >
          {isExpanded ? "Ler menos" : "Ler biografia completa"}
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      )}
    </section>
  );
}
