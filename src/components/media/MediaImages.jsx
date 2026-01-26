import { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';

export default function MediaImages({ images, title }) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!images || (images.backdrops.length === 0 && images.posters.length === 0)) return null;

    const backdrops = images.backdrops?.slice(0, 10) || [];
    const posters = images.posters?.slice(0, 10) || [];

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-violet-600 pl-4 flex items-center justify-between">
                Galeria de Imagens
            </h2>

            <div className="space-y-8">
                {backdrops.length > 0 && (
                    <div>
                        <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4 ml-2">Backdrops</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-zinc-900">
                            {backdrops.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedImage(img.file_path)}
                                    className="relative flex-none w-72 md:w-96 aspect-video rounded-xl overflow-hidden group border border-white/5"
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={`Backdrop ${idx}`}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Maximize2 className="text-white" size={32} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {posters.length > 0 && (
                     <div>
                        <h3 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4 ml-2">Posters</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-zinc-900">
                            {posters.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedImage(img.file_path)}
                                    className="relative flex-none w-32 md:w-48 aspect-[2/3] rounded-xl overflow-hidden group border border-white/5"
                                >
                                    <img 
                                        src={`https://image.tmdb.org/t/p/w342${img.file_path}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        alt={`Poster ${idx}`}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Maximize2 className="text-white" size={24} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors">
                        <X size={32} />
                    </button>
                    <img 
                        src={`https://image.tmdb.org/t/p/original${selectedImage}`} 
                        className="max-w-full max-h-screen rounded-lg shadow-2xl"
                        alt="Zoom"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
}