import { useState, useEffect, useCallback } from 'react';
import { 
    getPublicProfile, 
    getUserReviewsOnly,
    followUser, 
    unfollowUser, 
    checkFollowStatus,
    getMatchPercentage 
} from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

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

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, reviewsResponse] = await Promise.all([
          getPublicProfile(username),
          getUserReviewsOnly(username)
        ]);

        if (!isMounted) return;

        if (profileData) {
          const formattedProfile = {
            ...profileData,
            createdAt: profileData.createdAt?._seconds
              ? new Date(profileData.createdAt._seconds * 1000)
              : new Date(profileData.createdAt || Date.now()),
            trophies: profileData.trophies || []
          };

          if (user && user.username !== username) {
            try {
              const [followStatus, matchData] = await Promise.all([
                checkFollowStatus(username),
                getMatchPercentage(username)
              ]);
              if (isMounted) {
                setIsFollowing(followStatus.isFollowing);
                setFollowsYou(followStatus.followsYou);
                setCompatibility(matchData.percentage || 0);
              }
            } catch {
              setIsFollowing(false);
              setFollowsYou(false);
              setCompatibility(0);
            }
          }

          setProfile(formattedProfile);

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

    return () => { isMounted = false; };
  }, [username, user, toast]);

  const loadMoreReviews = useCallback(async () => {
    if (!username || !reviewsCursor || loadingMoreReviews) return;
    setLoadingMoreReviews(true);
    try {
      const response = await getUserReviewsOnly(username, reviewsCursor);
      const newItems = response?.items || [];
      setReviews(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        return [...prev, ...newItems.filter(r => !existingIds.has(r.id))];
      });
      setHasMoreReviews(response?.hasMore || false);
      setReviewsCursor(response?.nextCursor || null);
    } catch {
      toast.error('Erro', 'Não foi possível carregar mais reviews.');
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [username, reviewsCursor, loadingMoreReviews, toast]);

  const handleFollow = async () => {
    if (!username || !user) return;

    const previousState = isFollowing;
    setIsFollowing(!previousState);
    setProfile(prev => ({
      ...prev,
      followersCount: previousState ? prev.followersCount - 1 : prev.followersCount + 1
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
      setProfile(prev => ({
        ...prev,
        followersCount: previousState ? prev.followersCount + 1 : prev.followersCount - 1
      }));
      toast.error('Erro', 'Não foi possível realizar a ação.');
    }
  };

  return {
    profile,
    reviews,
    isFollowing,
    followsYou,
    loading,
    compatibility,
    hasMoreReviews,
    loadingMoreReviews,
    actions: { handleFollow, loadMoreReviews }
  };
}
