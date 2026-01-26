import { useState, useEffect, useCallback } from 'react';
import { 
  getGlobalFeed, 
  getFollowingFeed, 
  getTmdbSearch, 
  postReview, 
  deleteReview, 
  getUserReviews, 
  getTrending,
  followUser,
  getSuggestions,
  searchUsers,
  getUserStats,
  getSharedListsFeed
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useFeedLogic() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState('global');
  
  const [localUser, setLocalUser] = useState(user || {});
  const [suggestions, setSuggestions] = useState({ users: [], content: [] });

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reviewId: null });

  const [postStep, setPostStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [postText, setPostText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);

  useEffect(() => {
      async function syncUserStats() {
          if (user?.uid) {
              try {
                  const stats = await getUserStats();
                  setLocalUser(prev => ({ 
                      ...prev, 
                      ...user,
                      followersCount: stats.followersCount,
                      followingCount: stats.followingCount
                  }));
              } catch(e) {
                  setLocalUser(user);
              }
          }
      }
      syncUserStats();
  }, [user]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (feedType === 'global') {
        data = await getGlobalFeed();
      } else if (feedType === 'following') {
        data = await getFollowingFeed(); 
      } else if (feedType === 'collections') {
        data = await getSharedListsFeed();
      } else if (feedType === 'mine' && localUser?.username) {
        data = await getUserReviews(localUser.username);
      }
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) { 
      setReviews([]);
    } finally { 
      setLoading(false); 
    }
  }, [feedType, localUser?.username]);

  const loadSidebarData = useCallback(async () => {
      try {
          const [contentData, usersData] = await Promise.all([
              getTrending('week'),
              getSuggestions()
          ]);
          
          const validUsers = Array.isArray(usersData) ? usersData.filter(u => u.username !== localUser?.username) : [];

          setSuggestions({
              users: validUsers.slice(0, 5),
              content: contentData.slice(0, 4)
          });
      } catch (e) {}
  }, [localUser?.username]);

  useEffect(() => { 
      loadFeed(); 
      loadSidebarData();
  }, [loadFeed, loadSidebarData]);

  useEffect(() => {
    const delay = setTimeout(async () => {
        if (searchQuery.trim().length > 2) {
            try {
                const data = await getTmdbSearch(searchQuery);
                const results = Array.isArray(data) ? data : (data.results || []);
                setSearchResults(results.filter(i => i.poster_path || i.profile_path).slice(0, 5));
            } catch (e) { setSearchResults([]); }
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
                setUserSearchResults(results.filter(u => u.id !== user?.uid).slice(0, 5));
            } catch (e) { setUserSearchResults([]); }
        } else { setUserSearchResults([]); }
    }, 400);
    return () => clearTimeout(delay);
  }, [userSearchQuery, user]);

  const handleOpenPostModal = () => {
      resetPostForm();
      setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
      setIsPostModalOpen(false);
      resetPostForm();
  };

  const resetPostForm = () => {
      setPostStep(1);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMedia(null);
      setPostText('');
      setRating(5);
  };

  const handleSelectMedia = (item) => {
      setSelectedMedia(item);
      setPostStep(2);
  };

  const handlePostSubmit = async () => {
    if (!postText.trim()) return toast.error('Atenção', 'Escreva algo sobre o título.');
    
    setIsSubmitting(true);
    try {
        await postReview({
            mediaId: selectedMedia.id,
            mediaType: selectedMedia.media_type || 'movie',
            mediaTitle: selectedMedia.title || selectedMedia.name,
            posterPath: selectedMedia.poster_path || selectedMedia.profile_path || "",
            backdropPath: selectedMedia.backdrop_path || selectedMedia.profile_path || "",
            rating: rating,
            text: postText
        });
        toast.success('Publicado', 'Sua avaliação foi postada!');
        handleClosePostModal();
        loadFeed();
    } catch (error) { 
        toast.error('Erro', 'Falha ao publicar avaliação.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleFollowUser = async (userId) => {
      try {
          await followUser(userId);
          toast.success('Seguindo', 'Você começou a seguir este usuário.');
          
          setLocalUser(prev => ({
              ...prev,
              followingCount: (prev.followingCount || 0) + 1
          }));
          
          setSuggestions(prev => ({
              ...prev,
              users: prev.users.filter(u => u.id !== userId)
          }));
          
          setUserSearchResults(prev => prev.filter(u => u.id !== userId));

          if (feedType === 'following') loadFeed();
          
          const stats = await getUserStats();
          setLocalUser(prev => ({ ...prev, ...stats }));

      } catch (e) {
          toast.error('Erro', 'Não foi possível seguir.');
      }
  };

  const promptDelete = (reviewId) => {
      setDeleteModal({ isOpen: true, reviewId });
  };

  const confirmDelete = async () => {
      const { reviewId } = deleteModal;
      try {
          await deleteReview(reviewId);
          setReviews(prev => prev.filter(r => r.id !== reviewId));
          toast.success('Removido', 'Publicação apagada.');
      } catch (error) {
          toast.error('Erro', 'Não foi possível apagar.');
      } finally {
          setDeleteModal({ isOpen: false, reviewId: null });
      }
  };

  return {
    user: localUser,
    state: {
        reviews,
        loading,
        feedType,
        suggestions,
        isPostModalOpen,
        deleteModal,
        postForm: {
            step: postStep,
            query: searchQuery,
            results: searchResults,
            media: selectedMedia,
            text: postText,
            rating,
            isSubmitting
        },
        userSearch: {
            query: userSearchQuery,
            results: userSearchResults
        }
    },
    actions: {
        setFeedType,
        setSearchQuery,
        setPostText,
        setRating,
        handleOpenPostModal,
        handleClosePostModal,
        handleSelectMedia,
        handlePostSubmit,
        setPostStep,
        handleFollowUser,
        promptDelete,
        confirmDelete,
        closeDeleteModal: () => setDeleteModal({ isOpen: false, reviewId: null }),
        setUserSearchQuery
    }
  };
}