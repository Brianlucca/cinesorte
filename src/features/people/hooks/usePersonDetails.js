import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteComment,
  deleteReview,
  getComments,
  getMediaReviews,
  getMovieDetails,
  getPersonFilmography,
  getPersonTaggedImages,
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

const mergePersonImages = (currentImages, newImages) => {
  const seenPaths = new Set();
  return [...currentImages, ...newImages].filter((image) => {
    if (!image?.file_path || seenPaths.has(image.file_path)) return false;
    seenPaths.add(image.file_path);
    return true;
  });
};

export const usePersonDetails = (id) => {
  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taggedImagesPage, setTaggedImagesPage] = useState(0);
  const [taggedImagesTotalPages, setTaggedImagesTotalPages] = useState(0);
  const [loadingMoreImages, setLoadingMoreImages] = useState(false);
  const loadingMoreImagesRef = useRef(false);
  const [filmography, setFilmography] = useState(null);
  const [filmographyLoading, setFilmographyLoading] = useState(true);
  const [filmographyError, setFilmographyError] = useState(null);
  const [filmographyRetryPage, setFilmographyRetryPage] = useState(1);
  const filmographyLoadingRef = useRef(false);

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
      setFilmographyLoading(true);
      setFilmographyError(null);
      setFilmographyRetryPage(1);

      const [personData, reviewsData, taggedImagesData, filmographyData] = await Promise.all([
        getMovieDetails('person', id),
        getMediaReviews(uniquePersonId).catch(() => []),
        getPersonTaggedImages(id, 1).catch((requestError) => {
          console.error('Não foi possível carregar as fotos marcadas da pessoa.', requestError);
          return null;
        }),
        getPersonFilmography(id, 1).catch((requestError) => {
          console.error('Não foi possível carregar a filmografia da pessoa.', requestError);
          setFilmographyError(requestError);
          setFilmographyRetryPage(1);
          return null;
        }),
      ]);

      let externalIds = {};
      try {
        externalIds = await getMovieDetails('person', `${id}/external_ids`);
      } catch {
        externalIds = {};
      }

      const profileImages = personData.images?.profiles || [];
      const taggedImages = taggedImagesData?.results || [];
      setDetails({
        ...personData,
        external_ids: externalIds,
        images: {
          ...personData.images,
          profiles: mergePersonImages(profileImages, taggedImages),
        },
      });
      setTaggedImagesPage(taggedImagesData?.page || 0);
      setTaggedImagesTotalPages(taggedImagesData?.total_pages || 0);
      setFilmography(filmographyData);
      setReviews(normalizeReviews(reviewsData, userId, userUid, username));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setFilmographyLoading(false);
    }
  }, [id, uniquePersonId, userId, userUid, username]);

  const loadFilmographyPage = useCallback(async (page) => {
    if (filmographyLoadingRef.current || !id) return;

    filmographyLoadingRef.current = true;
    setFilmographyLoading(true);
    setFilmographyError(null);
    setFilmographyRetryPage(page);
    try {
      const filmographyData = await getPersonFilmography(id, page);
      setFilmography(filmographyData);
      setFilmographyRetryPage(filmographyData.page || page);
    } catch (requestError) {
      console.error('Não foi possível carregar a página da filmografia.', requestError);
      setFilmographyError(requestError);
      toast.error('Erro', 'Não foi possível carregar a filmografia.');
    } finally {
      filmographyLoadingRef.current = false;
      setFilmographyLoading(false);
    }
  }, [id, toast]);

  const loadMorePersonImages = useCallback(async () => {
    if (
      loadingMoreImagesRef.current ||
      !id ||
      taggedImagesPage >= taggedImagesTotalPages
    ) {
      return;
    }

    loadingMoreImagesRef.current = true;
    setLoadingMoreImages(true);
    try {
      const nextPage = taggedImagesPage + 1;
      const taggedImagesData = await getPersonTaggedImages(id, nextPage);
      setDetails((previousDetails) => {
        if (!previousDetails) return previousDetails;
        return {
          ...previousDetails,
          images: {
            ...previousDetails.images,
            profiles: mergePersonImages(
              previousDetails.images?.profiles || [],
              taggedImagesData.results || [],
            ),
          },
        };
      });
      setTaggedImagesPage(taggedImagesData.page || nextPage);
      setTaggedImagesTotalPages(
        taggedImagesData.total_pages || taggedImagesTotalPages,
      );
    } catch (requestError) {
      console.error('Não foi possível carregar mais fotos da pessoa.', requestError);
      toast.error('Erro', 'Não foi possível carregar mais fotos.');
    } finally {
      loadingMoreImagesRef.current = false;
      setLoadingMoreImages(false);
    }
  }, [id, taggedImagesPage, taggedImagesTotalPages, toast]);

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
    } catch (error) {
      toast.error('Erro', error?.message || 'Não foi possível carregar as respostas.');
    }
  };

  return {
    details,
    reviews,
    loading,
    error,
    hasMorePersonImages: taggedImagesPage < taggedImagesTotalPages,
    loadingMoreImages,
    loadMorePersonImages,
    filmography,
    filmographyLoading,
    filmographyError,
    filmographyRetryPage,
    loadFilmographyPage,
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
