import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@shared/context/useAuth';
import { useToast } from '@shared/context/useToast';
import { 
    getUserInteractions, 
    getUserReviewsOnly,
    getUserStats, 
    getUserFollowersPage,
    getUserFollowingPage,
    getUserLists, 
    updateProfile,
    getMe,
    getMovieDetails
} from '@shared/api/api';

const ITEMS_PER_PAGE = 10;

const parseInteractionDate = (value) => {
  if (!value) return null;
  if (value._seconds) return new Date(value._seconds * 1000);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMediaType = (item) => item.mediaType || item.media_type || (item.first_air_date ? 'tv' : 'movie');
const getMediaId = (item) => String(item.mediaId || item.id || '').replace(/^(movie-|tv-|person-)/, '');

async function hydrateInteractionArtwork(items) {
  const missingArtwork = items
    .filter((item) => !item.backdropPath && !item.backdrop_path && getMediaId(item))
    .filter((item) => ['movie', 'tv'].includes(getMediaType(item)))
    .slice(0, 80);

  const uniqueKeys = [...new Set(missingArtwork.map((item) => `${getMediaType(item)}:${getMediaId(item)}`))];
  if (uniqueKeys.length === 0) return items;

  const detailsEntries = await Promise.all(
    uniqueKeys.map(async (key) => {
      const [type, id] = key.split(':');
      try {
        const details = await getMovieDetails(type, id);
        return [key, details];
      } catch {
        return [key, null];
      }
    }),
  );

  const detailsMap = new Map(detailsEntries);
  return items.map((item) => {
    const key = `${getMediaType(item)}:${getMediaId(item)}`;
    const details = detailsMap.get(key);
    if (!details) return item;

    return {
      ...item,
      mediaType: getMediaType(item),
      mediaId: getMediaId(item),
      backdropPath: item.backdropPath || item.backdrop_path || details.backdrop_path || '',
      posterPath: item.posterPath || item.poster_path || details.poster_path || '',
      vote_average: item.vote_average || details.vote_average,
      mediaTitle: item.mediaTitle || item.title || item.name || details.title || details.name,
      genres: item.genres || details.genres || [],
    };
  });
}

export function useProfileLogic() {
  const { user: authUser, updateProfile: updateAuthProfile } = useAuth();
  const toast = useToast();

  const [allInteractions, setAllInteractions] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [dbProfile, setDbProfile] = useState({});
  const [userStats, setUserStats] = useState({ 
    followersCount: 0, 
    followingCount: 0, 
    level: 1, 
    xp: 0, 
    totalXp: 0, 
    levelTitle: 'Espectador',
    trophies: [],
    reviewsCount: 0,
    watchedCount: 0,
    likesCount: 0
  });
  const [localUpdates, setLocalUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('likes'); 
  const [activityFilter, setActivityFilter] = useState('like'); 
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const [reviewsCursor, setReviewsCursor] = useState(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [followersCursor, setFollowersCursor] = useState(null);
  const [followingCursor, setFollowingCursor] = useState(null);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(false);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [modals, setModals] = useState({
    avatar: false,
    background: false,
    followers: false,
    following: false
  });

  const loadData = useCallback(async () => {
    if (!authUser?.uid || !authUser?.username) return;
    setLoading(true);
    try {
      const [interactionsData, reviewsResponse, statsData, listsData, meData] = await Promise.all([
          getUserInteractions(),
          getUserReviewsOnly(authUser.username),
          getUserStats(),
          getUserLists('me'),
          getMe()
      ]);

      setUserStats(statsData);
      setDbProfile(meData || {});
      setUserLists(listsData);

      const rawReviews = reviewsResponse?.items || [];
      setAllReviews(rawReviews);
      setHasMoreReviews(reviewsResponse?.hasMore || false);
      setReviewsCursor(reviewsResponse?.nextCursor || null);

      const processedInteractions = [];
      if (interactionsData && Array.isArray(interactionsData)) {
        interactionsData.forEach(item => {
          if (item.liked) {
            const actionDate = parseInteractionDate(item.likedAt) || parseInteractionDate(item.timestamp);
            processedInteractions.push({
              ...item,
              action: 'like',
              actionDate,
              sortDate: actionDate
            });
          }
          if (item.watched) {
            const actionDate = parseInteractionDate(item.watchedAt) || parseInteractionDate(item.timestamp);
            processedInteractions.push({
              ...item,
              action: 'watched',
              actionDate,
              sortDate: actionDate
            });
          }
        });
      }
      processedInteractions.sort((a, b) => (b.sortDate?.getTime() || 0) - (a.sortDate?.getTime() || 0));
      setAllInteractions(await hydrateInteractionArtwork(processedInteractions));

    } catch {
      toast.error('Erro', 'Nao foi possivel carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  }, [authUser?.uid, authUser?.username, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMoreReviews = useCallback(async () => {
    if (!authUser?.username || !reviewsCursor || loadingMoreReviews) return 0;
    setLoadingMoreReviews(true);
    try {
      const response = await getUserReviewsOnly(authUser.username, reviewsCursor);
      const newReviews = response?.items || [];

      setAllReviews(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        return [...prev, ...newReviews.filter(r => !existingIds.has(r.id))];
      });
      setHasMoreReviews(response?.hasMore || false);
      setReviewsCursor(response?.nextCursor || null);
      return newReviews.length;
    } catch {
      toast.error('Erro', 'Não foi possível carregar mais reviews.');
      return 0;
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [authUser?.username, reviewsCursor, loadingMoreReviews, toast]);

  const updateAvatar = async (url) => {
    try {
      await updateProfile({ photoURL: url });
      await updateAuthProfile({ photoURL: url }); 
      setLocalUpdates(prev => ({ ...prev, photoURL: url }));
      setModals(prev => ({ ...prev, avatar: false }));
      toast.success('Sucesso', 'Foto atualizada!');
    } catch {
      toast.error('Erro', 'Falha ao atualizar foto.');
    }
  };

  const updateBackground = async (url) => {
    try {
      await updateProfile({ backgroundURL: url });
      setLocalUpdates(prev => ({ ...prev, backgroundURL: url }));
      setModals(prev => ({ ...prev, background: false }));
      toast.success('Sucesso', 'Capa atualizada!');
    } catch {
      toast.error('Erro', 'Falha ao atualizar capa.');
    }
  };

  const openFollowersModal = async () => {
    setModals(prev => ({ ...prev, followers: true }));
    setLoadingLists(true);
    try {
      const response = await getUserFollowersPage(authUser.uid);
      const items = response?.items || [];
      setFollowersList(items);
      setHasMoreFollowers(response?.hasMore || false);
      setFollowersCursor(response?.nextCursor || null);
    } catch {
      toast.error('Erro', 'Nao foi possivel carregar seguidores.');
    } finally {
      setLoadingLists(false);
    }
  };

  const openFollowingModal = async () => {
    setModals(prev => ({ ...prev, following: true }));
    setLoadingLists(true);
    try {
      const response = await getUserFollowingPage(authUser.uid);
      const items = response?.items || [];
      setFollowingList(items);
      setHasMoreFollowing(response?.hasMore || false);
      setFollowingCursor(response?.nextCursor || null);
    } catch {
      toast.error('Erro', 'Nao foi possivel carregar quem voce segue.');
    } finally {
      setLoadingLists(false);
    }
  };

  const loadMoreFollowers = async () => {
    if (!authUser?.uid || !followersCursor || loadingMoreUsers) return;
    setLoadingMoreUsers(true);
    try {
      const response = await getUserFollowersPage(authUser.uid, followersCursor);
      const items = response?.items || [];
      setFollowersList(prev => {
        const existing = new Set(prev.map(item => item.id || item.username));
        return [...prev, ...items.filter(item => !existing.has(item.id || item.username))];
      });
      setHasMoreFollowers(response?.hasMore || false);
      setFollowersCursor(response?.nextCursor || null);
    } catch {
      toast.error('Erro', 'Nao foi possivel carregar mais seguidores.');
    } finally {
      setLoadingMoreUsers(false);
    }
  };

  const loadMoreFollowing = async () => {
    if (!authUser?.uid || !followingCursor || loadingMoreUsers) return;
    setLoadingMoreUsers(true);
    try {
      const response = await getUserFollowingPage(authUser.uid, followingCursor);
      const items = response?.items || [];
      setFollowingList(prev => {
        const existing = new Set(prev.map(item => item.id || item.username));
        return [...prev, ...items.filter(item => !existing.has(item.id || item.username))];
      });
      setHasMoreFollowing(response?.hasMore || false);
      setFollowingCursor(response?.nextCursor || null);
    } catch {
      toast.error('Erro', 'Nao foi possivel carregar mais perfis.');
    } finally {
      setLoadingMoreUsers(false);
    }
  };
  const likedInteractions = useMemo(() => {
    return allInteractions.filter(item => item.action === 'like');
  }, [allInteractions]);

  const filteredInteractions = useMemo(() => {
    const filtered = activityFilter === 'all'
      ? likedInteractions
      : likedInteractions.filter(item => item.action === activityFilter);

    return [...filtered].sort((a, b) => {
      const dateA = a.sortDate?.getTime?.() || a.timestamp?._seconds || 0;
      const dateB = b.sortDate?.getTime?.() || b.timestamp?._seconds || 0;
      return dateB - dateA;
    });
  }, [likedInteractions, activityFilter]);

  const displayData = useMemo(() => {
    if (activeTab === 'likes') return filteredInteractions;
    if (activeTab === 'reviews') return allReviews;
    return [];
  }, [activeTab, filteredInteractions, allReviews]);

  const diaryItems = useMemo(() => {
    return allInteractions.filter(item => item.action === 'watched');
  }, [allInteractions]);

  const hasMore = useMemo(() => {
    if (activeTab === 'likes') return false;
    if (activeTab === 'reviews') return hasMoreReviews;
    return false;
  }, [activeTab, hasMoreReviews]);

  const handleLoadMore = () => {
    if (activeTab === 'reviews') {
      if (visibleCount < allReviews.length) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      } else if (hasMoreReviews) {
        loadMoreReviews().then(() => {
          setVisibleCount(prev => prev + ITEMS_PER_PAGE);
        });
      }
    } else {
      setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setVisibleCount(ITEMS_PER_PAGE); };
  const handleFilterChange = (filter) => { setActivityFilter(filter === 'watched' ? 'like' : filter); setVisibleCount(ITEMS_PER_PAGE); };
  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

  const finalUser = { 
    ...authUser, 
    ...userStats,
    ...dbProfile, 
    ...localUpdates,
    bio: dbProfile.bio || authUser.bio || ''
  };

  return {
    user: finalUser,
    data: { 
      displayItems: displayData,
      lists: userLists,
      diaryItems,
      interactionsCount: allInteractions.length,
      watchedCount: userStats.watchedCount || allInteractions.filter(i => i.action === 'watched').length,
      likesCount: userStats.likesCount || allInteractions.filter(i => i.action === 'like').length,
      reviewsCount: userStats.reviewsCount || allReviews.length,
      followersList,
      followingList,
      hasMoreFollowers,
      hasMoreFollowing,
      loadingMoreUsers,
      year: new Date().getFullYear()
    },
    ui: { loading, activeTab, activityFilter, hasMore, loadingLists, loadingMoreReviews, hasMoreReviews },
    modals,
    actions: {
      setActiveTab: handleTabChange,
      setActivityFilter: handleFilterChange,
      loadMore: handleLoadMore,
      loadMoreReviews,
      openModal,
      closeModal,
      updateAvatar,
      updateBackground,
      openFollowersModal,
      openFollowingModal,
      loadMoreFollowers,
      loadMoreFollowing,
      refresh: loadData
    }
  };
}
