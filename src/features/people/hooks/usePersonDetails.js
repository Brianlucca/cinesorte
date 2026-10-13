import { useCallback, useEffect, useState } from 'react';
import {
  deleteComment,
  deleteReview,
  getComments,
  getMediaReviews,
  getMovieDetails,
  postComment,
  postReview,
  toggleLikeReview,
  updateComment,
  updateReview,
} from '@shared/api/api';
import { useAuth } from '@shared/context/useAuth';
import { useToast } from '@shared/context/useToast';

const isCurrentUser = (item, userId, userUid, username) =>
  Boolean(
    (userUid && userUid === item.userId) ||
      (userId && userId === item.userId) ||
      (username && username === item.username),
  );

const normalizeReplies = (replies, userId, userUid, username) =>
  (Array.isArray(replies) ? replies : []).map((reply) => ({
    ...reply,
    isOwner: isCurrentUser(reply, userId, userUid, username),
  }));

const normalizeReviews = (items, userId, userUid, username) =>
  (Array.isArray(items) ? items : []).map((review) => ({
    ...review,
    isOwner: isCurrentUser(review, userId, userUid, username),
    isLikedByCurrentUser: Boolean(review.isLikedByCurrentUser),
    likesCount: Number(review.likesCount) || 0,
    replies: normalizeReplies(review.replies, userId, userUid, username),
  }));

export const usePersonDetails = (id) => {
  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const toast = useToast();

  const uniquePersonId = `person-${id}`;
  const userId = user?.id;
  const userUid = user?.uid;
  const username = user?.username;

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [personData, reviewsData] = await Promise.all([
        getMovieDetails('person', id),
        getMediaReviews(uniquePersonId).catch(() => []),
      ]);

      let externalIds = {};
      try {
        externalIds = await getMovieDetails('person', `${id}/external_ids`);
      } catch {
        externalIds = {};
      }

      setDetails({ ...personData, external_ids: externalIds });
      setReviews(normalizeReviews(reviewsData, userId, userUid, username));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id, uniquePersonId, userId, userUid, username]);

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
      setReviews(normalizeReviews(updatedReviews, userId, userUid, username));
    } catch (requestError) {
      toast.error(
        'Erro',
        requestError.response?.data?.message || 'Não foi possível publicar.',
      );
      throw requestError;
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
                replies: normalizeReplies(comments, userId, userUid, username),
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
          review.id === reviewId
            ? { ...review, replies: normalizeReplies(comments, userId, userUid, username) }
            : review,
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

  const handleLikeReview = async (reviewId) => {
    if (!user) return;
    const previousReview = reviews.find((review) => review.id === reviewId);
    if (!previousReview) return;

    setReviews((previous) =>
      previous.map((review) => {
        if (review.id !== reviewId) return review;
        const isLiked = !review.isLikedByCurrentUser;
        return {
          ...review,
          isLikedByCurrentUser: isLiked,
          likesCount: Math.max(0, review.likesCount + (isLiked ? 1 : -1)),
        };
      }),
    );

    try {
      await toggleLikeReview(reviewId);
    } catch {
      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId
            ? previousReview
            : review,
        ),
      );
      toast.error('Erro', 'Não foi possível curtir esta avaliação.');
    }
  };

  const handleLoadReplies = async (reviewId) => {
    try {
      const comments = await getComments(reviewId);
      setReviews((previous) =>
        previous.map((review) =>
          review.id === reviewId
            ? { ...review, replies: normalizeReplies(comments, userId, userUid, username) }
            : review,
        ),
      );
    } catch {
      toast.error('Erro', 'Não foi possível carregar as respostas.');
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
      handleLikeReview,
      handleLoadReplies,
    },
  };
};
