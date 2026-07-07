import { useState } from "react";
import { Star, MessageCircle, Send, Trash2, User, CornerDownRight, ChevronUp, Edit2, X, Check } from "lucide-react";
import { useAuth } from "@shared/context/useAuth";

export default function PersonReviewsSection({ reviews, onPostReview, onEditReview, onReply, onEditReply, onDelete, onDeleteComment }) {
  const { user } = useAuth();
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!newReviewText.trim()) return;
    setIsPosting(true);
    await onPostReview(newRating, newReviewText);
    setNewReviewText("");
    setNewRating(5);
    setIsPosting(false);
    setIsFocused(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
          Discussão Geral
        </h2>
        <span className="bg-white/10 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold border border-white/5">
          {reviews?.length || 0} opiniões
        </span>
      </div>

      <div className="flex gap-5 mb-12">
        <div className="shrink-0 hidden sm:block">
          <div className="w-14 h-14 rounded-full bg-zinc-800 ring-4 ring-zinc-900/50 overflow-hidden flex items-center justify-center text-white font-bold uppercase text-xl shadow-lg">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <User size={24} className="text-zinc-500" />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div
            className={`relative bg-zinc-900/50 backdrop-blur-md border rounded-2xl transition-all duration-300 ${
              isFocused ? "border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] z-50" : "border-white/10 hover:border-white/20"
            }`}
          >
            {isFocused && (
              <div className="px-5 pt-5 flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="text-sm font-medium text-zinc-400">Sua nota:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setNewRating(star)} className="hover:scale-110 transition-transform focus:outline-none">
                      <Star
                        size={24}
                        className={star <= newRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700 hover:text-zinc-500"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Escreva sua opinião sobre este artista..."
              className={`w-full bg-transparent text-zinc-100 px-6 py-5 focus:outline-none resize-none text-base placeholder:text-zinc-600 ${
                isFocused ? "min-h-[140px]" : "min-h-[60px]"
              }`}
            />

            {isFocused && (
              <div className="flex flex-col px-5 pb-5">
                <div className="flex justify-between items-center w-full mt-2">
                  <span className={`text-xs font-medium ${newReviewText.length > 450 ? 'text-yellow-500' : 'text-zinc-500'}`}>
                    {newReviewText.length}/500
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFocused(false)}
                      className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isPosting || !newReviewText.trim()}
                      className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Send size={16} /> {isPosting ? 'Enviando...' : 'Publicar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={review.id} className={index !== reviews.length - 1 ? "border-b border-white/5 pb-8 mb-8" : ""}>
            <PersonReviewCard 
              review={review} 
              currentUser={user} 
              onReply={onReply}
              onEditReview={onEditReview}
              onEditReply={onEditReply}
              onDelete={onDelete}
              onDeleteComment={onDeleteComment}
            />
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="text-center py-12 border border-white/5 border-dashed rounded-3xl bg-white/[0.01]">
            <p className="text-zinc-500 font-medium">Nenhuma avaliação ainda. Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonReviewCard({ review, currentUser, onReply, onEditReview, onEditReply, onDelete, onDeleteComment }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editReviewText, setEditReviewText] = useState(review.text);
  const [editRating, setEditRating] = useState(review.rating || 5);

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

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

  const saveReviewEdit = async () => {
    if (!editReviewText.trim()) return;
    await onEditReview(review.id, editReviewText, editRating);
    setIsEditing(false);
  };

  const startEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditReplyText(reply.text);
  };

  const saveReplyEdit = async (replyId) => {
    if (!editReplyText.trim()) return;
    await onEditReply(replyId, editReplyText, review.id);
    setEditingReplyId(null);
    setEditReplyText("");
  };

  const replies = review.replies || [];
  
  const isOwner = currentUser && (currentUser.uid === review.userId || currentUser.id === review.userId || currentUser.username === review.username);

  return (
    <div className="flex gap-4 sm:gap-5 w-full">
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden border border-white/10 shadow-lg">
          {review.userPhoto ? (
            <img src={review.userPhoto} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold uppercase">
              {review.username?.[0]}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-white text-base truncate">{review.username}</h4>
              <span className="text-xs text-zinc-500">• {formatDate(review.createdAt)} {review.isEdited && "(editado)"}</span>
            </div>
            
            {!isEditing && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5 bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"} />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {isOwner && !isEditing && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(true)} className="text-zinc-500 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 transition-colors p-2 rounded-xl shadow-sm">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onDelete(review.id)} className="text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors p-2 rounded-xl shadow-sm">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mb-4 animate-in fade-in">
            <div className="flex gap-1.5 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setEditRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                  <Star size={18} className={star <= editRating ? "fill-yellow-400 text-yellow-400" : "fill-zinc-800 text-zinc-700 hover:text-zinc-500"} />
                </button>
              ))}
            </div>
            <textarea
              value={editReviewText}
              onChange={(e) => setEditReviewText(e.target.value)}
              className="w-full bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner placeholder:text-zinc-600 min-h-[100px] resize-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setIsEditing(false); setEditReviewText(review.text); setEditRating(review.rating); }} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={saveReviewEdit} className="bg-violet-600 text-white hover:bg-violet-500 px-5 py-2 rounded-lg transition-colors text-xs font-bold shadow-lg flex items-center gap-1.5">
                <Check size={14} /> Salvar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap font-light">
            {review.text}
          </p>
        )}

        {!isEditing && (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <MessageCircle size={16} /> Responder
            </button>
            {replies.length > 0 && !showReplies && (
              <button 
                onClick={() => setShowReplies(true)}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-violet-400 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <CornerDownRight size={14} /> {replies.length} {replies.length === 1 ? 'resposta' : 'respostas'}
              </button>
            )}
          </div>
        )}

        {isReplying && !isEditing && (
          <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
            <input 
              autoFocus
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escreva uma resposta..."
              className="flex-1 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-all shadow-inner placeholder:text-zinc-600"
            />
            <button onClick={submitReply} disabled={!replyText.trim()} className="bg-white text-black hover:bg-zinc-200 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center">
              <Send size={16} />
            </button>
          </div>
        )}

        {showReplies && replies.length > 0 && !isEditing && (
          <div className="mt-6 space-y-5 bg-white/[0.01] rounded-2xl p-4 md:p-6 border border-white/5">
            {replies.map(reply => {
              const isReplyOwner = currentUser && (currentUser.uid === reply.userId || currentUser.id === reply.userId || currentUser.username === reply.username);

              return (
                <div key={reply.id} className="flex gap-4 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-white/10">
                     <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold uppercase text-xs">
                       {reply.username?.[0]}
                     </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{reply.username}</span>
                        <span className="text-[10px] text-zinc-500">• {formatDate(reply.createdAt)}</span>
                      </div>
                      {isReplyOwner && editingReplyId !== reply.id && (
                        <div className="flex items-center gap-2 ml-4">
                          <button onClick={() => startEditReply(reply)} className="text-zinc-500 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 transition-colors p-1.5 rounded-lg shadow-sm">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => onDeleteComment(reply.id)} className="text-zinc-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-colors p-1.5 rounded-lg shadow-sm">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingReplyId === reply.id ? (
                      <div className="mt-2 flex gap-2">
                        <input 
                          autoFocus
                          type="text"
                          value={editReplyText}
                          onChange={(e) => setEditReplyText(e.target.value)}
                          className="flex-1 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-all"
                        />
                        <button onClick={() => saveReplyEdit(reply.id)} className="bg-violet-600 text-white hover:bg-violet-500 p-1.5 rounded-lg transition-colors">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingReplyId(null)} className="bg-zinc-800 text-zinc-400 hover:text-white p-1.5 rounded-lg transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 leading-relaxed font-light">{reply.text}</p>
                    )}
                  </div>
                </div>
              );
            })}
            <button 
              onClick={() => setShowReplies(false)}
              className="w-full text-center text-xs text-zinc-500 hover:text-white mt-2 flex items-center justify-center gap-1 font-bold uppercase tracking-wider"
            >
              <ChevronUp size={14} /> Ocultar respostas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}