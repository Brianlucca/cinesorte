import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      console.warn('Sessão expirada ou usuário não autenticado.');
    }

    const message = error.response?.data?.message || error.message || 'Erro desconhecido.';
    
    return Promise.reject({ status, message, originalError: error });
  }
);

export const login = (credentials) => api.post('/users/login', credentials);
export const register = (userData) => api.post('/users/register', userData);
export const logout = () => api.post('/users/logout');
export const getMe = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);
export const deleteAccount = () => api.delete('/users/me');
export const acceptTerms = (version) => api.post('/users/terms', { version });
export const getPublicProfile = (username) => api.get(`/users/profile/${username}`);
export const requestPasswordReset = (email) => api.post('/users/reset-password', { email });

export const searchUsers = (query, signal) => api.get(`/users/search?query=${query}`, { signal });

export const getUserLists = (username) => api.get(`/users/lists/${username}`);
export const createOrUpdateList = (listData) => api.post('/users/lists', listData);
export const cloneList = (data) => api.post('/users/lists/clone', data);
export const addMediaToList = (listId, mediaItem) => api.post('/users/lists/add', { listId, mediaItem });
export const removeMediaFromList = (listId, mediaId) => api.delete(`/users/lists/${listId}/media/${mediaId}`);
export const deleteList = (listId) => api.delete(`/users/lists/${listId}`);

export const followUser = (targetUserId) => api.post('/social/follow', { targetUserId });
export const unfollowUser = (targetUserId) => api.delete(`/social/unfollow/${targetUserId}`);
export const checkFollowStatus = (targetUserId) => api.get(`/social/check-follow/${targetUserId}`);
export const getUserStats = () => api.get('/social/stats');
export const getProfileStats = (userId) => api.get(`/social/profile-stats/${userId}`);
export const getUserFollowers = (userId) => api.get(`/social/followers/${userId}`);
export const getUserFollowing = (userId) => api.get(`/social/following/${userId}`);
export const getSuggestions = () => api.get('/social/suggestions');
export const getMatchPercentage = (targetUserId) => api.get(`/social/match/${targetUserId}`);

export const getGlobalFeed = () => api.get('/social/feed/global');
export const getFollowingFeed = () => api.get('/social/feed/following');
export const getSharedListsFeed = () => api.get('/social/feed/collections');
export const shareList = (data) => api.post('/social/share-list', data);
export const deleteListShare = (shareId) => api.delete(`/social/share-list/${shareId}`);
export const getListDetails = (username, listId) => api.get(`/social/lists/${username}/${listId}`);

export const getMediaReviews = (mediaId) => api.get(`/social/reviews/${mediaId}`);
export const getUserReviews = (username) => api.get(`/social/user-reviews/${username}`);
export const postReview = (reviewData) => api.post('/social/reviews', reviewData);
export const updateReview = (reviewId, data) => api.put(`/social/reviews/${reviewId}`, data);
export const deleteReview = (reviewId) => api.delete(`/social/reviews/${reviewId}`);
export const toggleLikeReview = (reviewId) => api.post(`/social/reviews/${reviewId}/like`);
export const getComments = (reviewId) => api.get(`/social/comments/${reviewId}`);
export const postComment = (data) => api.post('/social/comments', data);
export const updateComment = (commentId, data) => api.put(`/social/comments/${commentId}`, data);
export const deleteComment = (commentId) => api.delete(`/social/comments/${commentId}`);

export const recordInteraction = (data) => api.post('/users/interact', data);
export const getUserInteractions = () => api.get('/users/interactions');
export const getWatchDiary = (year) => api.get('/users/diary', { params: { year } });

export const getMovieDetails = (type, id) => api.get(`/tmdb/details/${type}/${id}`);
export const getPersonExternalIds = (id) => api.get(`/tmdb/details/person/${id}/external_ids`).catch(() => ({}));
export const getSeasonDetails = (tvId, seasonNumber) => api.get(`/tmdb/details/tv/${tvId}/season/${seasonNumber}`);
export const getEpisodeDetails = (tvId, seasonNumber, episodeNumber) => api.get(`/tmdb/details/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
export const getProviders = (type, id) => api.get(`/tmdb/providers/${type}/${id}`);
export const getTrending = (timeWindow) => api.get(`/tmdb/trending/${timeWindow}`);
export const getDiscover = (params) => api.get('/tmdb/discover', { params });
export const getNowPlaying = () => api.get('/tmdb/now-playing');
export const getTmdbSearch = (query) => api.get(`/tmdb/search?query=${query}`);
export const getGenres = () => api.get(`/tmdb/genres`);
export const getRecommendations = (mediaType) => api.get(`/tmdb/recommendations/${mediaType}`);
export const getLatestTrailers = () => api.get('/tmdb/latest-trailers');
export const getAnimeReleases = () => api.get('/tmdb/anime-releases');
export const getAnimations = () => api.get('/tmdb/animations');
export const getAwards = (id) => api.get(`/tmdb/awards/${id}`);

export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/count');
export const markNotificationRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);

export default api;