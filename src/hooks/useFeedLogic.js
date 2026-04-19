import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFollowingFeed,
  getTmdbSearch,
  postReview,
  deleteReview,
  deleteListShare,
  getUserReviewsOnly,
  getTrending,
  followUser,
  getSuggestions,
  searchUsers,
  getUserStats,
  getSharedListsFeed,
  toggleLikeReview,
  getComments
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useFeedLogic() {
  const { user } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedType, setFeedType] = useState('following');
  const [hasMore, setHasMore] = useState(true);
  const [hasNewPosts, setHasNewPosts] = useState(false);

  const mineCursorRef = useRef(null);
  const feedCursorRef = useRef({
    following: null,
    collections: null,
  });

  const [localUser, setLocalUser] = useState(user || {});
  const [suggestions, setSuggestions] = useState({ users: [], content: [] });

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewId: null, type: null });

  const [postStep, setPostStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [postText, setPostText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);

  const likeTimeouts = useRef({});
  const likeClickCounts = useRef({});

  useEffect(() => {
    async function syncUserStats() {
      if (user?.uid) {
        try {
          const stats = await getUserStats();
          setLocalUser(prev => {
            if (prev.followingCount === stats.followingCount && prev.followersCount === stats.followersCount) {
              return prev;
            }
            return { ...prev, ...user, ...stats };
          });
        } catch (e) {
          setLocalUser(user);
        }
      }
    }
    syncUserStats();
  }, [user]);

  const normalizeItem = (item) => {
    let listItemsSafe = Array.isArray(item.listItems) ? item.listItems : [];
    const isList = item.type === 'list_share' || (item.listName && listItemsSafe.length > 0);
    const derivedType = isList ? 'list_share' : (item.type || 'review');

    return {
      ...item,
      type: derivedType,
      uniqueKey: `${derivedType}-${item.id}`,
      isLikedByCurrentUser: !!item.isLikedByCurrentUser,
      replies: item.replies || [],
      listItems: listItemsSafe,
      listCount: Number(item.listCount) || listItemsSafe.length || 0,
      listName: derivedType === 'list_share' ? (item.listName || "Coleção") : null,
      username: item.username || item.user?.username,
      userPhoto: item.userPhoto || item.user?.photoURL
    };
  };

  const loadFeed = useCallback(async (currentPage = 1, isRefresh = false) => {
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      let data = [];
      let currentMineHasMore = false;
      let currentHasMore = false;

      if (feedType === 'following') {
        const cursor = isRefresh || currentPage === 1 ? null : feedCursorRef.current.following;
        const response = await getFollowingFeed(cursor);
        data = response?.items || [];
        currentHasMore = response?.hasMore || false;
        feedCursorRef.current.following = response?.nextCursor || null;

      } else if (feedType === 'collections') {
        const cursor = isRefresh || currentPage === 1 ? null : feedCursorRef.current.collections;
        const response = await getSharedListsFeed(cursor);
        data = response?.items || [];
        currentHasMore = response?.hasMore || false;
        feedCursorRef.current.collections = response?.nextCursor || null;

      } else if (feedType === 'mine' && localUser?.username) {
        const cursor = isRefresh || currentPage === 1 ? null : mineCursorRef.current;
        const response = await getUserReviewsOnly(localUser.username, cursor);
        const rawItems = response?.items || [];
        currentMineHasMore = response?.hasMore || false;
        mineCursorRef.current = response?.nextCursor || null;
        data = rawItems;
      }

      const safeData = Array.isArray(data) ? data.map(normalizeItem) : [];

      const filteredData = safeData.filter(item => {
        if (item.type === 'list_share' && item.listCount === 0) return false;
        if (feedType === 'collections') return item.type === 'list_share';
        return true;
      });

      if (feedType === 'mine') {
        setHasMore(currentMineHasMore);
      } else {
        setHasMore(currentHasMore);
      }

      if (isRefresh || currentPage === 1) {
        setReviews(filteredData);
      } else {
        setReviews(prev => {
          const existingKeys = new Set(prev.map(r => r.uniqueKey));
          const uniqueNew = filteredData.filter(r => !existingKeys.has(r.uniqueKey));
          return [...prev, ...uniqueNew];
        });
      }
    } catch {
      if (currentPage === 1) setReviews([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [feedType, localUser?.username]);

  const getDateValue = (dateInput) => {
    if (!dateInput) return 0;
    if (dateInput._seconds) return dateInput._seconds * 1000;
    if (typeof dateInput.toDate === 'function') return dateInput.toDate().getTime();
    if (dateInput instanceof Date) return dateInput.getTime();
    return new Date(dateInput).getTime();
  };

  const checkForNewPosts = useCallback(async () => {
    if (loading || loadingMore || feedType === 'mine') return;
    try {
      let newData = [];

      if (feedType === 'following') {
        newData = (await getFollowingFeed())?.items || [];
      } else if (feedType === 'collections') {
        newData = (await getSharedListsFeed())?.items || [];
      }

      const processedNew = (Array.isArray(newData) ? newData : []).map(item => ({
        id: item.id,
        createdAt: item.createdAt
      }));

      if (reviews.length === 0) {
        setHasNewPosts(processedNew.length > 0);
        return;
      }

      const latestReviewTime = getDateValue(reviews[0]?.createdAt);
      const hasNewer = processedNew.some(p => {
        const postTime = getDateValue(p.createdAt);
        return postTime > latestReviewTime && !reviews.some(r => r.id === p.id);
      });

      setHasNewPosts(hasNewer);
    } catch {}
  }, [feedType, reviews, loading, loadingMore]);

  const loadNewPosts = async () => {
    try {
      setHasNewPosts(false);
      setReviews([]);
      await loadFeed(1, true);
    } catch {
      toast.error('Erro', 'Falha ao carregar novas postagens.');
    }
  };

  const handleSetFeedType = (type) => {
    if (feedType === type) return;
    setFeedType(type);
    setReviews([]);
    setHasMore(true);
    mineCursorRef.current = null;
    feedCursorRef.current[type] = null;
  };

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      loadFeed(2, false);
    }
  };

  const loadSidebarData = useCallback(async () => {
    try {
      const [contentData, usersData] = await Promise.all([
        getTrending('week'),
        getSuggestions()
      ]);

      const validUsers = Array.isArray(usersData)
        ? usersData.filter(u => u.username !== localUser?.username)
        : [];

      setSuggestions({
        users: validUsers.slice(0, 5),
        content: Array.isArray(contentData) ? contentData.slice(0, 4) : []
      });
    } catch {}
  }, [localUser?.username]);

  useEffect(() => {
    loadFeed(1, true);
    loadSidebarData();
  }, [loadFeed, loadSidebarData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && reviews.length > 0 && feedType !== 'mine') {
        checkForNewPosts();
      }
    }, 180000);
    return () => clearInterval(interval);
  }, [checkForNewPosts, reviews.length, feedType]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const data = await getTmdbSearch(searchQuery);
          const results = Array.isArray(data) ? data : (data.results || []);
          setSearchResults(results.filter(i => i.poster_path || i.profile_path).slice(0, 5));
        } catch { setSearchResults([]); }
      } else { setSearchResults([]); }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (userSearchQuery.trim().length > 1) {
        try {
          const data = await searchUsers(userSearchQuery);
          const results = Array.isArray(data) ? data : [];
          setUserSearchResults(results.filter(u => u.username !== user?.username).slice(0, 5));
        } catch { setUserSearchResults([]); }
      } else { setUserSearchResults([]); }
    }, 400);
    return () => clearTimeout(delay);
  }, [userSearchQuery, user]);

  const handleOpenPostModal = () => { resetPostForm(); setIsPostModalOpen(true); };
  const handleClosePostModal = () => { setIsPostModalOpen(false); resetPostForm(); };

  const resetPostForm = () => {
    setPostStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedMedia(null);
    setPostText('');
    setRating(5);
  };

  const handleSelectMedia = (item) => { setSelectedMedia(item); setPostStep(2); };

  const handlePostSubmit = async () => {
    if (!postText.trim()) return toast.error('Atenção', 'Escreva algo sobre o título.');
    if (!selectedMedia) return toast.error('Erro', 'Selecione um filme ou série.');

    setIsSubmitting(true);
    try {
      await postReview({
        mediaId: selectedMedia.id.toString(),
        mediaType: selectedMedia.media_type || 'movie',
        mediaTitle: selectedMedia.title || selectedMedia.name || "Sem Título",
        posterPath: selectedMedia.poster_path || selectedMedia.profile_path || "",
        backdropPath: selectedMedia.backdrop_path || selectedMedia.profile_path || "",
        rating: Number(rating),
        text: postText
      });
      toast.success('Publicado', 'Sua avaliação foi postada!');
      handleClosePostModal();
      handleSetFeedType('mine');
    } catch {
      toast.error('Erro', 'Falha ao publicar avaliação. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUser = async (targetUsername) => {
    if (!targetUsername) return;
    try {
      await followUser(targetUsername);
      toast.success('Seguindo', 'Você começou a seguir este usuário.');

      setLocalUser(prev => ({ ...prev, followingCount: (prev.followingCount || 0) + 1 }));
      setSuggestions(prev => ({ ...prev, users: prev.users.filter(u => u.username !== targetUsername) }));
      setUserSearchResults(prev => prev.filter(u => u.username !== targetUsername));

      const stats = await getUserStats();
      setLocalUser(prev => ({ ...prev, ...stats }));

      if (feedType === 'following') loadFeed(1, true);
    } catch {
      toast.error('Erro', 'Não foi possível seguir.');
    }
  };

  const promptDelete = (reviewId, type) => setDeleteModal({ isOpen: true, reviewId, type });

  const confirmDelete = async () => {
    const { reviewId, type } = deleteModal;
    try {
      if (type === 'list_share') {
        await deleteListShare(reviewId);
      } else {
        await deleteReview(reviewId);
      }
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      toast.success('Removido', 'Publicação apagada.');
    } catch {
      toast.error('Erro', 'Não foi possível apagar. Tente novamente.');
    } finally {
      setDeleteModal({ isOpen: false, reviewId: null, type: null });
    }
  };

  const handleLike = async (reviewId) => {
    likeClickCounts.current[reviewId] = (likeClickCounts.current[reviewId] || 0) + 1;
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const isCurrentlyLiked = !!r.isLikedByCurrentUser;
        const currentCount = Number(r.likesCount) || 0;
        const nextState = !isCurrentlyLiked;
        const nextCount = Math.max(0, nextState ? currentCount + 1 : currentCount - 1);
        return { ...r, isLikedByCurrentUser: nextState, likesCount: nextCount };
      }
      return r;
    }));

    if (likeTimeouts.current[reviewId]) clearTimeout(likeTimeouts.current[reviewId]);
    likeTimeouts.current[reviewId] = setTimeout(async () => {
      const clicks = likeClickCounts.current[reviewId] || 0;
      if (clicks % 2 !== 0) {
        try { await toggleLikeReview(reviewId); } catch {}
      }
      delete likeClickCounts.current[reviewId];
      delete likeTimeouts.current[reviewId];
    }, 1000);
  };

  const handleLoadComments = async (reviewId) => {
    try {
      const comments = await getComments(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, replies: comments } : r));
    } catch {
      toast.error("Erro", "Falha ao carregar comentários.");
    }
  };

  return {
    user: localUser,
    state: {
      reviews, loading, loadingMore, hasMore, hasNewPosts, feedType, suggestions,
      isPostModalOpen, deleteModal,
      postForm: { step: postStep, query: searchQuery, results: searchResults, media: selectedMedia, text: postText, rating, isSubmitting },
      userSearch: { query: userSearchQuery, results: userSearchResults }
    },
    actions: {
      setFeedType: handleSetFeedType, loadMore, loadNewPosts, setSearchQuery, setPostText, setRating,
      handleOpenPostModal, handleClosePostModal, handleSelectMedia, handlePostSubmit, setPostStep,
      handleFollowUser, promptDelete, confirmDelete,
      closeDeleteModal: () => setDeleteModal({ isOpen: false, reviewId: null, type: null }),
      setUserSearchQuery, handleLike, handleLoadComments
    }
  };
}
