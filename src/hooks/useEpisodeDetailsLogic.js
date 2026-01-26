import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getEpisodeDetails, 
  getMediaReviews, 
  postReview, 
  postComment, 
  deleteReview,
  toggleLikeReview 
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function useEpisodeDetailsLogic() {
  const { id: tvId, seasonNumber, episodeNumber } = useParams();
  const toast = useToast();
  const { user } = useAuth();
  
  const [episode, setEpisode] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const uniqueMediaId = `tv-${tvId}-s${seasonNumber}-e${episodeNumber}`;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [epData, reviewsData] = await Promise.all([
            getEpisodeDetails(tvId, seasonNumber, episodeNumber),
            getMediaReviews(uniqueMediaId)
        ]);
        setEpisode(epData);
        setReviews(reviewsData);
      } catch (error) { 
          toast.error('Erro', 'Não foi possível carregar o episódio.');
      } finally { 
          setLoading(false); 
      }
    }
    loadData();
  }, [tvId, seasonNumber, episodeNumber]);

  const handlePostReview = async (rating, text) => {
      if (!user) return toast.error('Login necessário', 'Entre para avaliar.');
      
      try {
          await postReview({
              mediaId: uniqueMediaId,
              mediaType: 'episode',
              mediaTitle: `${episode.name} (S${seasonNumber}E${episodeNumber})`,
              posterPath: episode.still_path,
              rating: rating,
              text: text
          });
          toast.success('Publicado', 'Sua avaliação foi enviada!');
          const updated = await getMediaReviews(uniqueMediaId);
          setReviews(updated);
      } catch (error) {
          toast.error('Erro', 'Não foi possível publicar.');
      }
  };

  const handlePostReply = async (reviewId, text) => {
      if (!user) return toast.error('Login necessário', 'Entre para responder.');
      try {
          await postComment({ reviewId, text });
          toast.success('Respondido', 'Seu comentário foi enviado.');
          const updated = await getMediaReviews(uniqueMediaId);
          setReviews(updated);
      } catch (error) {
          toast.error('Erro', 'Não foi possível enviar a resposta.');
      }
  };

  const handleDeleteReview = async (reviewId) => {
      try {
          await deleteReview(reviewId);
          setReviews(prev => prev.filter(r => r.id !== reviewId));
          toast.success('Apagado', 'Avaliação removida.');
      } catch (error) {
          toast.error('Erro', 'Não foi possível apagar.');
      }
  };

  const handleLikeReview = async (reviewId) => {
      try {
          await toggleLikeReview(reviewId);
      } catch(e) {}
  };

  return {
    episode,
    reviews,
    loading,
    tvId,
    seasonNumber,
    episodeNumber,
    user,
    actions: {
        handlePostReview,
        handlePostReply,
        handleDeleteReview,
        handleLikeReview
    }
  };
}