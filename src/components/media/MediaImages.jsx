import { useState, useEffect } from 'react';
import { X, Maximize2, Image as ImageIcon } from 'lucide-react';
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
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-4 border-l-4 border-violet-600 ml-4 md:ml-0">
                <div className="p-2 bg-violet-600/20 rounded-lg">
                    <ImageIcon className="text-violet-500" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">Galeria</h2>
            </div>

            <div className="space-y-10">
                {backdrops.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 px-4">Ambiente & Cenas</h3>
                        <div className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            {backdrops.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedImage(img.file_path)}
                                    className="relative flex-none w-72 md:w-96 aspect-video rounded-2xl overflow-hidden group border border-white/5 bg-zinc-900 shadow-lg hover:shadow-violet-900/20 transition-all hover:scale-[1.02] hover:border-violet-500/30"
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w780${img.file_path}`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={`Backdrop ${idx}`}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <Maximize2 className="text-white drop-shadow-lg" size={32} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {posters.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4 px-4">Posters Oficiais</h3>
                        <div className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            {posters.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedImage(img.file_path)}
                                    className="relative flex-none w-32 md:w-48 aspect-[2/3] rounded-2xl overflow-hidden group border border-white/5 bg-zinc-900 shadow-lg hover:shadow-violet-900/20 transition-all hover:scale-[1.02] hover:border-violet-500/30"
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        alt={`Poster ${idx}`}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <Maximize2 className="text-white drop-shadow-lg" size={28} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-full text-white transition-colors border border-white/10 z-[100001]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X size={24} />
                    </button>
                    
                    <img 
                        src={`https://image.tmdb.org/t/p/original${selectedImage}`} 
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 select-none"
                        alt="Zoom"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>,
                document.body
            )}
        </section>
    );
}