import { useState, useEffect, useCallback } from 'react';
import {
  getPublicProfile,
  getUserReviewsOnly,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getMatchPercentage,
  createDirectConversation,
  blockUser,
  unblockUser,
  getBlockStatus,
} from '@shared/api/api';
import { useToast } from '@shared/context/useToast';
import { useAuth } from '@shared/context/useAuth';

export function usePublicProfileLogic(username) {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsCursor, setReviewsCursor] = useState(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followsYou, setFollowsYou] = useState(false);
  const [loading, setLoading] = useState(true);
  const [compatibility, setCompatibility] = useState(0);
  const [messaging, setMessaging] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const reviewsPromise = getUserReviewsOnly(username);
        const profileData = await getPublicProfile(username);

        if (!isMounted) return;

        if (profileData) {
          const formattedProfile = {
            ...profileData,
            createdAt: profileData.createdAt?._seconds
              ? new Date(profileData.createdAt._seconds * 1000)
              : new Date(profileData.createdAt || Date.now()),
            trophies: profileData.trophies || [],
          };

          setProfile(formattedProfile);
          setLoading(false);

          if (user?.username && user.username !== username) {
            Promise.all([
                checkFollowStatus(username),
                getMatchPercentage(username),
                getBlockStatus(username),
              ])
              .then(([followStatus, matchData, blockStatus]) => {
              if (isMounted) {
                setIsFollowing(followStatus.isFollowing);
                setFollowsYou(followStatus.followsYou);
                setCompatibility(matchData.percentage || 0);
                setIsBlocked(Boolean(blockStatus?.isBlocked));
              }
              })
              .catch(() => {
                if (!isMounted) return;
                setIsFollowing(false);
                setFollowsYou(false);
                setCompatibility(0);
              });
          }

          const reviewsResponse = await reviewsPromise.catch(() => ({}));
          if (!isMounted) return;
          const items = reviewsResponse?.items || [];
          setReviews(items);
          setHasMoreReviews(reviewsResponse?.hasMore || false);
          setReviewsCursor(reviewsResponse?.nextCursor || null);
        }
      } catch {
        if (isMounted) {
          toast.error('Erro', 'Perfil não encontrado ou erro de conexão.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (username) loadData();

    return () => {
      isMounted = false;
    };
  }, [username, user?.username, toast]);

  const loadMoreReviews = useCallback(async () => {
    if (!username || !reviewsCursor || loadingMoreReviews) return 0;
    setLoadingMoreReviews(true);
    try {
      const response = await getUserReviewsOnly(username, reviewsCursor);
      const newItems = response?.items || [];
      setReviews((prev) => {
        const existingIds = new Set(prev.map((review) => review.id));
        return [...prev, ...newItems.filter((review) => !existingIds.has(review.id))];
      });
      setHasMoreReviews(response?.hasMore || false);
      setReviewsCursor(response?.nextCursor || null);
      return newItems.length;
    } catch {
      toast.error('Erro', 'Não foi possível carregar mais reviews.');
      return 0;
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [username, reviewsCursor, loadingMoreReviews, toast]);

  const handleFollow = async () => {
    if (!username || !user || isBlocked) return;

    const previousState = isFollowing;
    setIsFollowing(!previousState);
    setProfile((prev) => ({
      ...prev,
      followersCount: previousState ? prev.followersCount - 1 : prev.followersCount + 1,
    }));

    try {
      if (previousState) {
        await unfollowUser(username);
        toast.info('Deixou de seguir', `Você não está mais seguindo ${profile.name}.`);
      } else {
        await followUser(username);
        toast.success('Seguindo', `Você agora segue ${profile.name}!`);
      }
    } catch {
      setIsFollowing(previousState);
      setProfile((prev) => ({
        ...prev,
        followersCount: previousState ? prev.followersCount + 1 : prev.followersCount - 1,
      }));
      toast.error('Erro', 'Não foi possível realizar a ação.');
    }
  };

  const handleBlock = async () => {
    if (!username || blocking) return;
    setBlocking(true);
    try {
      if (isBlocked) {
        await unblockUser(username);
        setIsBlocked(false);
        window.dispatchEvent(new CustomEvent('cinesorte:user-unblocked', { detail: { username } }));
        toast.success('Desbloqueado', `@${username} foi desbloqueado.`);
      } else {
        await blockUser(username);
        setIsBlocked(true);
        setIsFollowing(false);
        setFollowsYou(false);
        setProfile((prev) => ({
          ...prev,
          followersCount: Math.max(0, (prev?.followersCount || 0) - (isFollowing ? 1 : 0)),
          followingCount: Math.max(0, (prev?.followingCount || 0) - (followsYou ? 1 : 0)),
        }));
        window.dispatchEvent(new CustomEvent('cinesorte:user-blocked', {
          detail: {
            username,
            name: profile?.name || username,
            photoURL: profile?.photoURL || null,
          },
        }));
        toast.success('Usuário bloqueado', `@${username} não pode mais iniciar conversa com você.`);
      }
    } catch (error) {
      toast.error('Não foi possível alterar o bloqueio', error.message || 'Tente novamente.');
    } finally {
      setBlocking(false);
    }
  };

  const handleMessage = async () => {
    if (!username || !user || user.username === username || messaging || isBlocked) return;

    setMessaging(true);
    try {
      const conversation = await createDirectConversation({ targetUsername: username });
      window.dispatchEvent(
        new CustomEvent('cinesorte:open-messages', {
          detail: { conversationId: conversation?.id },
        })
      );
    } catch (error) {
      toast.error('Mensagem indisponível', error.message || 'Não foi possível abrir a conversa.');
    } finally {
      setMessaging(false);
    }
  };

  return {
    profile,
    reviews,
    isFollowing,
    followsYou,
    loading,
    messaging,
    isBlocked,
    blocking,
    compatibility,
    hasMoreReviews,
    loadingMoreReviews,
    actions: { handleFollow, handleMessage, handleBlock, loadMoreReviews },
  };
}
