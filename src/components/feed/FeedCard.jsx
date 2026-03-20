import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MoreVertical, Trash2, MessageCircle, Share2, Heart, ChevronDown, ChevronUp, Crown, Layers, Film, Loader2, Zap, Eye, Sparkles } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function buildMediaLink(item) {
  const rawId = item.mediaId?.toString() || "";

  if (item.mediaType === 'person') {
    const cleanId = rawId.replace(/^person-/, '');
    return `/app/person/${cleanId}`;
  }

  // tv-95557-s4-e3 ou 95557-s4-e3
  const episodeMatch = rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
  if (episodeMatch || item.mediaType === 'episode') {
    const match = episodeMatch || rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/);
    if (match) {
      const [, tvId, season, episode] = match;
      return `/app/tv/${tvId}/season/${parseInt(season)}/episode/${parseInt(episode)}`;
    }
  }

  // tv-95557-s4 ou 95557-s4
  const seasonMatch = rawId.match(/^(?:tv-)?(\d+)-s(\d+)$/);
  if (seasonMatch) {
    const [, tvId, season] = seasonMatch;
    return `/app/tv/${tvId}/season/${parseInt(season)}`;
  }

  const cleanId = rawId.replace(/^(movie-|tv-)/, '');
  return `/app/${item.mediaType || 'movie'}/${cleanId}`;
}

