import { useState, useEffect, useMemo } from "react";
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
  getAwards,
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
  const [interactions, setInteractions] = useState({
    liked: false,
    watched: false,
  });
  const [userLists, setUserLists] = useState([]);

  const [modals, setModals] = useState({
    trailer: false,
    addToList: false,
    createList: false,
    awards: false,
  });

  const communityStats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const validReviews = reviews.filter(
      (r) => r.rating !== undefined && r.rating !== null,
    );
    if (validReviews.length === 0) return null;
    const total = validReviews.reduce(
      (acc, curr) => acc + Number(curr.rating),
      0,
    );
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
        setReviews(results[2]);

        const recommendations = mediaData.recommendations?.results || [];
        const similarItems = mediaData.similar?.results || [];
        let relatedContent =
          recommendations.length > 0 ? recommendations : similarItems;
        relatedContent = relatedContent
          .filter((item) => item.id !== Number(id) && item.poster_path)
          .slice(0, 6);
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

    const prevInteractions = { ...interactions };
    setInteractions((prev) => ({
      ...prev,
      [action]: action === "like" ? !prev.liked : !prev.watched,
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
      toast.error("Erro", "Falha ao salvar interação.");
      setInteractions(prevInteractions);
    }
  };

  const handlePostReview = async (rating, text) => {
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

  const handlePostReply = async (reviewId, text, parentId = null) => {
    if (!user) return toast.error("Login necessário", "Entre para responder.");
    try {
      await postComment({ reviewId, text, parentId });
      toast.success("Sucesso", "Resposta enviada!");
      const updated = await getMediaReviews(id);
      setReviews(updated);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao responder.";
      toast.error("Aviso", msg);
      throw error;
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
      const updated = await getMediaReviews(id);
      setReviews(updated);
      toast.success("Apagado", "Resposta removida.");
    } catch (error) {
      toast.error("Erro", "Não foi possível apagar a resposta.");
    }
  };

  const handleAddToList = async (listId) => {
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
      setModals((prev) => ({ ...prev, addToList: false }));
    } catch (e) {
      toast.error("Erro", "Falha ao adicionar.");
    }
  };

  const handleCreateList = async (listName) => {
    try {
      const listRes = await createOrUpdateList({
        listName,
        description: "",
        isPublic: true,
      });
      await addMediaToList(listRes.listId, {
        id: media.id,
        title: media.title || media.name,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path,
        media_type: type,
        vote_average: media.vote_average,
      });
      const updatedLists = await getUserLists("me");
      setUserLists(updatedLists);
      toast.success("Lista Criada", "Lista criada e item adicionado.");
      setModals((prev) => ({ ...prev, addToList: false }));
    } catch (error) {
      toast.error("Erro", "Falha ao criar lista.");
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
    modals,
    setModals,
    user,
    communityStats,
    actions: {
      handleInteract,
      handlePostReview,
      handlePostReply,
      handleDeleteReview,
      handleDeleteComment,
      handleAddToList,
      handleCreateList,
      handleShare: () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Copiado", "Link copiado!");
      },
    },
  };
}