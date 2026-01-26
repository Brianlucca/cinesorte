import { useState, useEffect, useCallback } from 'react';
import { 
    getMovieDetails, 
    getMediaReviews, 
    postReview, 
    postComment, 
    deleteReview, 
    recordInteraction 
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const usePersonDetails = (id) => {
  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  
  const uniquePersonId = `person-${id}`;

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [personData, reviewsData] = await Promise.all([
        getMovieDetails('person', id),
        getMediaReviews(uniquePersonId)
      ]);

      let externalIds = {};
      try {
          const extResponse = await api.get(`/tmdb/details/person/${id}/external_ids`);
          externalIds = extResponse.data;
      } catch (e) {}

      setDetails({ ...personData, external_ids: externalIds });
      setReviews(reviewsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id, uniquePersonId]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, fetchDetails]);

  const handlePostReview = async (rating, text) => {
    if (!user) return toast.error('Login necessário', 'Entre para comentar.');
    
    try {
        await postReview({
            mediaId: uniquePersonId, 
            mediaType: 'person',
            mediaTitle: details.name || "Artista",
            posterPath: details.profile_path || "", 
            backdropPath: details.profile_path || "", 
            rating: rating,
            text: text
        });
        toast.success('Publicado', 'Seu comentário foi enviado!');
        const updatedReviews = await getMediaReviews(uniquePersonId);
        setReviews(updatedReviews);
    } catch (error) {
        toast.error('Erro', error.response?.data?.message || 'Não foi possível publicar.');
    }
  };

  const handlePostReply = async (reviewId, text) => {
    if (!user) return toast.error('Login necessário');
    try {
        await postComment({ reviewId, text });
        toast.success('Respondido', 'Resposta enviada.');
        const updatedReviews = await getMediaReviews(uniquePersonId);
        setReviews(updatedReviews);
    } catch (error) {
        toast.error('Erro', 'Falha ao responder.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
        await deleteReview(reviewId);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success('Apagado', 'Comentário removido.');
    } catch (error) {
        toast.error('Erro', 'Não foi possível apagar.');
    }
  };

  const toggleFollowPerson = async () => {
      if(!user) return toast.error('Login necessário');
      try {
          await recordInteraction({ 
              mediaId: uniquePersonId, 
              mediaType: 'person', 
              action: 'like',
              mediaTitle: details.name,
              posterPath: details.profile_path || ""
          });
          setIsLiked(!isLiked);
          toast.success(isLiked ? 'Deixou de seguir' : 'Seguindo artista');
      } catch (error) {
          toast.error('Erro ao processar');
      }
  };

  return { 
      details, 
      reviews, 
      loading, 
      error, 
      isLiked,
      actions: {
          handlePostReview,
          handlePostReply,
          handleDeleteReview,
          toggleFollowPerson
      }
  };
};