export default function FeedCard({ item, currentUser, onDelete, onLike, onLoadComments }) {
  const [showMenu, setShowMenu] = useState(false);
  const [visibleComments, setVisibleComments] = useState(3);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const toast = useToast();

  const isListShare = item.type === 'list_share';
  const eliteTitles = ["Mestre da Crítica", "Oráculo da Sétima Arte", "Entidade Cinematográfica", "Divindade do Cinema"];
  const isElite = eliteTitles.includes(item.levelTitle);

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
      case "Divindade do Cinema": return { accent: "border-l-cyan-500", badge: "text-cyan-400 bg-cyan-400/10", label: "Divindade", icon: <Eye size={10} /> };
      case "Entidade Cinematográfica": return { accent: "border-l-purple-500", badge: "text-purple-400 bg-purple-400/10", label: "Entidade", icon: <Sparkles size={10} /> };
      case "Oráculo da Sétima Arte": return { accent: "border-l-emerald-500", badge: "text-emerald-400 bg-emerald-400/10", label: "Oráculo", icon: <Zap size={10} /> };
      case "Mestre da Crítica": return { accent: "border-l-amber-500", badge: "text-amber-400 bg-amber-400/10", label: "Mestre", icon: <Crown size={10} /> };
      default: return { accent: "border-l-zinc-700", badge: "text-zinc-500 bg-zinc-800", label: "", icon: null };
    }
  };

  const style = getEliteStyle(item.levelTitle);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString._seconds ? dateString._seconds * 1000 : dateString);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Link copiado', 'Compartilhe onde quiser!'));
  };

  const handleShare = async () => {
    let shareUrl = "";
    let shareText = "";

    if (isListShare) {
      shareUrl = `${window.location.origin}/app/lists/${item.username}/${item.attachmentId}`;
      shareText = `Confira a coleção "${item.listName}" de ${displayUsername} no CineSorte!`;
    } else {
      shareUrl = `${window.location.origin}${mediaLink}`;
      shareText = `Confira a avaliação de ${displayUsername} sobre ${item.mediaTitle} no CineSorte!`;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: "CineSorte", text: shareText, url: shareUrl });
      } catch (error) {
        if (error.name !== 'AbortError') copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
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

  const displayedReplies = replies.slice(0, visibleComments);

  const getMediaTypeLabel = () => {
    if (item.mediaType === 'episode') return 'Episódio';
    const rawId = item.mediaId?.toString() || "";
    if (rawId.match(/^(?:tv-)?(\d+)-s(\d+)-e(\d+)$/)) return 'Episódio';
    if (rawId.match(/^(?:tv-)?(\d+)-s(\d+)$/)) return 'Temporada';
    if (item.mediaType === 'tv') return 'Série';
    if (item.mediaType === 'person') return 'Artista';
    return 'Filme';
  };

  if (isListShare) {
    const listItems = Array.isArray(item.listItems) ? item.listItems : [];
    const listPreviewImages = listItems.slice(0, 4).map(i => i.poster_path).filter(Boolean);
    const listLink = item.username && item.attachmentId ? `/app/lists/${item.username}/${item.attachmentId}` : "#";

    return (
      <article className="group bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/app/profile/${item.username}`}>
              <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10">
                {photoURL ? <img src={photoURL} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">{displayUsername[0]?.toUpperCase()}</div>}
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to={`/app/profile/${item.username}`} className="text-sm font-bold text-white hover:text-violet-400 transition-colors">{displayUsername}</Link>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">compartilhou</span>
              </div>
              <span className="text-[11px] text-zinc-600">{formatDate(item.createdAt)}</span>
            </div>
          </div>
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-28 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button onClick={() => onDelete(item.id, 'list_share')} className="w-full text-left px-3 py-2.5 text-red-400 hover:bg-zinc-800 text-xs font-bold flex items-center gap-2">
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {item.content && <p className="px-4 pb-3 text-sm text-zinc-400">{item.content}</p>}

        <Link to={listLink} className="block mx-4 mb-4 group/list">
          <div className="rounded-xl overflow-hidden border border-zinc-800 group-hover/list:border-violet-500/40 transition-all">
            <div className="grid grid-cols-4 h-28">
              {listPreviewImages.length > 0 ? listPreviewImages.map((img, idx) => (
                <div key={idx} className="relative overflow-hidden">
                  <img src={`https://image.tmdb.org/t/p/w342${img}`} className="w-full h-full object-cover group-hover/list:scale-105 transition-transform duration-500" alt="" />
                </div>
              )) : [...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-zinc-800 flex items-center justify-center">
                  <Film size={16} className="text-zinc-700" />
                </div>
              ))}
              {listPreviewImages.length > 0 && listPreviewImages.length < 4 && [...Array(4 - listPreviewImages.length)].map((_, idx) => (
                <div key={`e-${idx}`} className="bg-zinc-800 flex items-center justify-center">
                  <Film size={16} className="text-zinc-700" />
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-zinc-800/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-violet-500 shrink-0" />
                  <span className="font-bold text-white text-sm group-hover/list:text-violet-400 transition-colors">{item.listName || "Coleção"}</span>
                </div>
                <span className="text-[11px] text-zinc-500 mt-0.5 block">{item.listCount || listItems.length || 0} filmes e séries</span>
              </div>
              <div className="text-[10px] font-bold text-violet-500 uppercase tracking-wider opacity-0 group-hover/list:opacity-100 transition-opacity">Ver →</div>
            </div>
          </div>
        </Link>

        <div className="px-4 pb-4 flex items-center gap-4 border-t border-zinc-800/50 pt-3">
          <button onClick={handleShare} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={`group bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 border-l-2 ${style.accent}`}>

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/app/profile/${item.username}`}>
            <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden ring-1 ring-white/10">
              {photoURL ? <img src={photoURL} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">{displayUsername[0]?.toUpperCase()}</div>}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/app/profile/${item.username}`} className="text-sm font-bold text-white hover:text-violet-400 transition-colors">{displayUsername}</Link>
              {isElite && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${style.badge}`}>
                  {style.icon} {style.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-600">
              <span>{formatDate(item.createdAt)}</span>
              <span className="uppercase tracking-wider font-medium">· {getMediaTypeLabel()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-black text-white">{item.rating?.toFixed(1)}</span>
          </div>
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-zinc-800">
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-28 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden">
                    <button onClick={() => onDelete(item.id, 'review')} className="w-full text-left px-3 py-2.5 text-red-400 hover:bg-zinc-800 text-xs font-bold flex items-center gap-2">
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Link to={mediaLink} className="block relative overflow-hidden">
        {item.backdropPath ? (
          <div className="aspect-[2.5/1] relative">
            <img
              src={`https://image.tmdb.org/t/p/original${item.backdropPath.startsWith('/') ? item.backdropPath : '/' + item.backdropPath}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-2xl font-black text-white tracking-tight leading-tight drop-shadow-lg line-clamp-1">{item.mediaTitle}</h3>
            </div>
          </div>
        ) : item.posterPath ? (
          <div className="flex items-center gap-4 px-4 py-4 bg-zinc-800/40">
            <img
              src={`https://image.tmdb.org/t/p/w342${item.posterPath.startsWith('/') ? item.posterPath : '/' + item.posterPath}`}
              className="w-16 h-24 object-cover rounded-lg shrink-0 shadow-lg"
              alt=""
            />
            <div>
              <h3 className="text-xl font-black text-white tracking-tight leading-tight line-clamp-2">{item.mediaTitle}</h3>
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mt-1 block">{getMediaTypeLabel()}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 px-4 py-4 bg-zinc-800/40">
            <div className="w-16 h-24 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
              <Film size={24} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight leading-tight line-clamp-2">{item.mediaTitle}</h3>
          </div>
        )}
      </Link>

      <div className="p-4">
        {item.text ? (
          <div className="mb-4">
            <p className="text-sm text-zinc-300 leading-relaxed">
              {isExpanded || item.text.length <= MAX_TEXT_LENGTH ? item.text : `${item.text.slice(0, MAX_TEXT_LENGTH)}...`}
              {item.text.length > MAX_TEXT_LENGTH && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-violet-400 hover:text-violet-300 font-bold ml-1 text-xs">
                  {isExpanded ? "menos" : "mais"}
                </button>
              )}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={22} className={star <= item.rating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700"} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-5">
            <button onClick={handleLikeClick} className={`flex items-center gap-1.5 transition-all duration-200 ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'} ${isLikeAnimating ? 'scale-125' : 'scale-100'}`}>
              <Heart size={17} className={isLiked ? "fill-red-500" : ""} />
              {item.likesCount > 0 && <span className="text-xs font-bold">{item.likesCount}</span>}
            </button>
            <button onClick={handleLoadCommentsClick} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
              <MessageCircle size={17} />
              {commentsCount > 0 && <span className="text-xs font-bold">{commentsCount}</span>}
            </button>
            <button onClick={handleShare} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <Share2 size={17} />
            </button>
          </div>
        </div>

        {(loadingComments || replies.length > 0 || (commentsCount > 0 && replies.length === 0)) && (
          <div className="mt-4">
            {loadingComments && (
              <div className="flex items-center gap-2 text-zinc-600 text-xs py-2">
                <Loader2 size={12} className="animate-spin" /> Carregando...
              </div>
            )}
            {replies.length === 0 && commentsCount > 0 && !loadingComments && (
              <button onClick={handleLoadCommentsClick} className="text-xs text-zinc-600 hover:text-zinc-400 font-medium transition-colors">
                Ver {commentsCount} {commentsCount === 1 ? 'comentário' : 'comentários'}
              </button>
            )}
            {replies.length > 0 && (
              <div className="space-y-3 mt-2 pl-3 border-l border-zinc-800">
                {displayedReplies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden shrink-0 mt-0.5">
                      {reply.userPhoto ? <img src={reply.userPhoto} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">{reply.username?.[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0 bg-zinc-800/50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white">{reply.username}</span>
                        <span className="text-[10px] text-zinc-600">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed break-words">{reply.text}</p>
                    </div>
                  </div>
                ))}
                {replies.length > 3 && (
                  <button onClick={() => setVisibleComments(prev => prev > 3 ? 3 : prev + 5)} className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 pl-9">
                    {visibleComments > 3 ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    {visibleComments > 3 ? 'Ocultar' : `${replies.length - 3} mais`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}