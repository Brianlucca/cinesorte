import { useCallback, useEffect, useState } from 'react';
import {
  deleteComment,
  deleteReview,
  getComments,
  getMediaReviews,
  getMovieDetails,
  postComment,
  postReview,
  updateComment,
  updateReview,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const usePersonDetails = (id) => {
  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const toast = useToast();

  const uniquePersonId = `person-${id}`;

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [personData, reviewsData] = await Promise.all([
        getMovieDetails('person', id),
        getMediaReviews(uniquePersonId),
      ]);

      let externalIds = {};
      try {
        externalIds = await getMovieDetails('person', `${id}/external_ids`);
      } catch {
        externalIds = {};
      }

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
        mediaTitle: details.name || 'Artista',
        posterPath: details.profile_path || '',
        backdropPath: details.profile_path || '',
        rating,
        text,
      });
      toast.success('Publicado', 'Seu comentário foi enviado!');
      const updatedReviews = await getMediaReviews(uniquePersonId);
      setReviews(updatedReviews);
    } catch (requestError) {
      toast.error(
        'Erro',
        requestError.response?.data?.message || 'Não foi possível publicar.',
      );
    }
  };

  const handleEditReview = async (reviewId, newText, newRating) => {
    try {
      await updateReview(reviewId, {
        text: newText,
        rating: newRating !== null ? Number(newRating) : null,
      });
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                text: newText,
                rating: newRating !== null ? Number(newRating) : null,
                isEdited: true,
              }
            : review,
        ),
      );
      toast.success('Editado', 'Seu comentário foi atualizado.');
    } catch {
      toast.error('Erro', 'Não foi possível editar.');
    }
  };

  const handlePostReply = async (reviewId, text) => {
    if (!user) return toast.error('Login necessário');

    try {
      await postComment({ reviewId, text });
      toast.success('Respondido', 'Resposta enviada.');
      const comments = await getComments(reviewId);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: comments,
                commentsCount: (review.commentsCount || 0) + 1,
              }
            : review,
        ),
      );
    } catch {
      toast.error('Erro', 'Falha ao responder.');
    }
  };

  const handleEditReply = async (commentId, newText, reviewId) => {
    try {
      await updateComment(commentId, { text: newText });
      const comments = await getComments(reviewId);
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, replies: comments } : review,
        ),
      );
      toast.success('Editado', 'Resposta atualizada.');
    } catch {
      toast.error('Erro', 'Não foi possível editar a resposta.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      toast.success('Apagado', 'Comentário removido.');
    } catch {
      toast.error('Erro', 'Não foi possível apagar.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setReviews((prev) =>
        prev.map((review) => {
          const hasComment = review.replies?.some((comment) => comment.id === commentId);
          if (!hasComment) return review;

          return {
            ...review,
            replies: review.replies.filter((comment) => comment.id !== commentId),
            commentsCount: Math.max(0, (review.commentsCount || 0) - 1),
          };
        }),
      );
      toast.success('Apagado', 'Resposta removida.');
    } catch {
      toast.error('Erro', 'Não foi possível apagar a resposta.');
    }
  };

  return {
    details,
    reviews,
    loading,
    error,
    actions: {
      handlePostReview,
      handleEditReview,
      handlePostReply,
      handleEditReply,
      handleDeleteReview,
      handleDeleteComment,
    },
  };
};
