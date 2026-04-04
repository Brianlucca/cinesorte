import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Trash2, MessageCircle, Share2, Heart, ChevronDown, ChevronUp, Crown, Layers, Film, Loader2, Zap, Eye, Sparkles } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function buildMediaLink(item) {
  const rawId = item.mediaId?.toString() || "";
  if (item.mediaType === 'person') {
    return `/app/person/${rawId.replace(/^person-/, '')}`;
  }
  const episodeMatch = rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
  if (episodeMatch || item.mediaType === 'episode') {
    const match = episodeMatch || rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
    if (match) {
      const [, tvId, season, episode] = match;
      return `/app/tv/${tvId}/season/${parseInt(season)}/episode/${parseInt(episode)}`;
    }
  }
  const seasonMatch = rawId.match(/^(?:tv-)?(\d+)-s(\d+)$/);
  if (seasonMatch) {
    const [, tvId, season] = seasonMatch;
    return `/app/tv/${tvId}/season/${parseInt(season)}`;
  }
  return `/app/${item.mediaType || 'movie'}/${rawId.replace(/^(movie-|tv-)/, '')}`;
}

export default function FeedCard({ item, currentUser, onDelete, onLike, onLoadComments }) {
  const [visibleComments, setVisibleComments] = useState(3);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const toast = useToast();

  const isListShare = item.type === 'list_share';
  const displayUsername = item.username || item.nickname || "Anônimo";
  const photoURL = item.userPhoto || item.photoURL || null;
  const replies = item.replies || [];
  const commentsCount = item.commentsCount || 0;
  const isOwner = !!item.isOwner;
  const isLiked = !!item.isLikedByCurrentUser;
  const MAX_TEXT_LENGTH = 160;

  const mediaLink = buildMediaLink(item);

  const getEliteStyle = (title) => {
    switch (title) {
      case "Divindade do Cinema": return { accent: "border-l-cyan-500", badge: "text-cyan-400 bg-cyan-400/10", icon: <Eye size={10} />, shadow: "shadow-cyan-500/10" };
      case "Entidade Cinematográfica": return { accent: "border-l-purple-500", badge: "text-purple-400 bg-purple-400/10", icon: <Sparkles size={10} />, shadow: "shadow-purple-500/10" };
      case "Oráculo da Sétima Arte": return { accent: "border-l-emerald-500", badge: "text-emerald-400 bg-emerald-400/10", icon: <Zap size={10} />, shadow: "shadow-emerald-500/10" };
      case "Mestre da Crítica": return { accent: "border-l-amber-500", badge: "text-amber-400 bg-amber-400/10", icon: <Crown size={10} />, shadow: "shadow-amber-500/10" };
      default: return { accent: "border-l-violet-500/50", badge: "text-zinc-500 bg-white/5", icon: null, shadow: "" };
    }
  };

  const style = getEliteStyle(item.levelTitle);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString._seconds ? dateString._seconds * 1000 : dateString);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
  };

  const handleShare = async () => {
    const shareUrl = isListShare 
      ? `${window.location.origin}/app/lists/${item.username}/${item.attachmentId}`
      : `${window.location.origin}${mediaLink}`;
    
    if (navigator.share) {
      try { await navigator.share({ title: "CineSorte", url: shareUrl }); } 
      catch (e) { navigator.clipboard.writeText(shareUrl); toast.success('Link copiado!'); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado!');
    }
  };

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike(item.id);
    setTimeout(() => setIsLikeAnimating(false), 300);
  };

  const handleLoadCommentsClick = async () => {
    if (replies.length === 0 && commentsCount > 0) {
      setLoadingComments(true);
      await onLoadComments(item.id);
      setLoadingComments(false);
    }
    setVisibleComments(prev => prev === 0 ? 3 : prev + 5);
  };

  const listItems = Array.isArray(item.listItems) ? item.listItems : [];

  return (
    <article className={`group relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 border-l-4 ${style.accent} ${style.shadow} hover:border-white/10 hover:bg-white/[0.04] shadow-2xl`}>
      
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/app/profile/${item.username}`} className="shrink-0 relative group/avatar">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 overflow-hidden ring-2 ring-white/5 group-hover/avatar:ring-violet-500/50 transition-all shadow-lg">
              {photoURL ? (
                <img src={photoURL} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-sm text-zinc-500 uppercase">
                  {displayUsername[0]}
                </div>
              )}
            </div>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/app/profile/${item.username}`} className="text-sm font-black text-white hover:text-violet-400 transition-colors">@{displayUsername}</Link>
              {item.levelTitle && (
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${style.badge}`}>
                  {style.icon} {item.levelTitle.split(' ')[0]}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              <span>{formatDate(item.createdAt)}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-violet-500/80">{isListShare ? 'Coleção' : 'Avaliação'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isListShare && (
            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-xl border border-yellow-500/20 font-black text-xs shadow-lg">
              <Star size={12} className="fill-yellow-500" />
              {item.rating?.toFixed(1)}
            </div>
          )}
          
          {isOwner && (
            <button onClick={() => onDelete(item.id, isListShare ? 'list_share' : 'review')} className="p-2.5 text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-400/10 rounded-2xl transition-all shadow-sm">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {item.content && <p className="mb-5 text-base text-zinc-300 leading-relaxed font-light text-justify">{item.content}</p>}

        {isListShare ? (
          <Link to={item.username && item.attachmentId ? `/app/lists/${item.username}/${item.attachmentId}` : "#"} className="block group/list">
            <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-950/40 group-hover/list:border-violet-500/30 transition-all shadow-2xl flex flex-col">
              <div className="grid grid-cols-12 h-56 md:h-72 gap-1 overflow-hidden">
                {listItems.length > 0 ? (
                  <>
                    <div className={`${listItems.length === 1 ? 'col-span-12' : 'col-span-8'} h-full relative overflow-hidden`}>
                      <img 
                        src={`https://image.tmdb.org/t/p/w780${listItems[0].poster_path}`} 
                        className="w-full h-full object-cover group-hover/list:scale-105 transition-transform duration-1000" 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                    </div>
                    {listItems.length > 1 && (
                      <div className="col-span-4 flex flex-col gap-1 h-full">
                        <div className="h-full overflow-hidden relative">
                          <img src={`https://image.tmdb.org/t/p/w500${listItems[1].poster_path}`} className="w-full h-full object-cover group-hover/list:scale-110 transition-transform duration-700" alt="" />
                          {listItems.length > 2 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                              <span className="text-white font-black text-2xl">+{item.listCount - 1 || listItems.length - 1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-12 flex items-center justify-center bg-zinc-900 py-20">
                    <Layers size={40} className="text-zinc-800" />
                  </div>
                )}
              </div>
              
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                    <h3 className="font-black text-white text-xl truncate uppercase tracking-tight">{item.listName || "Minha Seleção"}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-4">
                    <Layers size={14} className="text-violet-500" />
                    <span>{item.listCount || listItems.length} Itens Catalogados</span>
                  </div>
                </div>
                <div className="px-6 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl transform group-hover/list:scale-105 transition-all text-center">Explorar Coleção</div>
              </div>
            </div>
          </Link>
        ) : (
          <>
            <Link to={mediaLink} className="block relative group/media overflow-hidden rounded-[1.5rem] shadow-2xl border border-white/5">
              {item.backdropPath ? (
                <div className="aspect-[21/9] relative">
                  <img src={`https://image.tmdb.org/t/p/original${item.backdropPath}`} className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-2xl font-black text-white tracking-tight leading-tight line-clamp-1 drop-shadow-2xl">{item.mediaTitle}</h3>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-5 p-5 bg-white/[0.03]">
                  <div className="w-16 h-24 rounded-xl bg-zinc-800 shrink-0 shadow-2xl overflow-hidden border border-white/10">
                    {item.posterPath ? <img src={`https://image.tmdb.org/t/p/w342${item.posterPath}`} className="w-full h-full object-cover" alt="" /> : <Film size={24} className="text-zinc-700 m-auto h-full" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white tracking-tight line-clamp-2 mb-1">{item.mediaTitle}</h3>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{item.mediaType === 'tv' ? 'Série' : 'Filme'}</span>
                  </div>
                </div>
              )}
            </Link>

            {item.text && (
              <div className="mt-5">
                <p className="text-base text-zinc-200 leading-relaxed font-light text-justify">
                  {isExpanded || item.text.length <= MAX_TEXT_LENGTH ? item.text : `${item.text.slice(0, MAX_TEXT_LENGTH)}...`}
                  {item.text.length > MAX_TEXT_LENGTH && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-violet-400 hover:text-violet-300 font-black ml-2 text-xs uppercase tracking-widest">
                      {isExpanded ? "Ler menos" : "Ver mais"}
                    </button>
                  )}
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/5">
          <div className="flex items-center gap-6">
            <button onClick={handleLikeClick} className={`flex items-center gap-2 transition-all duration-300 font-bold text-sm ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'} ${isLikeAnimating ? 'scale-125' : 'scale-100'}`}>
              <Heart size={22} className={isLiked ? "fill-red-500" : ""} />
              {item.likesCount > 0 && <span>{item.likesCount}</span>}
            </button>
            <button onClick={handleLoadCommentsClick} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors font-bold text-sm">
              <MessageCircle size={22} />
              {commentsCount > 0 && <span>{commentsCount}</span>}
            </button>
            <button onClick={handleShare} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <Share2 size={22} />
            </button>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-6 space-y-4 pt-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
            {displayedReplies.map((reply) => (
              <div key={reply.id} className="flex gap-3 group/reply">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 overflow-hidden shrink-0 mt-0.5 border border-white/5 shadow-md">
                  {reply.userPhoto ? <img src={reply.userPhoto} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">{reply.username[0]}</div>}
                </div>
                <div className="flex-1 min-w-0 bg-white/[0.03] rounded-2xl px-4 py-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-zinc-100">@{reply.username}</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed break-words font-medium">{reply.text}</p>
                </div>
              </div>
            ))}
            {replies.length > 3 && (
              <button onClick={() => setVisibleComments(prev => prev > 3 ? 3 : prev + 5)} className="w-full py-2 text-[10px] font-black text-violet-400 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2">
                {visibleComments > 3 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {visibleComments > 3 ? 'Recolher Conversa' : `Ver mais ${replies.length - 3} respostas`}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}