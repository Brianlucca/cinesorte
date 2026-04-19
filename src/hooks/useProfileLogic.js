import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    getUserInteractions, 
    getUserReviewsOnly,
    getUserStats, 
    getUserFollowers, 
    getUserFollowing, 
    getUserLists, 
    updateProfile,
    getMe 
} from '../services/api';

const ITEMS_PER_PAGE = 10;

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
  const [activeTab, setActiveTab] = useState('activity'); 
  const [activityFilter, setActivityFilter] = useState('all'); 
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const [reviewsCursor, setReviewsCursor] = useState(null);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
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
            processedInteractions.push({
              ...item,
              action: 'like',
              sortDate: item.timestamp?._seconds ? new Date(item.timestamp._seconds * 1000) : new Date()
            });
          }
          if (item.watched) {
            processedInteractions.push({
              ...item,
              action: 'watched',
              sortDate: item.timestamp?._seconds ? new Date(item.timestamp._seconds * 1000) : new Date()
            });
          }
        });
      }
      processedInteractions.sort((a, b) => b.sortDate - a.sortDate);
      setAllInteractions(processedInteractions);

    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [authUser?.uid, authUser?.username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMoreReviews = useCallback(async () => {
    if (!authUser?.username || !reviewsCursor || loadingMoreReviews) return;
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
    } catch {
      toast.error('Erro', 'Não foi possível carregar mais reviews.');
    } finally {
      setLoadingMoreReviews(false);
    }
  }, [authUser?.username, reviewsCursor, loadingMoreReviews]);

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
      const list = await getUserFollowers(authUser.uid);
      setFollowersList(list);
    } catch {
      toast.error('Erro', 'Não foi possível carregar seguidores.');
    } finally {
      setLoadingLists(false);
    }
  };

  const openFollowingModal = async () => {
    setModals(prev => ({ ...prev, following: true }));
    setLoadingLists(true);
    try {
      const list = await getUserFollowing(authUser.uid);
      setFollowingList(list);
    } catch {
      toast.error('Erro', 'Não foi possível carregar quem você segue.');
    } finally {
      setLoadingLists(false);
    }
  };

  const filteredInteractions = useMemo(() => {
    if (activityFilter === 'all') return allInteractions;
    return allInteractions.filter(item => item.action === activityFilter);
  }, [allInteractions, activityFilter]);

  const displayData = useMemo(() => {
    if (activeTab === 'activity') return filteredInteractions.slice(0, visibleCount);
    if (activeTab === 'reviews') return allReviews.slice(0, visibleCount);
    return [];
  }, [activeTab, filteredInteractions, allReviews, visibleCount]);

  const diaryItems = useMemo(() => {
    return allInteractions.filter(item => item.action === 'watched');
  }, [allInteractions]);

  const hasMore = useMemo(() => {
    if (activeTab === 'activity') return visibleCount < filteredInteractions.length;
    if (activeTab === 'reviews') return visibleCount < allReviews.length || hasMoreReviews;
    return false;
  }, [activeTab, filteredInteractions.length, allReviews.length, visibleCount, hasMoreReviews]);

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
  const handleFilterChange = (filter) => { setActivityFilter(filter); setVisibleCount(ITEMS_PER_PAGE); };
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
      year: new Date().getFullYear()
    },
    ui: { loading, activeTab, activityFilter, hasMore, loadingLists, loadingMoreReviews },
    modals,
    actions: {
      setActiveTab: handleTabChange,
      setActivityFilter: handleFilterChange,
      loadMore: handleLoadMore,
      openModal,
      closeModal,
      updateAvatar,
      updateBackground,
      openFollowersModal,
      openFollowingModal,
      refresh: loadData
    }
  };
}
