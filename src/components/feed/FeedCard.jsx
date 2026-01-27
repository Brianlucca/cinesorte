import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MoreVertical, Trash2, MessageCircle, User, Share2, Heart, ChevronDown, ChevronUp, Crown, Layers, Film, Loader2 } from "lucide-react";

export default function FeedCard({ item, currentUser, onDelete, onLike, onLoadComments }) {
  const [showMenu, setShowMenu] = useState(false);
  const [visibleComments, setVisibleComments] = useState(3);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const isListShare = item.type === 'list_share';
  const isMaster = item.levelTitle === "Mestre da Crítica";

  const displayUsername = item.username || item.nickname || "Anônimo";
  const photoURL = item.userPhoto || item.photoURL || null;
  
  const replies = item.replies || [];
  const commentsCount = item.commentsCount || 0;
  
  const isOwner = currentUser?.uid === item.userId;
  
  const isLiked = !!item.isLikedByCurrentUser;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString._seconds ? dateString._seconds * 1000 : dateString);
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date);
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

  if (isListShare) {
    const listPreviewImages = item.listItems?.slice(0, 4).map(i => i.poster_path) || [];
    
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8 shadow-xl">
            <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-zinc-900/50">
                <Link to={`/app/profile/${item.username}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                        {photoURL ? <img src={photoURL} className="w-full h-full object-cover" /> : <User className="p-2 text-zinc-500" />}
                    </div>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link to={`/app/profile/${item.username}`} className="font-bold text-white text-sm hover:text-violet-400">{displayUsername}</Link>
                        <span className="text-zinc-500 text-xs">• compartilhou uma coleção</span>
                    </div>
                    <span className="text-xs text-zinc-600">{formatDate(item.createdAt)}</span>
                </div>
            </div>

            <div className="p-5">
                <p className="text-zinc-300 mb-4">{item.content}</p>
                <Link to={`/app/lists/${item.username}/${item.attachmentId}`} className="block group">
                    <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 group-hover:border-violet-500/50 transition-colors">
                        <div className="grid grid-cols-4 gap-0.5 h-32 opacity-80 group-hover:opacity-100 transition-opacity">
                            {listPreviewImages.length > 0 ? listPreviewImages.map((img, idx) => (
                                <div key={idx} className="bg-zinc-800 relative">
                                    <img src={`https://image.tmdb.org/t/p/w342${img}`} className="w-full h-full object-cover" />
                                </div>
                            )) : (
                                <div className="col-span-4 flex items-center justify-center bg-zinc-800 text-zinc-600">
                                    <Layers size={32} />
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-zinc-900 relative">
                            <div className="flex items-center gap-2 mb-1">
                                <Layers size={16} className="text-violet-500" />
                                <h3 className="font-bold text-white text-lg">{item.listName || 'Minha Coleção'}</h3>
                            </div>
                            <p className="text-xs text-zinc-500">{item.listCount || 0} itens • Curadoria por {displayUsername}</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
  }

  const imagePath = item.backdropPath || item.posterPath;
  const imageUrl = imagePath ? `https://image.tmdb.org/t/p/original${imagePath.startsWith('/') ? imagePath : '/' + imagePath}` : null;
  
  const rawId = item.mediaId ? item.mediaId.toString() : "";
  const cleanId = rawId.replace(/^(person-|movie-|tv-)/, '');
  
  let mediaLink = `/app/${item.mediaType || 'movie'}/${cleanId}`;
  if (item.mediaType === 'person') {
      mediaLink = `/app/person/${cleanId}`;
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden mb-8 shadow-xl transition-all ${isMaster ? 'bg-zinc-900 border border-amber-500/30 shadow-amber-900/10' : 'bg-zinc-900 border border-zinc-800'}`}>
      
      {isMaster && (
          <div className="bg-gradient-to-r from-zinc-900 via-amber-900/10 to-amber-900/20 border-b border-amber-500/20 py-1.5 px-4 flex justify-end">
              <div className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Crown size={11} fill="currentColor" /> Veredito do Mestre
              </div>
          </div>
      )}

      <div className="flex justify-between items-center p-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <Link to={`/app/profile/${item.username}`} className="block relative group/avatar">
            <div className={`w-11 h-11 rounded-full overflow-hidden p-0.5 ${isMaster ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-zinc-800 border border-white/10'}`}>
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900">
                    {photoURL ? (
                        <img src={photoURL} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">{displayUsername.charAt(0)}</div>
                    )}
                </div>
            </div>
          </Link>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <Link to={`/app/profile/${item.username}`} className={`font-bold text-sm ${isMaster ? 'text-amber-500 hover:text-amber-400' : 'text-white hover:text-violet-400'}`}>
                    {displayUsername}
                </Link>
                {isMaster && <Crown size={12} className="text-amber-500" fill="currentColor" />}
             </div>
             <div className="flex items-center gap-2">
                 <span className="text-xs text-zinc-500">{formatDate(item.createdAt)}</span>
                 {item.mediaType && (
                    <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        {item.mediaType === 'tv' ? 'Série' : item.mediaType === 'person' ? 'Artista' : 'Filme'}
                    </span>
                 )}
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
             <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${isMaster ? 'bg-amber-500/10 border-amber-500/20' : 'bg-zinc-950 border-zinc-800'}`}>
                <Star size={12} className={isMaster ? "fill-amber-500 text-amber-500" : "fill-yellow-500 text-yellow-500"} />
                <span className={`text-sm font-bold ${isMaster ? 'text-amber-500' : 'text-white'}`}>{item.rating?.toFixed(1)}</span>
            </div>
            {isOwner && (
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="text-zinc-400 hover:text-white"><MoreVertical size={20} /></button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-20 py-1">
                                <button onClick={() => onDelete(item.id)} className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 text-sm flex items-center gap-2">
                                    <Trash2 size={14} /> Excluir
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>

      <Link to={mediaLink} className="block w-full bg-black aspect-[2.35/1] relative group overflow-hidden">
         {imageUrl ? (
            <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
         ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Film className="text-zinc-700" size={40} /></div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
         <div className="absolute bottom-0 left-0 w-full p-6">
             <h3 className={`text-3xl font-black text-white drop-shadow-xl truncate tracking-tight ${isMaster ? 'text-amber-100' : ''}`}>{item.mediaTitle}</h3>
         </div>
      </Link>

      <div className="p-6">
         <p className={`text-base leading-relaxed whitespace-pre-wrap ${isMaster ? 'text-zinc-100 font-normal' : 'text-zinc-300 font-light'}`}>
             {item.text}
         </p>

         <div className="mt-4 mb-2">
            {(item.likesCount > 0) && (
                <span className="text-sm font-bold text-white">
                    {item.likesCount} {item.likesCount === 1 ? 'curtida' : 'curtidas'}
                </span>
            )}
         </div>

         <div className="flex items-center gap-6 pt-3 border-t border-white/5">
            <button 
                onClick={handleLikeClick}
                className={`flex items-center gap-2 transition-all duration-200 group ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'} ${isLikeAnimating ? 'scale-125' : 'scale-100'}`}
            >
                <Heart size={20} className={isLiked ? "fill-red-500" : "group-hover:scale-110 transition-transform"} />
            </button>

            <button 
                onClick={handleLoadCommentsClick}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
            >
                <MessageCircle size={20} className="group-hover:text-violet-400 transition-colors" />
                {commentsCount > 0 && <span className="text-sm font-bold">{commentsCount}</span>}
            </button>
            
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                <Share2 size={20} className="group-hover:text-violet-400 transition-colors" />
            </button>
         </div>

         <div className="mt-4">
             {loadingComments && (
                 <div className="flex items-center gap-2 text-zinc-500 text-sm py-2">
                     <Loader2 size={14} className="animate-spin" /> Carregando comentários...
                 </div>
             )}

             {replies.length === 0 && commentsCount > 0 && !loadingComments && (
                 <button 
                     onClick={handleLoadCommentsClick}
                     className="text-xs font-bold text-zinc-500 hover:text-zinc-300 mt-2"
                 >
                     Ver todos os {commentsCount} comentários...
                 </button>
             )}

             {replies.length > 0 && (
                <div className="space-y-4 pl-4 border-l-2 border-zinc-800 mt-4">
                    {displayedReplies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 group/reply">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-white/5">
                                {reply.userPhoto ? <img src={reply.userPhoto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-500">{reply.username?.[0]}</div>}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white hover:text-violet-400 cursor-pointer">{reply.username}</span>
                                    <span className="text-[10px] text-zinc-600">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-zinc-400 mt-0.5">{reply.text}</p>
                            </div>
                        </div>
                    ))}
                    
                    {replies.length > 3 && (
                        <button 
                            onClick={() => setVisibleComments(prev => prev > 3 ? 3 : prev + 5)}
                            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-2"
                        >
                            {visibleComments > 3 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {visibleComments > 3 ? 'Ocultar' : `Ver mais ${replies.length - 3} respostas`}
                        </button>
                    )}
                </div>
             )}
         </div>
      </div>
    </div>
  );
}