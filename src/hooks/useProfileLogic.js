import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
    getUserInteractions, 
    getUserReviews, 
    getUserStats, 
    getUserFollowers, 
    getUserFollowing,
    getUserLists,
    updateProfile 
} from '../services/api';

const ITEMS_PER_PAGE = 10;

export function useProfileLogic() {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const toast = useToast();

  const [allInteractions, setAllInteractions] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [userLists, setUserLists] = useState([]);
  
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
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity'); 
  const [activityFilter, setActivityFilter] = useState('all'); 
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
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
    if (!user?.uid || !user?.username) return;
    setLoading(true);
    try {
      const [interactionsData, reviewsData, statsData, listsData] = await Promise.all([
          getUserInteractions(), 
          getUserReviews(user.username),
          getUserStats(),
          getUserLists('me')
      ]);

      setUserStats(statsData);
      setUserLists(listsData);

      const processedInteractions = [];
      if (interactionsData && Array.isArray(interactionsData)) {
          interactionsData.forEach(item => {
              if (item.liked) {
                  processedInteractions.push({
                      ...item,
                      action: 'like',
                      sortDate: item.timestamp && item.timestamp._seconds ? new Date(item.timestamp._seconds * 1000) : new Date()
                  });
              }
              if (item.watched) {
                  processedInteractions.push({
                      ...item,
                      action: 'watched',
                      sortDate: item.timestamp && item.timestamp._seconds ? new Date(item.timestamp._seconds * 1000) : new Date()
                  });
              }
          });
      }
      processedInteractions.sort((a, b) => b.sortDate - a.sortDate);
      
      const sortedReviews = (reviewsData || []).sort((a, b) => {
          const dateA = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : 0;
          const dateB = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : 0;
          return dateB - dateA;
      });

      setAllInteractions(processedInteractions);
      setAllReviews(sortedReviews);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateAvatar = async (url) => {
    try {
        await updateProfile({ photoURL: url });
        await updateAuthProfile({ photoURL: url }); 
        toast.success('Sucesso', 'Foto atualizada!');
    } catch (error) {
        toast.error('Erro', 'Falha ao atualizar foto.');
    }
  };

  const updateBackground = async (url) => {
    try {
        await updateProfile({ backgroundURL: url });
        await updateAuthProfile({ backgroundURL: url });
        toast.success('Sucesso', 'Capa atualizada!');
    } catch (error) {
        toast.error('Erro', 'Falha ao atualizar capa.');
    }
  };

  const openFollowersModal = async () => {
      setModals(prev => ({ ...prev, followers: true }));
      setLoadingLists(true);
      try {
          const list = await getUserFollowers(user.uid);
          setFollowersList(list);
      } catch (error) {
          toast.error('Erro', 'Não foi possível carregar seguidores.');
      } finally {
          setLoadingLists(false);
      }
  };

  const openFollowingModal = async () => {
      setModals(prev => ({ ...prev, following: true }));
      setLoadingLists(true);
      try {
          const list = await getUserFollowing(user.uid);
          setFollowingList(list);
      } catch (error) {
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
    if (activeTab === 'activity') {
        return filteredInteractions.slice(0, visibleCount);
    } else if (activeTab === 'reviews') {
        return allReviews.slice(0, visibleCount);
    } else {
        return []; 
    }
  }, [activeTab, filteredInteractions, allReviews, visibleCount]);

  const diaryItems = useMemo(() => {
      return allInteractions.filter(item => item.action === 'watched');
  }, [allInteractions]);

  const hasMore = useMemo(() => {
    if (activeTab === 'activity') {
        return visibleCount < filteredInteractions.length;
    } else if (activeTab === 'reviews') {
        return visibleCount < allReviews.length;
    }
    return false;
  }, [activeTab, filteredInteractions.length, allReviews.length, visibleCount]);

  const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  const handleTabChange = (tab) => { setActiveTab(tab); setVisibleCount(ITEMS_PER_PAGE); };
  const handleFilterChange = (filter) => { setActivityFilter(filter); setVisibleCount(ITEMS_PER_PAGE); };
  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));

  return {
    user: { ...user, ...userStats }, 
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
    ui: { loading, activeTab, activityFilter, hasMore, loadingLists },
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