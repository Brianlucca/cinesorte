import React, { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';

export default function PersonImages({ images, name }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const profiles = images?.profiles || [];

    if (profiles.length === 0) return null;

    const displayImages = profiles.slice(0, 12);

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-violet-600 rounded-full"></div>
                Galeria de Fotos
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayImages.map((img, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => setSelectedImage(img.file_path)}
                        className="relative group aspect-[2/3] rounded-xl overflow-hidden cursor-zoom-in bg-zinc-900 border border-white/5"
                    >
                        <img 
                            src={`https://image.tmdb.org/t/p/w500${img.file_path}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
                            alt={`${name} ${idx}`}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                ))}
            </div>

            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                        <X size={24} />
                    </button>
                    <img 
                        src={`https://image.tmdb.org/t/p/original${selectedImage}`} 
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                        alt="Zoom"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
}