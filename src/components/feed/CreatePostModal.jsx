import { useState, useEffect } from 'react';
import { X, Search, Star, Loader2, Film, ChevronLeft, Calendar } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, form, actions }) {
  const [animateShow, setAnimateShow] = useState(false);

  useEffect(() => {
    if (isOpen) setTimeout(() => setAnimateShow(true), 10);
    else setAnimateShow(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropUrl = form.media?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${form.media.backdrop_path}`
    : null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center transition-all duration-300 ${animateShow ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className={`relative w-full sm:max-w-xl bg-zinc-950/90 backdrop-blur-2xl sm:rounded-[2.5rem] rounded-t-[2.5rem] border border-white/10 overflow-hidden flex flex-col transition-all duration-500 ease-out transform ${animateShow ? 'translate-y-0' : 'translate-y-12'} shadow-[0_0_50px_rgba(0,0,0,0.5)]`}
        style={{ maxHeight: '92vh' }}>

        {form.step === 1 && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-8 pt-8 pb-6 shrink-0">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                  Nova Avaliação
                </h2>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-4.5">O que você assistiu?</p>
              </div>
              <button onClick={onClose} className="p-3 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="px-8 pb-4 shrink-0">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Pesquisar filme ou série..."
                  className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 text-white text-base rounded-2xl pl-12 pr-4 py-4 focus:outline-none transition-all placeholder:text-zinc-600 shadow-inner"
                  value={form.query}
                  onChange={(e) => actions.setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {form.results.length > 0 ? (
                <div className="space-y-2">
                  {form.results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => actions.handleSelectMedia(item)}
                      className="flex items-center gap-4 p-3 w-full rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
                    >
                      <div className="w-12 h-16 bg-zinc-800 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/5">
                        {item.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-100 text-base truncate group-hover:text-violet-400 transition-colors">{item.title || item.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-wider mt-1">
                          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                          <span>·</span>
                          <span className="text-zinc-400">{(item.release_date || item.first_air_date)?.split('-')[0] || '—'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : form.query.length > 2 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Film size={32} className="opacity-20" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-40">Nenhum título encontrado</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-700 animate-in fade-in">
                  <Search size={40} className="mb-4 opacity-10" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-30 text-center px-10">Busque por títulos, franquias ou personagens</p>
                </div>
              )}
            </div>
          </div>
        )}

        {form.step === 2 && (
          <div className="flex flex-col">
            <div className="relative h-48 shrink-0 overflow-hidden">
              {backdropUrl ? (
                <>
                  <img 
                    src={backdropUrl} 
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />
                </>
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
                <button
                  onClick={() => actions.setPostStep(1)}
                  className="flex items-center gap-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all backdrop-blur-xl border border-white/10"
                >
                  <ChevronLeft size={14} /> Alterar
                </button>

                <button onClick={onClose} className="p-2.5 text-white/70 hover:text-white bg-black/40 rounded-2xl transition-all border border-white/10 backdrop-blur-xl">
                  <X size={18} />
                </button>
              </div>

              <div className="absolute bottom-0 left-8 right-8 flex items-end gap-6">
                <div
                  className="w-24 h-36 rounded-[1.5rem] shadow-2xl overflow-hidden border-2 border-white/10 shrink-0 -mb-10 relative group"
                >
                  {form.media?.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w342${form.media.poster_path}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Film size={24} className="text-zinc-600" /></div>
                  )}
                </div>
                <div className="pb-4 min-w-0 flex-1">
                  <h3 className="font-black text-white text-2xl leading-tight truncate drop-shadow-2xl">{form.media?.title || form.media?.name}</h3>
                  {(form.media?.release_date || form.media?.first_air_date) && (
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
                      <Calendar size={12} className="text-violet-500" />
                      <span>{(form.media.release_date || form.media.first_air_date)?.split('-')[0]}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-violet-400">{form.media.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col px-8 pt-16 pb-8">
              <div className="flex flex-col items-center mb-8">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Sua Nota</span>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => actions.setRating(star)}
                      className="focus:outline-none transition-all hover:scale-125 active:scale-90"
                    >
                      <Star
                        size={32}
                        className={`transition-all duration-300 ${star <= form.rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'fill-white/5 text-zinc-800 hover:text-zinc-600'}`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={form.text}
                  onChange={(e) => actions.setPostText(e.target.value)}
                  placeholder="O que você achou dessa obra?"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-violet-500/50 text-white text-base rounded-[1.5rem] p-6 resize-none placeholder:text-zinc-600 focus:outline-none transition-all leading-relaxed shadow-inner min-h-[160px]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${form.text.length > 450 ? 'text-yellow-500' : 'text-zinc-600'}`}>
                    {form.text.length} / 500
                  </span>
                </div>
                <button
                  onClick={actions.handlePostSubmit}
                  disabled={form.isSubmitting || !form.text.trim()}
                  className="px-10 py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                >
                  {form.isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}