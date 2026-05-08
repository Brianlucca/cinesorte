import { Link } from "react-router-dom";
import { Heart, Eye, Calendar, Film } from "lucide-react";

function parseDate(value) {
  if (!value) return null;
  if (value._seconds) return new Date(value._seconds * 1000);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getActionDate(item) {
  if (item.action === "like") {
    return parseDate(item.actionDate) || parseDate(item.likedAt) || parseDate(item.timestamp);
  }

  return parseDate(item.actionDate) || parseDate(item.watchedAt) || parseDate(item.timestamp);
}

function formatActionDate(item) {
  const date = getActionDate(item);
  if (!date) return null;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ActivityFeed({ interactions }) {
  if (!interactions || interactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/5 bg-white/[0.01] py-24 shadow-inner animate-in zoom-in-95 duration-500">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/5 shadow-inner">
          <Calendar size={28} className="text-zinc-600" />
        </div>
        <p className="mb-2 text-xl font-black tracking-tight text-white">Nenhuma atividade</p>
        <p className="text-sm font-medium text-zinc-500">Nenhum registro encontrado com este filtro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((item, idx) => {
        const actionDate = formatActionDate(item);
        const isLike = item.action === "like";

        return (
          <div
            key={`${item.mediaId}-${idx}`}
            className="group flex items-center gap-5 rounded-[1.5rem] border border-white/5 bg-black/20 p-4 shadow-inner backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:bg-white/[0.02] md:p-5"
          >
            <Link to={`/app/${item.mediaType || "movie"}/${item.mediaId}`} className="relative block shrink-0">
              {item.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                  className="h-24 w-16 rounded-xl border border-white/5 object-cover shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 md:h-28 md:w-20"
                  alt={item.mediaTitle || "Capa"}
                />
              ) : (
                <div className="flex h-24 w-16 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-zinc-600 shadow-inner md:h-28 md:w-20">
                  <Film size={24} />
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`rounded-xl border p-2 ${
                    isLike
                      ? "border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  }`}
                >
                  {isLike ? <Heart size={16} fill="currentColor" /> : <Eye size={16} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isLike ? "text-red-400" : "text-emerald-400"}`}>
                  {isLike ? "Curtiu" : "Assistiu"}
                </span>
              </div>

              <Link to={`/app/${item.mediaType || "movie"}/${item.mediaId}`} className="block">
                <h3 className="line-clamp-2 text-xl font-black tracking-tight text-white transition-colors group-hover:text-violet-400 md:text-2xl">
                  {item.mediaTitle || "Conteudo sem titulo"}
                </h3>
              </Link>

              {actionDate && (
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {actionDate}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
