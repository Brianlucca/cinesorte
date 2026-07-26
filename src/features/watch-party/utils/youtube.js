const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function getYouTubeVideoId(value) {
  const input = value.trim();
  if (YOUTUBE_ID_PATTERN.test(input)) return input;

  try {
    const url = new URL(input);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0];
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const segments = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(segments[0])) return segments[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidYouTubeVideo(value) {
  return YOUTUBE_ID_PATTERN.test(getYouTubeVideoId(value) || "");
}

export function youtubeThumbnail(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
