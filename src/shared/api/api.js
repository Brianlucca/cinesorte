import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const responseCache = new Map();
const pendingGets = new Map();

const stableParams = (params = {}) => JSON.stringify(
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => left.localeCompare(right)),
);

const cachedGet = (url, options = {}, ttl = 60000) => {
  const key = `${url}:${stableParams(options.params)}`;
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.data);
  if (pendingGets.has(key)) return pendingGets.get(key);

  const request = api.get(url, options)
    .then((data) => {
      responseCache.set(key, { data, expiresAt: Date.now() + ttl });
      return data;
    })
    .finally(() => pendingGets.delete(key));

  pendingGets.set(key, request);
  return request;
};

export const clearApiCache = (prefix = "") => {
  for (const key of responseCache.keys()) {
    if (!prefix || key.startsWith(prefix)) responseCache.delete(key);
  }
};

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      window.dispatchEvent(
        new CustomEvent("cinesorte:session-expired", {
          detail: {
            message: error.response?.data?.message || "Sessão expirada ou usuário não autenticado.",
          },
        })
      );
    }

    const message = error.response?.data?.message || error.message || "Erro desconhecido.";

    return Promise.reject({ status, message, originalError: error });
  }
);

export const login = (credentials) => api.post("/users/login", credentials).then((data) => {
  clearApiCache();
  return data;
});
export const googleAuth = (data) => api.post("/users/auth/google", data).then((response) => {
  clearApiCache();
  return response;
});
export const register = (userData) => api.post("/users/register", userData);
export const resendVerificationEmail = (email) => api.post("/users/resend-verification-email", { email });
export const logout = () => api.post("/users/logout").finally(() => clearApiCache());
export const getMe = () => cachedGet("/users/me", {}, 10000);
export const getSecurityOverview = (params = {}) => api.get("/users/security", { params });
export const verifyCurrentPassword = (data) => api.post("/users/security/verify-password", data);
export const requestEmailChange = (data) => api.post("/users/security/change-email", data);
export const confirmEmailChange = (token) => api.post("/users/security/confirm-email-change", { token });
export const changePassword = (data) => api.post("/users/security/change-password", data);
export const linkGoogleAccount = (data) => api.post("/users/security/link-google", data);
export const linkPasswordAccount = (data) => api.post("/users/security/link-password", data);
export const updateProfile = (data) => api.put("/users/me", data).then((response) => {
  clearApiCache("/users/me:");
  return response;
});
export const deleteAccount = (confirmText) => api.delete("/users/me", { data: { confirmText } }).finally(() => clearApiCache());
export const acceptTerms = (version) => api.post("/users/terms", { version });
export const getPublicProfile = (username) => api.get(`/users/profile/${username}`);
export const requestPasswordReset = (email) => api.post("/users/reset-password", { email });
export const createSupportTicket = (data) => api.post("/users/support/tickets", data);
export const getMySupportTickets = () => api.get("/users/support/tickets");

export const searchUsers = (query, signal) => api.get("/users/search", { params: { query }, signal });

export const getUserLists = (username) => api.get(`/users/lists/${username}`);
export const createOrUpdateList = (listData) => api.post("/users/lists", listData);
export const cloneList = (data) => api.post("/users/lists/clone", data);
export const addMediaToList = (listId, mediaItem) => api.post("/users/lists/add", { listId, mediaItem });
export const removeMediaFromList = (listId, mediaId) => api.delete(`/users/lists/${listId}/media/${mediaId}`);
export const deleteList = (listId) => api.delete(`/users/lists/${listId}`);

export const followUser = (targetUsername) => api.post("/social/follow", { targetUserId: targetUsername });
export const unfollowUser = (targetUsername) => api.delete(`/social/unfollow/${targetUsername}`);
export const checkFollowStatus = (targetUsername) => api.get(`/social/check-follow/${targetUsername}`);
export const getUserStats = () => api.get("/social/stats");
export const getProfileStats = (userId) => api.get(`/social/profile-stats/${userId}`);
export const getUserFollowers = (userId) => api.get(`/social/followers/${userId}`);
export const getUserFollowing = (userId) => api.get(`/social/following/${userId}`);
export const getUserFollowersPage = (userId, cursor = null) =>
  api.get(`/social/followers/${userId}`, { params: { paged: true, ...(cursor ? { cursor } : {}) } });
export const getUserFollowingPage = (userId, cursor = null) =>
  api.get(`/social/following/${userId}`, { params: { paged: true, ...(cursor ? { cursor } : {}) } });
export const getSuggestions = () => cachedGet("/social/suggestions", {}, 60000);
export const getMatchPercentage = (targetUsername) => api.get(`/social/match/${targetUsername}`);
export const blockUser = (username) => api.post("/social/blocks", { username });
export const unblockUser = (username) => api.delete(`/social/blocks/${username}`);
export const getBlockStatus = (username) => api.get(`/social/blocks/${username}/status`);
export const getBlockedUsers = () => api.get("/social/blocks");

export const getGlobalFeed = (cursor = null) => cachedGet("/social/feed/global", { params: cursor ? { cursor } : {} }, 15000);
export const getFollowingFeed = (cursor = null) => cachedGet("/social/feed/following", { params: cursor ? { cursor } : {} }, 15000);
export const getSharedListsFeed = (cursor = null) => cachedGet("/social/feed/collections", { params: cursor ? { cursor } : {} }, 15000);
export const shareList = (data) => api.post("/social/share-list", data);
export const deleteListShare = (shareId) => api.delete(`/social/share-list/${shareId}`);
export const getListDetails = (username, listId) => api.get(`/social/lists/${username}/${listId}`);

