import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Clapperboard, Film, Star } from "lucide-react";
import { getMediaDetailsPath, getMediaTypeLabel, getMediaYear, getPosterUrl } from "./messageUtils";

export default function MediaMessageCard({ media, compact = false, horizontal = false }) {
  const navigate = useNavigate();
  const poster = getPosterUrl(media.posterPath || media.poster_path);
  const rating = Number(media.voteAverage ?? media.vote_average);
  const detailsPath = getMediaDetailsPath(media);
  const openDetails = () => {
    if (detailsPath) navigate(detailsPath);
  };

  if (horizontal) {
    return (
      <div className="flex min-w-0 gap-3 rounded-2xl border border-white/[0.08] bg-black/25 p-3">
        <div className="grid h-24 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-900 text-zinc-700">
          {poster ? <img src={poster} alt="" className="h-full w-full object-cover" /> : <Film size={18} />}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">
            <Clapperboard size={12} className="text-violet-300" />
            {getMediaTypeLabel(media.mediaType)} {getMediaYear(media) ? `- ${getMediaYear(media)}` : ""}
          </div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-zinc-100">{media.title}</h4>
          {Number.isFinite(rating) && rating > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </div>
          )}
          {detailsPath && (
            <button
              type="button"
              onClick={openDetails}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-400/15 bg-violet-500/10 px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-violet-100 hover:bg-violet-500/15"
            >
              Ver detalhes
              <ArrowUpRight size={12} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25 ${compact ? "max-w-[260px]" : "max-w-[340px]"}`}>
      <div className="flex gap-3 p-3">
        <div className="grid h-24 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-900 text-zinc-700">
          {poster ? <img src={poster} alt="" className="h-full w-full object-cover" /> : <Film size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">
            <Clapperboard size={12} className="text-violet-300" />
            {getMediaTypeLabel(media.mediaType)} {getMediaYear(media) ? `- ${getMediaYear(media)}` : ""}
          </div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-zinc-100">{media.title}</h4>
          {Number.isFinite(rating) && rating > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              {rating.toFixed(1)}
            </div>
          )}
          {media.note && <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{media.note}</p>}
          {detailsPath && (
            <button
              type="button"
              onClick={openDetails}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-violet-400/15 bg-violet-500/10 px-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-violet-100 hover:bg-violet-500/15"
            >
              Ver detalhes
              <ArrowUpRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
