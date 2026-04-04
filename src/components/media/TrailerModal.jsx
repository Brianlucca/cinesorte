import { X } from 'lucide-react';
import Modal from '../ui/Modal';

export default function TrailerModal({ isOpen, onClose, videoKey }) {
  if (!videoKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="video">
        <div className="relative w-full h-full bg-zinc-950 aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 bg-black/40 backdrop-blur-xl p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all shadow-lg"
            >
                <X size={20} />
            </button>
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} 
                title="Trailer" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        </div>
    </Modal>
  );
}