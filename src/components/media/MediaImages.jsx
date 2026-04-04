import { useState, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function MediaImages({ images }) {
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedImage(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!images || (images.backdrops.length === 0 && images.posters.length === 0)) return null;

    const backdrops = images.backdrops?.slice(0, 25) || [];
    const posters = images.posters?.slice(0, 25) || [];

    return (
        <section className="w-full">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                Galeria
            </h2>

            <div className="space-y-10">
                {backdrops.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Ambiente & Cenas</h3>
                        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {backdrops.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedImage(img.file_path)}
                                    className="relative flex-none w-72 md:w-96 aspect-video rounded-2xl overflow-hidden group border border-white/5 bg-zinc-900/50 shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w780${img.file_path}`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={`Backdrop ${idx}`}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <Maximize2 className="text-white/80 drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" size={32} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {posters.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Posters Oficiais</h3>
                        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {posters.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedImage(img.file_path)}
                                    className="relative flex-none w-32 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden group border border-white/5 bg-zinc-900/50 shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        alt={`Poster ${idx}`}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <Maximize2 className="text-white/80 drop-shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" size={28} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-[100000] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 md:top-8 md:right-8 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-full transition-all shadow-lg z-[100001]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X size={24} />
                    </button>
                    
                    <img 
                        src={`https://image.tmdb.org/t/p/original${selectedImage}`} 
                        className="max-w-full max-h-[90vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 object-contain border border-white/5 select-none"
                        alt="Zoom"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>,
                document.body
            )}
        </section>
    );
}