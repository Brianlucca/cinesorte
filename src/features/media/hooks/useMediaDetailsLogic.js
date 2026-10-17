import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getMovieDetails,
  getProviders,
  getMediaReviews,
  getMediaInteraction,
  recordInteraction,
  createOrUpdateList,
  getUserLists,
  addMediaToList,
  removeMediaFromList,
  postComment,
  deleteReview,
  deleteComment,
  postReview,
  updateReview,
  updateComment,
  toggleLikeReview,
  getComments,
  getUserFollowing,
  getWatchProgress,
  clearApiCache,
} from "@shared/api/api";
import { useToast } from "@shared/context/useToast";
import { useAuth } from "@shared/context/useAuth";
import { readInteraction, writeInteraction } from "@shared/lib/interactionCache";

export function useMediaDetailsLogic() {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const userScope = user?.username || null;

  const [media, setMedia] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState({ liked: false, watched: false });
  const interactionsRef = useRef({ liked: false, watched: false });
  const [userLists, setUserLists] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [addingToListId, setAddingToListId] = useState(null);
  const [watchProgress, setWatchProgress] = useState(null);
  const interactionTouchedRef = useRef(false);

  const [modals, setModals] = useState({
    trailer: false,
    addToList: false,
    createList: false,
    awards: false,
  });

  const likeTimeouts = useRef({});
  const likeClickCounts = useRef({});

  const requireLogin = (message = "Entre para usar este recurso.") => {
    toast.error("Login necessário", message);
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  const isEliteUser = (levelTitle) => {
    const eliteTitles = [
      "Mestre da Crítica", 
      "Oráculo da Sétima Arte", 
      "Entidade Cinematográfica", 
      "Divindade do Cinema"
    ];
    return eliteTitles.includes(levelTitle);
  };

  const applyInteractionState = useCallback((nextState, { persist = true } = {}) => {
    interactionsRef.current = nextState;
    setInteractions(nextState);
    if (persist) writeInteraction(userScope, type, id, nextState);
  }, [userScope, type, id]);

  const invalidateReviewsCache = useCallback(() => {
    clearApiCache(`/social/reviews/${id}`);
  }, [id]);

  const invalidateInteractionCache = useCallback(() => {
    clearApiCache("/users/interactions/");
  }, []);

  const communityStats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const validReviews = reviews.filter((r) => r.rating !== undefined && r.rating !== null);
    if (validReviews.length === 0) return null;
    const total = validReviews.reduce((acc, curr) => acc + Number(curr.rating), 0);
    return {
      average: (total / validReviews.length).toFixed(1),
      count: validReviews.length,
    };
  }, [reviews]);

  useEffect(() => {
    let cancelled = false;
    const alive = () => !cancelled;

    async function loadData() {
      if (!id) return;
      setLoading(true);
      interactionTouchedRef.current = false;
      applyInteractionState(
        (userScope ? readInteraction(userScope, type, id) : null) || {
          liked: false,
          watched: false,
        },
        { persist: false },
      );
      setWatchProgress(null);
      setReviews([]);
      setProviders([]);
      setSimilar([]);

      getProviders(type, id)
        .then((value) => {
          if (alive()) setProviders(Array.isArray(value) ? value : []);
        })
        .catch(() => {
          if (alive()) setProviders([]);
        });

      getMediaReviews(id)
        .then((reviewsRaw) => {
          if (!alive()) return;
          setReviews(
            Array.isArray(reviewsRaw)
              ? reviewsRaw.map((r) => ({
                  ...r,
                  isLikedByCurrentUser: !!r.isLikedByCurrentUser,
                  likesCount: Number(r.likesCount) || 0,
                  replies: r.replies || [],
                  isEliteReview: r.isEliteReview === true,
                }))
              : [],
          );
        })
        .catch(() => {
          if (alive()) setReviews([]);
        });

      if (user?.username) {
        getMediaInteraction(id)
          .then((myInter) => {
            if (!alive() || interactionTouchedRef.current) return;
            const serverState = {
              liked: !!myInter?.liked,
              watched: !!myInter?.watched,
            };
            applyInteractionState(serverState);
          })
          .catch(() => {});

        getUserLists("me")
          .then((value) => {
            if (alive()) setUserLists(Array.isArray(value) ? value : []);
          })
          .catch(() => {});

        getUserFollowing(user.username)
          .then((value) => {
            if (alive()) setFollowingList(Array.isArray(value) ? value : []);
          })
          .catch(() => {});

        getWatchProgress()
          .then((items) => {
            if (!alive()) return;
            const progressItems = Array.isArray(items) ? items : [];
            setWatchProgress(
              progressItems.find(
                (item) => String(item.tmdbId) === String(id) && item.mediaType === type,
              ) || null,
            );
          })
          .catch(() => {});
      }

      try {
        const mediaData = await getMovieDetails(type, id);
        if (!alive()) return;
        setMedia(mediaData);
        const recommendations = mediaData.recommendations?.results || [];
        const similarItems = mediaData.similar?.results || [];
        const relatedContent = (recommendations.length > 0 ? recommendations : similarItems)
          .filter((item) => item.id !== Number(id) && item.poster_path)
          .slice(0, 16);
        setSimilar(relatedContent);
      } catch {
        if (!alive()) return;
        setMedia(null);
        setReviews([]);
        setProviders([]);
        setSimilar([]);
      } finally {
        if (alive()) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [type, id, user?.username, userScope, applyInteractionState]);

  const handleInteract = async (action) => {
    if (!user) return requireLogin("Entre para interagir com este título.");

    const key = action === "like" ? "liked" : "watched";
    const current = interactionsRef.current;
    const previousState = current[key];
    const nextState = { ...current, [key]: !previousState };
    interactionTouchedRef.current = true;

    applyInteractionState(nextState);

    try {
      await recordInteraction({
        mediaId: id.toString(),
        mediaType: type,
        action,
        mediaTitle: media.title || media.name,
        posterPath: media.poster_path,
        backdropPath: media.backdrop_path || '',
      });
    } catch {
      applyInteractionState({ ...interactionsRef.current, [key]: previousState });
      toast.error("Erro", "Falha ao salvar interação.");
    } finally {
      invalidateInteractionCache();
    }
  };

  const handlePostReview = async (rating, text, isElite = false) => {
    if (!user) return requireLogin("Entre para avaliar este título.");
    try {
      await postReview({
        mediaId: id.toString(),
        mediaType: type,
        mediaTitle: media.title || media.name,
        posterPath: media.poster_path,
        backdropPath: media.backdrop_path || "",
        rating: rating !== null ? Number(rating) : null,
        text: text,
        isEliteReview: isElite 
      });
      if (rating !== null && Number(rating) >= 1) {
        applyInteractionState(
          { ...interactionsRef.current, watched: true },
          { persist: false },
        );
      }
      toast.success("Sucesso", "Publicado com sucesso!");
      invalidateReviewsCache();
      const updated = await getMediaReviews(id);
      setReviews(updated);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao publicar.";
      toast.error("Aviso", msg);
      throw error;
    }
  };

  const handleEditReview = async (reviewId, newText, newRating) => {
    try {
      await updateReview(reviewId, {
        text: newText,
        rating: newRating !== null ? Number(newRating) : null,
      });
      if (newRating !== null && Number(newRating) >= 1) {
        applyInteractionState(
          { ...interactionsRef.current, watched: true },
          { persist: false },
        );
      }
      invalidateReviewsCache();
      setReviews(prev => prev.map(r => 
        r.id === reviewId
          ? { ...r, text: newText, rating: newRating !== null ? Number(newRating) : null, isEdited: true }
          : r
      ));
      toast.success("Editado", "Sua publicação foi atualizada.");
    } catch {
      toast.error("Erro", "Não foi possível editar.");
    }
  };

  const handlePostReply = async (reviewId, text, parentId = null) => {
    if (!user) return requireLogin("Entre para responder à comunidade.");
    try {
      await postComment({ reviewId, text, parentId });
      invalidateReviewsCache();
      toast.success("Sucesso", "Resposta enviada!");
      const comments = await getComments(reviewId);
      setReviews(prev => prev.map(r => {
          if (r.id === reviewId) {
              return { ...r, replies: comments, commentsCount: (r.commentsCount || 0) + 1 };
          }
          return r;
      }));
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao responder.";
      toast.error("Aviso", msg);
      throw error;
    }
  };

  const handleEditReply = async (commentId, newText, reviewId) => {
    try {
        await updateComment(commentId, { text: newText });
        invalidateReviewsCache();
        const comments = await getComments(reviewId);
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                return { ...r, replies: comments };
            }
            return r;
        }));
        toast.success("Editado", "Resposta atualizada.");
    } catch {
        toast.error("Erro", "Não foi possível editar resposta.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      invalidateReviewsCache();
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Apagado", "Publicação removida.");
    } catch {
      toast.error("Erro", "Não foi possível apagar.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      invalidateReviewsCache();
      setReviews(prev => prev.map(r => {
          const hasComment = r.replies?.some(c => c.id === commentId);
          if (hasComment) {
              return {
                  ...r,
                  replies: r.replies.filter(c => c.id !== commentId),
                  commentsCount: Math.max(0, (r.commentsCount || 0) - 1)
              };
          }
          return r;
      }));
      toast.success("Apagado", "Resposta removida.");
    } catch {
      toast.error("Erro", "Não foi possível apagar a resposta.");
    }
  };

  const handleAddToList = async (listId) => {
    if (!user) {
      requireLogin("Entre para adicionar títulos às suas listas.");
      return false;
    }
    setAddingToListId(listId);
    const mediaItem = {
      id: media.id,
      title: media.title || media.name,
      name: media.name || media.title,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      media_type: type,
      vote_average: media.vote_average || 0,
      release_date: media.release_date || null,
      first_air_date: media.first_air_date || null,
    };

    setUserLists((currentLists) => currentLists.map((list) =>
      String(list.id) === String(listId)
        ? { ...list, items: [...(list.items || []), mediaItem] }
        : list,
    ));

    try {
      await addMediaToList(listId, mediaItem);
      toast.success("Salvo", "Adicionado à sua lista.");
      return true;
    } catch (e) {
      const msg = e.response?.data?.message || "Falha ao adicionar.";
      toast.error("Aviso", msg);
      setUserLists((currentLists) => currentLists.map((list) =>
        String(list.id) === String(listId)
          ? { ...list, items: (list.items || []).filter((item) => String(item.id) !== String(media.id)) }
          : list,
      ));
      return false;
    } finally {
      setAddingToListId(null);
    }
  };

  const handleRemoveFromList = async (listId) => {
    if (!user) {
      requireLogin("Entre para gerenciar suas listas.");
      return false;
    }
    const previousItems =
      userLists.find((list) => String(list.id) === String(listId))?.items || [];

    setAddingToListId(listId);
    setUserLists((currentLists) => currentLists.map((list) =>
      String(list.id) === String(listId)
        ? { ...list, items: (list.items || []).filter((item) => String(item.id) !== String(media.id)) }
        : list,
    ));

    try {
      await removeMediaFromList(listId, media.id);
      toast.success("Removido", "Título removido da coleção.");
      return true;
    } catch (e) {
      const msg = e.response?.data?.message || "Falha ao remover.";
      toast.error("Aviso", msg);
      setUserLists((currentLists) => currentLists.map((list) =>
        String(list.id) === String(listId)
          ? { ...list, items: previousItems }
          : list,
      ));
      return false;
    } finally {
      setAddingToListId(null);
    }
  };

  const handleCreateList = async (listName) => {
    if (!user) {
      requireLogin("Entre para criar uma lista.");
      return false;
    }
    try {
      const listRes = await createOrUpdateList({
        listName,
        description: "",
        isPublic: true,
      });
      if (!listRes?.listId) throw new Error("A coleção não foi criada corretamente.");

      const mediaItem = {
        id: media.id,
        title: media.title || media.name,
        name: media.name || media.title,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        media_type: type,
        vote_average: media.vote_average || 0,
        release_date: media.release_date || null,
        first_air_date: media.first_air_date || null,
      };

      setAddingToListId(listRes.listId);
      await addMediaToList(listRes.listId, mediaItem);
      setUserLists((currentLists) => [
        { id: listRes.listId, name: listName, isPublic: true, items: [mediaItem] },
        ...currentLists,
      ]);
      toast.success("Coleção criada", "Título adicionado à nova coleção.");
      return true;
    } catch (error) {
      toast.error("Erro", error.message || "Falha ao criar coleção.");
      return false;
    } finally {
      setAddingToListId(null);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return requireLogin("Entre para curtir uma review.");
    likeClickCounts.current[reviewId] = (likeClickCounts.current[reviewId] || 0) + 1;
    setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
            const isCurrentlyLiked = !!r.isLikedByCurrentUser;
            const currentCount = Number(r.likesCount) || 0;
            const nextState = !isCurrentlyLiked;
            let nextCount = nextState ? currentCount + 1 : currentCount - 1;
            if (nextCount < 0) nextCount = 0;
            return { ...r, isLikedByCurrentUser: nextState, likesCount: nextCount };
        }
        return r;
    }));
    if (likeTimeouts.current[reviewId]) clearTimeout(likeTimeouts.current[reviewId]);
    likeTimeouts.current[reviewId] = setTimeout(async () => {
        const clicks = likeClickCounts.current[reviewId] || 0;
        if (clicks % 2 !== 0) {
            try {
              await toggleLikeReview(reviewId);
            } catch {
              setReviews((prev) => prev);
            }
        }
        invalidateReviewsCache();
        delete likeClickCounts.current[reviewId];
        delete likeTimeouts.current[reviewId];
    }, 1000); 
  };

  const handleLoadReplies = async (reviewId) => {
      try {
          const comments = await getComments(reviewId);
          setReviews(prev => prev.map(r => {
              if (r.id === reviewId) { return { ...r, replies: comments }; }
              return r;
          }));
      } catch (error) {
          toast.error("Erro", error?.message || "Não foi possível carregar as respostas.");
      }
  };

  return {
    media,
    reviews,
    providers,
    similar,
    loading,
    interactions,
    userLists,
    followingList,
    addingToListId,
    watchProgress,
    modals,
    setModals,
    user,
    communityStats,
    isEliteUser,
    actions: {
      handleInteract,
      handlePostReview,
      handleEditReview,
      handlePostReply,
      handleEditReply,
      handleDeleteReview,
      handleDeleteComment,
      handleAddToList,
      handleRemoveFromList,
      handleCreateList,
      handleLikeReview,
      handleLoadReplies,
      requireLogin,
      handleShare: () => {
        const shareUrl = `${window.location.origin}/share/${type}/${id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Copiado", "Link público copiado!");
      },
    },
  };
}
