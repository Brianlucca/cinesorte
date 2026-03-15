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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full sm:max-w-lg bg-zinc-950 sm:rounded-2xl rounded-t-3xl border border-zinc-800 overflow-hidden flex flex-col transition-all duration-500 ease-out transform ${animateShow ? 'translate-y-0' : 'translate-y-8'}`}
        style={{ maxHeight: '92vh' }}>

        {form.step === 1 && (
          <div className="flex flex-col h-full" style={{ maxHeight: '92vh' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-800/80 shrink-0">
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Nova Avaliação</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Busque um filme ou série</p>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="px-4 py-3 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Digite o título..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors placeholder:text-zinc-600"
                  value={form.query}
                  onChange={(e) => actions.setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ minHeight: 0 }}>
              {form.results.length > 0 ? (
                <div className="space-y-1">
                  {form.results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => actions.handleSelectMedia(item)}
                      className="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all group text-left"
                    >
                      <div className="w-10 h-14 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                        {item.poster_path ? (
                          <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600"><Film size={16} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-violet-400 transition-colors">{item.title || item.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-600 mt-0.5">
                          <span className="uppercase font-bold">{item.media_type === 'tv' ? 'Série' : 'Filme'}</span>
                          <span>·</span>
                          <span>{(item.release_date || item.first_air_date)?.split('-')[0] || '—'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : form.query.length > 2 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                  <Film size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">Nenhum resultado</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-700">
                  <Search size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">Digite para buscar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {form.step === 2 && (
          <div className="flex flex-col" style={{ maxHeight: '92vh' }}>
            <div className="relative h-36 shrink-0 overflow-hidden">
              {backdropUrl ? (
                <>
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-110" style={{ backgroundImage: `url(${backdropUrl})`, filter: 'blur(8px)' }} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950" />
                </>
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              <button
                onClick={() => actions.setPostStep(1)}
                className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full text-xs font-bold transition-all backdrop-blur-sm"
              >
                <ChevronLeft size={14} /> Voltar
              </button>

              <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 text-white/70 hover:text-white bg-black/30 rounded-full transition-all">
                <X size={16} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 px-4 pb-0 flex items-end gap-4">
                <div
                  className="w-20 h-28 rounded-xl shadow-2xl overflow-hidden border border-zinc-700 shrink-0 -mb-8 cursor-pointer group relative"
                  onClick={() => actions.setPostStep(1)}
                >
                  {form.media?.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w342${form.media.poster_path}`} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Film size={20} className="text-zinc-600" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-black text-white uppercase">Trocar</span>
                  </div>
                </div>
                <div className="pb-2 min-w-0 flex-1">
                  <h3 className="font-black text-white text-lg leading-tight truncate drop-shadow-lg">{form.media?.title || form.media?.name}</h3>
                  {(form.media?.release_date || form.media?.first_air_date) && (
                    <div className="flex items-center gap-1 text-zinc-400 text-xs mt-0.5">
                      <Calendar size={11} className="text-violet-400" />
                      <span>{(form.media.release_date || form.media.first_air_date)?.split('-')[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col px-4 pt-12 pb-4 overflow-y-auto" style={{ minHeight: 0 }}>
              <div className="flex justify-center mb-5">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => actions.setRating(star)}
                      className="group focus:outline-none transition-transform hover:-translate-y-0.5 active:scale-90"
                    >
                      <Star
                        size={28}
                        className={`transition-all duration-200 ${star <= form.rating ? 'fill-yellow-500 text-yellow-500' : 'fill-zinc-800 text-zinc-700 group-hover:text-zinc-600'}`}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={form.text}
                onChange={(e) => actions.setPostText(e.target.value)}
                placeholder="Escreva sua opinião sobre este título..."
                className="w-full flex-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/60 text-white text-sm rounded-xl p-4 resize-none placeholder:text-zinc-600 focus:outline-none transition-colors leading-relaxed"
                style={{ minHeight: '120px' }}
                autoFocus
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-zinc-600 font-medium">{form.text.length} caracteres</span>
                <button
                  onClick={actions.handlePostSubmit}
                  disabled={form.isSubmitting || !form.text.trim()}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-violet-600/20"
                >
                  {form.isSubmitting ? <Loader2 className="animate-spin" size={15} /> : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}