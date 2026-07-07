export function formatRelative(value) {
  if (!value) return "";
  const date = new Date(value);
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return "Agora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} d`;
}

export function formatMessageTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getMediaTypeLabel(type) {
  if (type === "tv") return "Serie";
  if (type === "episode") return "Episodio";
  return "Filme";
}

export function getMediaYear(media = {}) {
  return String(media.releaseDate || media.release_date || media.firstAirDate || media.first_air_date || "")
    .split("-")[0];
}

export function getPosterUrl(path) {
  if (!path) return null;
  if (String(path).startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w342${path}`;
}

export function getMediaDetailsPath(media = {}) {
  const rawId = media.mediaId || media.id;
  if (!rawId) return null;

  const cleanId = String(rawId).replace(/^(movie-|tv-)/, "");
  const mediaType = media.mediaType || media.media_type || (media.name ? "tv" : "movie");

  if (mediaType === "episode" || (cleanId.includes("-s") && cleanId.includes("-e"))) {
    const match = cleanId.match(/^(\d+)-s(\d+)-e(\d+)$/);
    if (!match) return `/app/tv/${cleanId}`;
    const [, tvId, season, episode] = match;
    return `/app/tv/${tvId}/season/${season}/episode/${episode}`;
  }

  if (mediaType === "person") return `/app/person/${cleanId}`;
  return `/app/${mediaType === "tv" ? "tv" : "movie"}/${cleanId}`;
}

export function normalizeSearchMedia(item) {
  const mediaType = item.media_type || (item.name ? "tv" : "movie");
  const rating = Number(item.vote_average);
  return {
    id: item.id,
    mediaId: item.id,
    mediaType,
    title: item.title || item.name || "Titulo sem nome",
    posterPath: item.poster_path || null,
    backdropPath: item.backdrop_path || null,
    voteAverage: Number.isFinite(rating) && rating > 0 ? rating : undefined,
    releaseDate: item.release_date || null,
    firstAirDate: item.first_air_date || null,
  };
}

export function cleanMessageMedia(media) {
  if (!media) return null;
  return Object.fromEntries(
    Object.entries(media).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  );
}

export function buildConversationView(conversation) {
  const members = conversation.members || [];
  const otherMember = conversation.type === "direct" ? members.find((member) => !member.isSelf) : null;
  const displayName = conversation.type === "direct" ? otherMember?.name || conversation.name : conversation.name;

  return {
    ...conversation,
    displayName: displayName || "Conversa",
    username: otherMember?.username || null,
    avatar: conversation.photoURL || otherMember?.photoURL || null,
    subtitle:
      conversation.type === "group"
        ? `${conversation.memberCount || members.length || 0} membros`
        : otherMember?.username
          ? `@${otherMember.username}`
          : "Mensagem privada",
  };
}
