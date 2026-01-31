import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getMovieDetails,
  getProviders,
  getMediaReviews,
  getUserInteractions,
  recordInteraction,
  createOrUpdateList,
  getUserLists,
  addMediaToList,
  postComment,
  deleteReview,
  deleteComment,
  postReview,
  updateReview,
  updateComment,
  getAwards,
  toggleLikeReview,
  getComments, 
} from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export function useMediaDetailsLogic() {
  const { type, id } = useParams();
  const toast = useToast();
  const { user } = useAuth();

  const [media, setMedia] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interactions, setInteractions] = useState({ liked: false, watched: false });
  const [userLists, setUserLists] = useState([]);
  const [addingToListId, setAddingToListId] = useState(null);

  const [modals, setModals] = useState({
    trailer: false,
    addToList: false,
    createList: false,
    awards: false,
  });

  const likeTimeouts = useRef({});
  const likeClickCounts = useRef({});

  const isEliteUser = (levelTitle) => {
    const eliteTitles = [
      "Mestre da Crítica", 
      "Oráculo da Sétima Arte", 
      "Entidade Cinematográfica", 
      "Divindade do Cinema"
    ];
    return eliteTitles.includes(levelTitle);
  };

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
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const promises = [
          getMovieDetails(type, id),
          getProviders(type, id),
          getMediaReviews(id),
          getAwards(id),
        ];

        if (user && user.uid) {
          promises.push(getUserInteractions());
          promises.push(getUserLists("me"));
        }

        const results = await Promise.all(promises);
        const mediaData = results[0];
        mediaData.awards = results[3];

        setMedia(mediaData);
        setProviders(results[1]);
        
        const safeReviews = Array.isArray(results[2]) ? results[2].map(r => ({
            ...r,
            isLikedByCurrentUser: !!r.isLikedByCurrentUser,
            likesCount: Number(r.likesCount) || 0,
            replies: r.replies || [],
            isEliteReview: r.isEliteReview === true 
        })) : [];
        setReviews(safeReviews);

        const recommendations = mediaData.recommendations?.results || [];
        const similarItems = mediaData.similar?.results || [];
        let relatedContent = recommendations.length > 0 ? recommendations : similarItems;
        relatedContent = relatedContent.filter((item) => item.id !== Number(id) && item.poster_path).slice(0, 6);
        setSimilar(relatedContent);

        if (user && user.uid) {
          const inter = results[4] || [];
          setUserLists(results[5] || []);
          const myInter = inter.find((i) => i.mediaId === id.toString());
          if (myInter) {
            setInteractions({
              liked: !!myInter.liked,
              watched: !!myInter.watched,
            });
          } else {
            setInteractions({ liked: false, watched: false });
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [type, id, user]);

  const handleInteract = async (action) => {
    if (!user) return toast.error("Login necessário", "Entre para interagir.");

    const key = action === "like" ? "liked" : "watched";
    const previousState = interactions[key];

    setInteractions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    try {
      await recordInteraction({
        mediaId: id.toString(),
        mediaType: type,
        action,
        mediaTitle: media.title || media.name,
        posterPath: media.poster_path,
      });
    } catch (error) {
      setInteractions(prev => ({
        ...prev,
        [key]: previousState
      }));
      toast.error("Erro", "Falha ao salvar interação.");
    }
  };

  const handlePostReview = async (rating, text, isElite = false) => {
    if (!user) return toast.error("Login necessário", "Entre para avaliar.");
    try {
      await postReview({
        mediaId: id.toString(),
        mediaType: type,
        mediaTitle: media.title || media.name,
        posterPath: media.poster_path,
        backdropPath: media.backdrop_path || "",
        rating: Number(rating),
        text: text,
        isEliteReview: isElite 
      });
      toast.success("Sucesso", "Avaliação publicada!");
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
      await updateReview(reviewId, { text: newText, rating: newRating });
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, text: newText, rating: newRating, isEdited: true } : r
      ));
      toast.success("Editado", "Sua avaliação foi atualizada.");
    } catch (error) {
      toast.error("Erro", "Não foi possível editar.");
    }
  };

  const handlePostReply = async (reviewId, text, parentId = null) => {
    if (!user) return toast.error("Login necessário", "Entre para responder.");
    try {
      await postComment({ reviewId, text, parentId });
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
        const comments = await getComments(reviewId);
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                return { ...r, replies: comments };
            }
            return r;
        }));
        toast.success("Editado", "Resposta atualizada.");
    } catch (error) {
        toast.error("Erro", "Não foi possível editar resposta.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Apagado", "Review removida.");
    } catch (error) {
      toast.error("Erro", "Não foi possível apagar.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
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
    } catch (error) {
      toast.error("Erro", "Não foi possível apagar a resposta.");
    }
  };

  const handleAddToList = async (listId) => {
    setAddingToListId(listId);
    try {
      await addMediaToList(listId, {
        id: media.id,
        title: media.title || media.name,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        media_type: type,
        vote_average: media.vote_average,
      });
      toast.success("Salvo", "Adicionado à sua lista.");
      const updatedLists = await getUserLists("me");
      setUserLists(updatedLists);
    } catch (e) {
      const msg = e.response?.data?.message || "Falha ao adicionar.";
      toast.error("Aviso", msg);
    } finally {
      setAddingToListId(null);
    }
  };

  const handleCreateList = async (listName) => {
    try {
      const listRes = await createOrUpdateList({
        listName,
        description: "",
        isPublic: true,
      });
      await handleAddToList(listRes.listId);
    } catch (error) {
      toast.error("Erro", "Falha ao criar lista.");
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return toast.error("Login necessário", "Entre para curtir.");
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
            try { await toggleLikeReview(reviewId); } catch (error) {}
        }
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
          toast.error("Erro", "Não foi possível carregar as respostas.");
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
    addingToListId,
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
      handleCreateList,
      handleLikeReview,
      handleLoadReplies,
      handleShare: () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Copiado", "Link copiado!");
      },
    },
  };
}