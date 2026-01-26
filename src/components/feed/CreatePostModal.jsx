import { useState, useEffect } from 'react';
import { X, Search, Star, Loader2, Film, ChevronLeft, Calendar } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, form, actions }) {
  const [animateShow, setAnimateShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => setAnimateShow(true), 10);
    } else {
        setAnimateShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropUrl = form.media?.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${form.media.backdrop_path}` 
    : null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${animateShow ? 'opacity-100' : 'opacity-0'}`}>
        
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
        
        <div 
            className={`relative w-full max-w-2xl bg-zinc-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col transition-all duration-500 ease-out transform ${
                animateShow ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
            }`}
            style={{ height: form.step === 1 ? '600px' : 'auto', minHeight: '500px' }}
        >
            
            <div className="absolute top-4 right-4 z-50">
                <button 
                    onClick={onClose} 
                    className="p-2 bg-black/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-colors backdrop-blur-sm border border-white/5"
                >
                    <X size={20} />
                </button>
            </div>

            {form.step === 1 && (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-8 pb-0">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Nova Avaliação</h2>
                        <p className="text-zinc-400 text-lg">Busque o filme ou série que você assistiu.</p>
                    </div>

                    <div className="px-8 mt-8">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-500 transition-colors" size={24} />
                            <input 
                                type="text"
                                autoFocus
                                placeholder="Digite o título..."
                                className="w-full bg-zinc-900/50 border-2 border-zinc-800 text-white rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:border-violet-500 focus:bg-zinc-900 transition-all text-xl placeholder:text-zinc-600"
                                value={form.query}
                                onChange={(e) => actions.setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 mt-6 pb-6">
                        {form.results.length > 0 ? (
                            <div className="grid gap-2">
                                {form.results.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => actions.handleSelectMedia(item)}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all group text-left w-full"
                                    >
                                        <div className="w-12 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-lg relative">
                                            {item.poster_path ? (
                                                <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film size={20} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-white text-base truncate group-hover:text-violet-400 transition-colors">{item.title || item.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                <span className="uppercase font-bold tracking-wider">{item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                                                <span>•</span>
                                                <span>{(item.release_date || item.first_air_date)?.split('-')[0] || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:border-violet-500 group-hover:text-violet-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronLeft size={16} className="rotate-180" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : form.query.length > 2 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                                <Film size={32} className="mb-2 opacity-50" />
                                <p>Nenhum resultado encontrado.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {form.step === 2 && (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 bg-zinc-950">
                    
                    <div className="relative h-48 w-full shrink-0 overflow-hidden">
                        {backdropUrl && (
                            <>
                                <div className="absolute inset-0 bg-cover bg-center blur-sm scale-105 opacity-50" style={{ backgroundImage: `url(${backdropUrl})` }} />
                                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/60 to-zinc-950" />
                            </>
                        )}
                        
                        <div className="absolute inset-0 flex items-end p-6 z-10 gap-5">
                            <div className="w-24 h-36 rounded-lg shadow-2xl overflow-hidden border-2 border-zinc-800 shrink-0 bg-zinc-900 -mb-10 relative group cursor-pointer" onClick={() => actions.setPostStep(1)}>
                                <img 
                                    src={`https://image.tmdb.org/t/p/w342${form.media.poster_path}`} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">Trocar</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                                <h3 className="text-2xl font-black text-white leading-tight drop-shadow-lg truncate">{form.media.title || form.media.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-zinc-300 font-medium mt-1">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-violet-400" /> {(form.media.release_date || form.media.first_air_date)?.split('-')[0]}</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => actions.setPostStep(1)}
                            className="absolute top-4 left-4 z-20 flex items-center gap-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md text-sm font-medium transition-all"
                        >
                            <ChevronLeft size={16} /> Voltar
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col p-6 pt-12">
                        
                        <div className="flex justify-center mb-8">
                            <div className="flex gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => actions.setRating(star)} 
                                        className="group focus:outline-none transition-transform hover:-translate-y-1"
                                    >
                                        <Star 
                                            size={32} 
                                            className={`transition-all duration-300 ${star <= form.rating ? 'fill-yellow-500 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'fill-zinc-800 text-zinc-700 group-hover:text-zinc-600'}`} 
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <textarea
                                value={form.text}
                                onChange={(e) => actions.setPostText(e.target.value)}
                                placeholder="Escreva sua opinião..."
                                className="w-full h-full bg-transparent text-white text-lg resize-none placeholder:text-zinc-600 focus:outline-none custom-scrollbar leading-relaxed"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                {form.text.length} Caracteres
                            </span>
                            <button 
                                onClick={actions.handlePostSubmit}
                                disabled={form.isSubmitting || !form.text.trim()}
                                className="px-8 py-3 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 transition-all active:scale-95"
                            >
                                {form.isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}