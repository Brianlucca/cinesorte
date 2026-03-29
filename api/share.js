export default async function handler(req, res) {
  const { type, id } = req.query;
  const backendUrl = process.env.VITE_API_BASE_URL;

  let fetchUrl = '';
  
  if (type === 'episode') {
    const match = id.match(/^(\d+)-s(\d+)-e(\d+)$/);
    if (match) {
      const [, tvId, season, episode] = match;
      fetchUrl = `${backendUrl}/tmdb/details/tv/${tvId}/season/${season}/episode/${episode}`;
    }
  } else if (type === 'season') {
    const match = id.match(/^(\d+)-s(\d+)$/);
    if (match) {
      const [, tvId, season] = match;
      fetchUrl = `${backendUrl}/tmdb/details/tv/${tvId}/season/${season}`;
    }
  } else {
    fetchUrl = `${backendUrl}/tmdb/details/${type}/${id}`;
  }

  try {
    const response = await fetch(fetchUrl);
    const media = await response.json();
    
    const title = media.title || media.name || 'CineSorte';
    const description = media.overview || media.biography || 'Sua jornada cinematográfica continua aqui.';
    const imagePath = media.backdrop_path || media.poster_path || media.profile_path || media.still_path || '';
    const image = imagePath ? `https://image.tmdb.org/t/p/w1280${imagePath}` : `https://${req.headers.host}/logo.png`;
    const url = `https://${req.headers.host}/share/${type}/${id}`;
    const safeDesc = description.substring(0, 150).replace(/"/g, '&quot;') + '...';

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${title} | CineSorte</title>
    <meta name="description" content="${safeDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title} | CineSorte">
    <meta property="og:description" content="${safeDesc}">
    <meta property="og:image" content="${image}">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title} | CineSorte">
    <meta property="twitter:description" content="${safeDesc}">
    <meta property="twitter:image" content="${image}">
</head>
<body>
    <script>window.location.href = "${url}";</script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=86400');
    res.status(200).send(html);
  } catch (err) {
    const fallbackUrl = `https://${req.headers.host}/share/${type}/${id}`;
    const fallbackHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>CineSorte</title>
    <meta property="og:image" content="https://${req.headers.host}/logo.png">
</head>
<body>
    <script>window.location.href = "${fallbackUrl}";</script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(fallbackHtml);
  }
}