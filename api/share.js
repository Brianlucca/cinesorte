const ALLOWED_TYPES = new Set(["movie", "tv", "person", "episode", "season"]);
const PRODUCTION_HOST = process.env.PRODUCTION_HOST || "cinesorte.vercel.app";
const BACKEND_URL = process.env.VITE_API_BASE_URL;

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

function buildFetchUrl(type, id) {
  if (type === "episode") {
    const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
    if (!match) return null;
    const [, tvId, season, episode] = match;
    return `${BACKEND_URL}/tmdb/details/tv/${tvId}/season/${season}/episode/${episode}`;
  }
  if (type === "season") {
    const match = id.match(/^(\d+)-s(\d+)$/);
    if (!match) return null;
    const [, tvId, season] = match;
    return `${BACKEND_URL}/tmdb/details/tv/${tvId}/season/${season}`;
  }
  if (/^\d+$/.test(id)) {
    return `${BACKEND_URL}/tmdb/details/${type}/${id}`;
  }
  return null;
}

function buildInternalRoute(type, id) {
  if (type === "episode") {
    const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
    if (match) {
      const [, tvId, season, episode] = match;
      return `/app/tv/${tvId}/season/${season}/episode/${episode}`;
    }
  }
  if (type === "season") {
    const match = id.match(/^(\d+)-s(\d+)$/);
    if (match) {
      const [, tvId, season] = match;
      return `/app/tv/${tvId}/season/${season}`;
    }
  }
  return `/app/${type}/${id}`;
}

function renderHtml({ title, description, image, shareUrl, redirectUrl }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description.substring(0, 200));
  const safeImage = escapeHtml(image);
  const safeShareUrl = escapeHtml(shareUrl);
  const safeRedirectUrl = escapeHtml(redirectUrl);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle} | CineSorte</title>
  <meta name="description" content="${safeDesc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${safeShareUrl}">
  <meta property="og:title" content="${safeTitle} | CineSorte">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${safeShareUrl}">
  <meta property="twitter:title" content="${safeTitle} | CineSorte">
  <meta property="twitter:description" content="${safeDesc}">
  <meta property="twitter:image" content="${safeImage}">
  <meta http-equiv="refresh" content="0;url=${safeRedirectUrl}">
</head>
<body>
  <noscript>
    <a href="${safeRedirectUrl}">Clique aqui para continuar</a>
  </noscript>
</body>
</html>`;
}

function renderFallback(redirectUrl) {
  const safeRedirectUrl = escapeHtml(redirectUrl);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>CineSorte</title>
  <meta property="og:title" content="CineSorte">
  <meta property="og:description" content="Sua jornada cinematográfica começa aqui.">
  <meta property="og:image" content="https://${PRODUCTION_HOST}/logo.png">
  <meta http-equiv="refresh" content="0;url=${safeRedirectUrl}">
</head>
<body>
  <noscript>
    <a href="${safeRedirectUrl}">Clique aqui para continuar</a>
  </noscript>
</body>
</html>`;
}

export default async function handler(req, res) {
  const { type, id } = req.query;

  if (
    !type ||
    !id ||
    !ALLOWED_TYPES.has(type) ||
    !/^[a-zA-Z0-9_-]+$/.test(id)
  ) {
    res.status(400).send("Parâmetros inválidos.");
    return;
  }

  const shareUrl = `https://${PRODUCTION_HOST}/share/${type}/${id}`;
  const internalRoute = buildInternalRoute(type, id);
  const redirectUrl = `https://${PRODUCTION_HOST}${internalRoute}`;

  const fetchUrl = buildFetchUrl(type, id);
  if (!fetchUrl) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderFallback(redirectUrl));
    return;
  }

  try {
    const response = await fetch(fetchUrl, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) throw new Error(`TMDB status ${response.status}`);

    const media = await response.json();

    const title = media.title || media.name || "CineSorte";
    const description =
      media.overview ||
      media.biography ||
      "Sua jornada cinematográfica continua aqui.";
    const imagePath =
      media.backdrop_path ||
      media.poster_path ||
      media.profile_path ||
      media.still_path ||
      "";
    const image = imagePath
      ? `https://image.tmdb.org/t/p/w1280${imagePath}`
      : `https://${PRODUCTION_HOST}/logo.png`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).send(renderHtml({ title, description, image, shareUrl, redirectUrl }));
  } catch {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300");
    res.status(200).send(renderFallback(redirectUrl));
  }
}