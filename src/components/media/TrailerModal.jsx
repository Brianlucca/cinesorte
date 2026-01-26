import { X } from 'lucide-react';
import Modal from '../ui/Modal';

export default function TrailerModal({ isOpen, onClose, videoKey }) {
  if (!videoKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="video">
        <div className="relative w-full h-full bg-black aspect-video">
            <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/60 p-2 rounded-full text-white hover:bg-white hover:text-black transition-all">
                <X size={24} />
            </button>
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1`} 
                title="Trailer" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        </div>
    </Modal>
  );
}