export const getMediaReviews = (mediaId) => api.get(`/social/reviews/${mediaId}`);

export const getUserReviews = (username, lastCreatedAt) =>
  api.get(`/social/user-reviews/${username}${lastCreatedAt ? `?lastCreatedAt=${lastCreatedAt}` : ""}`);

export const getUserReviewsOnly = (username, lastCreatedAt) =>
  api.get(`/social/reviews-only/${username}${lastCreatedAt ? `?lastCreatedAt=${lastCreatedAt}` : ""}`);

export const postReview = (reviewData) => api.post("/social/reviews", reviewData);
export const updateReview = (reviewId, data) => api.put(`/social/reviews/${reviewId}`, data);
export const deleteReview = (reviewId) => api.delete(`/social/reviews/${reviewId}`);
export const toggleLikeReview = (reviewId) => api.post(`/social/reviews/${reviewId}/like`);
export const getComments = (reviewId) => api.get(`/social/comments/${reviewId}`);
export const postComment = (data) => api.post("/social/comments", data);
export const updateComment = (commentId, data) => api.put(`/social/comments/${commentId}`, data);
export const deleteComment = (commentId) => api.delete(`/social/comments/${commentId}`);

export const recordInteraction = (data) => api.post("/users/interact", data);
export const getUserInteractions = () => api.get("/users/interactions");
export const getMediaInteraction = (mediaId) => api.get(`/users/interactions/${mediaId}`);
export const getWatchDiary = (year) => api.get("/users/diary", { params: { year } });
export const reconcileRatedReviews = () => api.post("/users/interactions/reconcile-rated-reviews").then((response) => {
  clearApiCache("/users/me:");
  return response;
});

export const getMovieDetails = (type, id) => cachedGet(`/tmdb/details/${type}/${id}`, {}, 10 * 60 * 1000);
export const getPersonExternalIds = (id) => api.get(`/tmdb/details/person/${id}/external_ids`).catch(() => ({}));
export const getSeasonDetails = (tvId, seasonNumber) => cachedGet(`/tmdb/details/tv/${tvId}/season/${seasonNumber}`, {}, 10 * 60 * 1000);
export const getEpisodeDetails = (tvId, seasonNumber, episodeNumber) =>
  cachedGet(`/tmdb/details/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {}, 10 * 60 * 1000);
export const getProviders = (type, id) => cachedGet(`/tmdb/providers/${type}/${id}`, {}, 10 * 60 * 1000);
export const getTrending = (timeWindow) => cachedGet(`/tmdb/trending/${timeWindow}`, {}, 5 * 60 * 1000);
export const getDiscover = (params) => cachedGet("/tmdb/discover", { params }, 5 * 60 * 1000);
export const getNowPlaying = () => cachedGet("/tmdb/now-playing", {}, 5 * 60 * 1000);
export const getTmdbSearch = (query) => cachedGet("/tmdb/search", { params: { query: query.trim() } }, 2 * 60 * 1000);
export const getGenres = () => cachedGet("/tmdb/genres", {}, 24 * 60 * 60 * 1000);
export const getRecommendations = (mediaType) => cachedGet(`/tmdb/recommendations/${mediaType}`, {}, 5 * 60 * 1000);
export const getLatestTrailers = () => cachedGet("/tmdb/latest-trailers", {}, 10 * 60 * 1000);
export const getAnimeReleases = () => cachedGet("/tmdb/anime-releases", {}, 10 * 60 * 1000);
export const getAnimations = () => cachedGet("/tmdb/animations", {}, 10 * 60 * 1000);

export const getNotifications = () => api.get("/notifications");
export const getUnreadCount = () => api.get("/notifications/count");
export const markNotificationRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);

export const getMessageConversations = () => api.get("/messages/conversations");
export const getHiddenOwnedMessageGroups = () => api.get("/messages/conversations/hidden-owned");
export const createDirectConversation = (data) => api.post("/messages/conversations/direct", data);
export const createGroupConversation = (data) => api.post("/messages/conversations/group", data);
export const getConversationMessages = (conversationId, params = {}) =>
  api.get(`/messages/conversations/${conversationId}/messages`, { params });
export const sendConversationMessage = (conversationId, data) =>
  api.post(`/messages/conversations/${conversationId}/messages`, data);
export const markConversationRead = (conversationId) => api.post(`/messages/conversations/${conversationId}/read`);
export const restoreMessageConversation = (conversationId) => api.post(`/messages/conversations/${conversationId}/restore`);
export const updateGroupConversation = (conversationId, data) =>
  api.patch(`/messages/conversations/${conversationId}/group`, data);
export const addGroupMembers = (conversationId, data) =>
  api.post(`/messages/conversations/${conversationId}/members`, data);
export const removeGroupMember = (conversationId, memberId) =>
  api.delete(`/messages/conversations/${conversationId}/members/${memberId}`);
export const deleteMessageConversation = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}`);
export const deleteMessageGroup = (conversationId) =>
  api.delete(`/messages/conversations/${conversationId}/group`);
export const getMessageUnreadCount = () => api.get("/messages/unread-count");

export default api;
