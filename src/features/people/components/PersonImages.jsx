import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ImageIcon } from 'lucide-react';

export default function PersonImages({ images, name }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const profiles = images?.profiles || [];

    if (profiles.length === 0) return null;

    const displayImages = profiles.slice(0, 12);

    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-violet-500 rounded-full"></span>
                Galeria de Fotos
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {displayImages.map((img, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setSelectedImage(img.file_path)}
                        className="relative group aspect-[2/3] rounded-2xl overflow-hidden cursor-zoom-in bg-zinc-900/50 border border-white/5 shadow-lg"
                    >
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={`${name} ${idx}`}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                            <ImageIcon size={32} className="text-white/0 group-hover:text-white/70 transition-colors duration-300" />
                        </div>
                    </button>
                ))}
            </div>

            {selectedImage && createPortal(
                <div 
                    className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" 
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 md:top-8 md:right-8 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-full transition-all shadow-lg"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={`https://image.tmdb.org/t/p/original${selectedImage}`} 
                        className="max-w-full max-h-[90vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 object-contain border border-white/5"
                        alt="Zoom"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>,
                document.body
            )}
        </section>
    );
}