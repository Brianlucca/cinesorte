import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PersonBio({ biography }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!biography) return null;
  const isLong = biography.length > 700;
  const displayBio = isExpanded || !isLong ? biography : `${biography.slice(0, 700)}…`;

  return (
    <section className="relative pl-5 md:pl-8">
      <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-violet-400 via-violet-500/35 to-transparent" />
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-violet-400">
        Trajetória
      </span>
      <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Biografia</h2>
      <p className="mt-5 whitespace-pre-line text-base font-light leading-8 text-zinc-300 md:text-lg md:leading-9">
        {displayBio}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-400 transition-colors hover:text-violet-300"
        >
          {isExpanded ? "Ler menos" : "Ler biografia completa"}
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      )}
    </section>
  );
}
