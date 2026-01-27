import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  withCredentials: true,
});

export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/users/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/users/me', data);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete('/users/me');
  return response.data;
};

export const acceptTerms = async (version) => {
  const response = await api.post('/users/terms', { version });
  return response.data;
};

export const getPublicProfile = async (username) => {
  const response = await api.get(`/users/profile/${username}`);
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get(`/users/search?query=${query}`);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post('/users/reset-password', { email });
  return response.data;
};

export const checkFollowStatus = async (targetUserId) => {
    const response = await api.get(`/social/check-follow/${targetUserId}`);
    return response.data;
};

export const getUserStats = async () => {
    const response = await api.get('/social/stats');
    return response.data;
};

export const getProfileStats = async (userId) => {
    const response = await api.get(`/social/profile-stats/${userId}`);
    return response.data;
};

export const getUserFollowers = async (userId) => {
    const response = await api.get(`/social/followers/${userId}`);
    return response.data;
};

export const getUserFollowing = async (userId) => {
    const response = await api.get(`/social/following/${userId}`);
    return response.data;
};

export const getSuggestions = async () => {
    const response = await api.get('/social/suggestions');
    return response.data;
};

export const getMatchPercentage = async (targetUserId) => {
    const response = await api.get(`/social/match/${targetUserId}`);
    return response.data;
};

export const followUser = async (targetUserId) => {
  const response = await api.post('/social/follow', { targetUserId });
  return response.data;
};

export const unfollowUser = async (targetUserId) => {
  const response = await api.delete(`/social/unfollow/${targetUserId}`);
  return response.data;
};

export const shareList = async (data) => {
  const response = await api.post('/social/share-list', data);
  return response.data;
};

export const getMovieDetails = async (type, id) => {
  const response = await api.get(`/tmdb/details/${type}/${id}`);
  return response.data;
};

export const getPersonExternalIds = async (id) => {
  try {
    const response = await api.get(`/tmdb/details/person/${id}/external_ids`);
    return response.data;
  } catch (error) {
    return {}; 
  }
};

export const getSeasonDetails = async (tvId, seasonNumber) => {
  const response = await api.get(`/tmdb/details/tv/${tvId}/season/${seasonNumber}`);
  return response.data;
};

export const getEpisodeDetails = async (tvId, seasonNumber, episodeNumber) => {
  const response = await api.get(`/tmdb/details/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
  return response.data;
};

export const getProviders = async (type, id) => {
  const response = await api.get(`/tmdb/providers/${type}/${id}`);
  return response.data;
};

export const getTrending = async (timeWindow) => {
  const response = await api.get(`/tmdb/trending/${timeWindow}`);
  return response.data;
};

export const getDiscover = async (params) => {
  const response = await api.get('/tmdb/discover', { params });
  return response.data;
};

export const getTmdbSearch = async (query) => {
  const response = await api.get(`/tmdb/search?query=${query}`);
  return response.data;
};

export const getGenres = async () => {
  const response = await api.get(`/tmdb/genres`);
  return response.data;
};

export const getRecommendations = async (mediaType) => {
  const response = await api.get(`/tmdb/recommendations/${mediaType}`);
  return response.data;
};

export const getLatestTrailers = async () => {
  const response = await api.get('/tmdb/latest-trailers');
  return response.data;
};

export const getAnimeReleases = async () => {
  const response = await api.get('/tmdb/anime-releases');
  return response.data;
};

export const getAnimations = async () => {
  const response = await api.get('/tmdb/animations');
  return response.data;
};

export const getAwards = async (id) => {
    const response = await api.get(`/tmdb/awards/${id}`);
    return response.data;
};

export const getGlobalFeed = async () => {
  const response = await api.get('/social/feed/global');
  return response.data;
};

export const getFollowingFeed = async () => {
  const response = await api.get('/social/feed/following');
  return response.data;
};

export const getSharedListsFeed = async () => {
  const response = await api.get('/social/feed/collections');
  return response.data;
};

export const getMediaReviews = async (mediaId) => {
  const response = await api.get(`/social/reviews/${mediaId}`);
  return response.data;
};

export const getUserReviews = async (username) => {
  const response = await api.get(`/social/user-reviews/${username}`);
  return response.data;
};

export const postReview = async (reviewData) => {
  const response = await api.post('/social/reviews', reviewData);
  return response.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/social/reviews/${reviewId}`);
  return response.data;
};

export const toggleLikeReview = async (reviewId) => {
  const response = await api.post(`/social/reviews/${reviewId}/like`);
  return response.data;
};

export const getComments = async (reviewId) => {
  const response = await api.get(`/social/comments/${reviewId}`);
  return response.data;
};

export const postComment = async (data) => {
  const response = await api.post('/social/comments', data);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/social/comments/${commentId}`);
  return response.data;
};

export const recordInteraction = async (data) => {
  const response = await api.post('/users/interact', data);
  return response.data;
};

export const getUserInteractions = async () => {
  const response = await api.get('/users/interactions');
  return response.data;
};

export const getWatchDiary = async (year) => {
  const response = await api.get('/users/diary', { params: { year } });
  return response.data;
};

export const getUserLists = async (username) => {
  const response = await api.get(`/users/lists/${username}`);
  return response.data;
};

export const getListDetails = async (username, listId) => {
  const response = await api.get(`/social/lists/${username}/${listId}`);
  return response.data;
};

export const createOrUpdateList = async (listData) => {
  const response = await api.post('/users/lists', listData);
  return response.data;
};

export const cloneList = async (data) => {
  const response = await api.post('/users/lists/clone', data);
  return response.data;
};

export const addMediaToList = async (listId, mediaItem) => {
  const response = await api.post('/users/lists/add', { listId, mediaItem });
  return response.data;
};

export const removeMediaFromList = async (listId, mediaId) => {
  const response = await api.delete(`/users/lists/${listId}/media/${mediaId}`);
  return response.data;
};

export const deleteList = async (listId) => {
  const response = await api.delete(`/users/lists/${listId}`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/count');
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export default api;