import { useState } from "react";
import { Star, MessageCircle, Send, Trash2, User, CornerDownRight, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PersonReviewsSection({ reviews, onPostReview, onReply, onDelete }) {
  const { user } = useAuth();
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async () => {
    if (!newReviewText.trim()) return;
    setIsPosting(true);
    await onPostReview(newRating, newReviewText);
    setNewReviewText("");
    setNewRating(5);
    setIsPosting(false);
  };

  return (
    <section className="py-8 mt-8 border-t border-white/5">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Comentários e Avaliações</h2>
        <span className="text-sm text-zinc-500">{reviews?.length || 0} opiniões</span>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/5 mb-10">
        <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" />
                ) : (
                    <User className="text-zinc-500" />
                )}
            </div>
            <div className="flex-1">
                <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setNewRating(s)} className="focus:outline-none transition-transform active:scale-95 hover:scale-110">
                            <Star size={24} className={s <= newRating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700 fill-zinc-900"} />
                        </button>
                    ))}
                </div>
                <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Escreva sua opinião sobre este artista..."
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-violet-500 min-h-[100px] resize-none transition-colors"
                />
                <div className="flex justify-end mt-3">
                    <button 
                        onClick={handleSubmit}
                        disabled={isPosting || !newReviewText.trim()}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <Send size={16} /> {isPosting ? 'Enviando...' : 'Publicar'}
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map(review => (
            <PersonReviewCard 
                key={review.id} 
                review={review} 
                currentUser={user} 
                onReply={onReply}
                onDelete={onDelete}
            />
        ))}
      </div>
    </section>
  );
}

function PersonReviewCard({ review, currentUser, onReply, onDelete }) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showReplies, setShowReplies] = useState(false);

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date._seconds * 1000).toLocaleDateString('pt-BR');
    };

    const submitReply = async () => {
        if(!replyText.trim()) return;
        await onReply(review.id, replyText);
        setReplyText("");
        setIsReplying(false);
        setShowReplies(true);
    };

    const replies = review.replies || [];

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg transition-colors hover:border-zinc-700">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
                            {review.userPhoto ? (
                                <img src={review.userPhoto} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">
                                    {review.username?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{review.username}</h4>
                            <span className="text-xs text-zinc-500">{formatDate(review.createdAt)}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex gap-0.5 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"} />
                            ))}
                        </div>
                        {currentUser?.uid === review.userId && (
                            <button onClick={() => onDelete(review.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-zinc-300 text-sm leading-relaxed mb-6 pl-13 whitespace-pre-wrap">
                    {review.text}
                </p>

                <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                    <button 
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <MessageCircle size={18} /> Responder
                    </button>
                </div>

                {isReplying && (
                    <div className="mt-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input 
                            autoFocus
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Escreva uma resposta..."
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-all"
                        />
                        <button onClick={submitReply} className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg transition-colors">
                            <Send size={16} />
                        </button>
                    </div>
                )}
            </div>

            {replies.length > 0 && (
                <div className="bg-black/20 border-t border-white/5 p-4">
                    {showReplies ? (
                        <div className="space-y-4">
                            {replies.map(reply => (
                                <div key={reply.id} className="flex gap-3 pl-4 animate-in fade-in border-l-2 border-zinc-800 ml-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-white">{reply.username}</span>
                                            <span className="text-[10px] text-zinc-600">• {formatDate(reply.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 leading-snug">{reply.text}</p>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => setShowReplies(false)}
                                className="w-full text-center text-xs text-zinc-500 hover:text-white mt-2 flex items-center justify-center gap-1"
                            >
                                <ChevronUp size={14} /> Ocultar respostas
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowReplies(true)}
                            className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-2 pl-2 transition-colors"
                        >
                            <CornerDownRight size={14} /> Ver {replies.length} respostas
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}