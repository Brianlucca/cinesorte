import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toggleLikeReview } from "../services/api";

export const validateContent = (text) => {
  if (text.length > 500) {
    return "O texto não pode exceder 500 caracteres.";
  }

  const offensivePatterns = [
    /bosta/i, /merda/i, /caralho/i, /porra/i, /puta/i, /puto/i,
    /vadia/i, /vagabunda/i, /piranha/i, /arrombado/i, /arrombada/i,
    /viado/i, /viadinho/i, /bicha/i, /boiola/i, /maricas/i, /traveco/i,
    /sapatão/i, /baitola/i, /preto de merda/i, /macaco/i, /nigger/i,
    /nigga/i, /senzala/i, /tição/i, /faggot/i, /retardado/i, /mongol/i,
    /autistinha/i, /idiota/i, /imbecil/i, /burro/i, /animal/i, /\bcu\b/i,
    /pinto/i, /buceta/i, /xoxota/i, /piroca/i, /caralhos/i, /cacete/i,
    /foder/i, /foda-se/i, /chupar/i, /mamada/i, /gozar/i, /gozo/i,
    /nazista/i, /hitler/i, /suicidio/i, /se matar/i,
  ];

  if (offensivePatterns.some((pattern) => pattern.test(text))) {
    return "O comentário contém palavras ofensivas ou inadequadas.";
  }

  return null;
};

export function useLikeInteraction(review) {
  const { user } = useAuth();
  const [state, setState] = useState({
    liked: !!review.isLikedByCurrentUser,
    count: review.likesCount ?? 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setState({
      liked: !!review.isLikedByCurrentUser,
      count: review.likesCount ?? 0,
    });
  }, [review.id, review.isLikedByCurrentUser, review.likesCount]);

  const toggleLike = async () => {
    if (isProcessing || !user) return;
    setIsProcessing(true);

    const prevState = { ...state };
    const newLiked = !prevState.liked;
    const newCount = newLiked ? prevState.count + 1 : Math.max(0, prevState.count - 1);

    setState({ liked: newLiked, count: newCount });

    try {
      await toggleLikeReview(review.id);
    } catch {
      setState(prevState);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    liked: state.liked,
    likesCount: state.count,
    toggleLike,
    isProcessing,
  };
}