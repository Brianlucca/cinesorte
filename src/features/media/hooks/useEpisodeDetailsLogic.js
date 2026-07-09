import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getEpisodeDetails,
  getMediaReviews,
  postReview,
  postComment,
  deleteReview,
  deleteComment,
  toggleLikeReview,
  getComments,
  updateReview,
  updateComment,
  getUserFollowing,
  getMovieDetails,
  getSeasonDetails,
} from '@shared/api/api';
import { useToast } from '@shared/context/useToast';
import { useAuth } from '@shared/context/useAuth';

export function useEpisodeDetailsLogic() {
  const { id: tvId, seasonNumber, episodeNumber } = useParams();
  const toast = useToast();
  const { user } = useAuth();

  const [episode, setEpisode] = useState(null);
  const [tvShow, setTvShow] = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const likeTimeouts = useRef({});
  const likeClickCounts = useRef({});

  const uniqueMediaId = `tv-${tvId}-s${seasonNumber}-e${episodeNumber}`;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const basePromises = [
          getEpisodeDetails(tvId, seasonNumber, episodeNumber),
          getMediaReviews(uniqueMediaId),
          getMovieDetails('tv', tvId),
          getSeasonDetails(tvId, seasonNumber),
        ];

        const userPromise = user?.username ? getUserFollowing(user.username) : Promise.resolve(null);

        const [episodeData, reviewsData, tvShowData, loadedSeason, followingData] = await Promise.all([...basePromises, userPromise]);

        setEpisode(episodeData);
        setTvShow(tvShowData);
        setSeasonData(loadedSeason);
        
        setReviews(
          Array.isArray(reviewsData)
            ? reviewsData.map((r) => ({
                ...r,
                isLikedByCurrentUser: !!r.isLikedByCurrentUser,
                likesCount: Number(r.likesCount) || 0,
                replies: r.replies || [],
              }))
            : []
        );

        if (followingData) {
          setFollowingList(Array.isArray(followingData) ? followingData : []);
        }
      } catch {
        toast.error('Erro', 'Não foi possível carregar o episódio.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tvId, seasonNumber, episodeNumber, toast, uniqueMediaId, user?.username]);

  const handlePostReview = async (rating, text) => {
    if (!user) return toast.error('Login necessário', 'Entre para avaliar.');
    try {
      await postReview({
        mediaId: uniqueMediaId,
        mediaType: 'episode',
        mediaTitle: `${episode.name} (S${seasonNumber}E${episodeNumber})`,
        posterPath: episode.still_path || seasonData?.poster_path || tvShow?.poster_path,
        backdropPath: episode.still_path || tvShow?.backdrop_path || seasonData?.poster_path || '',
        rating,
        text,
      });
      toast.success('Publicado', 'Sua avaliação foi enviada!');
      const updated = await getMediaReviews(uniqueMediaId);
      setReviews(updated);
    } catch {
      toast.error('Erro', 'Não foi possível publicar.');
    }
  };

  const handleEditReview = async (reviewId, newText, newRating) => {
    try {
      await updateReview(reviewId, {
        text: newText,
        rating: newRating !== null ? Number(newRating) : null,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, text: newText, rating: newRating !== null ? Number(newRating) : null, isEdited: true }
            : r
        )
      );
      toast.success('Editado', 'Sua publicação foi atualizada.');
    } catch {
      toast.error('Erro', 'Não foi possível editar.');
    }
  };

  const handlePostReply = async (reviewId, text, parentId = null) => {
    if (!user) return toast.error('Login necessário', 'Entre para responder.');
    try {
      await postComment({ reviewId, text, parentId });
      toast.success('Respondido', 'Seu comentário foi enviado.');
      const comments = await getComments(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, replies: comments, commentsCount: (r.commentsCount || 0) + 1 }
            : r
        )
      );
    } catch {
      toast.error('Erro', 'Não foi possível enviar a resposta.');
    }
  };

  const handleEditReply = async (commentId, newText, reviewId) => {
    try {
      await updateComment(commentId, { text: newText });
      const comments = await getComments(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, replies: comments } : r))
      );
      toast.success('Editado', 'Resposta atualizada.');
    } catch {
      toast.error('Erro', 'Não foi possível editar resposta.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Apagado', 'Avaliação removida.');
    } catch {
      toast.error('Erro', 'Não foi possível apagar.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setReviews((prev) =>
        prev.map((r) => {
          const has = r.replies?.some((c) => c.id === commentId);
          if (!has) return r;
          return {
            ...r,
            replies: r.replies.filter((c) => c.id !== commentId),
            commentsCount: Math.max(0, (r.commentsCount || 0) - 1),
          };
        })
      );
      toast.success('Apagado', 'Resposta removida.');
    } catch {
      toast.error('Erro', 'Não foi possível apagar a resposta.');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return toast.error('Login necessário', 'Entre para curtir.');

    likeClickCounts.current[reviewId] = (likeClickCounts.current[reviewId] || 0) + 1;

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const next = !r.isLikedByCurrentUser;
        return {
          ...r,
          isLikedByCurrentUser: next,
          likesCount: Math.max(0, next ? (r.likesCount || 0) + 1 : (r.likesCount || 0) - 1),
        };
      })
    );

    if (likeTimeouts.current[reviewId]) clearTimeout(likeTimeouts.current[reviewId]);

    likeTimeouts.current[reviewId] = setTimeout(async () => {
      const clicks = likeClickCounts.current[reviewId] || 0;
      if (clicks % 2 !== 0) {
        try {
          await toggleLikeReview(reviewId);
        } catch {
          return;
        }
      }
      delete likeClickCounts.current[reviewId];
      delete likeTimeouts.current[reviewId];
    }, 1000);
  };

  const handleLoadReplies = async (reviewId) => {
    try {
      const comments = await getComments(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, replies: comments } : r))
      );
    } catch {
      toast.error('Erro', 'Não foi possível carregar as respostas.');
    }
  };

  return {
    episode,
    tvShow,
    seasonData,
    reviews,
    followingList,
    loading,
    tvId,
    seasonNumber,
    episodeNumber,
    user,
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
}
