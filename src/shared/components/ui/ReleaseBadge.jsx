import { getReleaseStatus } from "@shared/lib/releaseStatus";

const SIZES = {
  sm: "px-1.5 py-[3px] text-[9px] tracking-[0.06em]",
  md: "px-2 py-1 text-[9.5px] tracking-[0.08em]",
  lg: "px-2.5 py-1 text-[10px] tracking-[0.1em]",
};

const TONES = {
  neutral: "border-white/10 bg-black/55 text-zinc-200",
  palette:
    "border-[var(--media-accent-border)] bg-[var(--media-accent-soft)] text-[var(--media-accent-text)]",
};

export default function ReleaseBadge({
  media,
  mediaType,
  size = "sm",
  tone = "neutral",
  className = "",
}) {
  const status = getReleaseStatus(media, mediaType);
  if (!status) return null;

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-medium uppercase leading-none ${SIZES[size] || SIZES.sm} ${TONES[tone] || TONES.neutral} ${className}`}
    >
      {status.label}
    </span>
  );
}
