export const DIARY_SHARE_ITEMS_LIMIT = 10;

export function tmdbImage(path, size = 'w780') {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function getDiaryMediaTitle(item) {
  return item.mediaTitle || item.title || item.name || 'Conteúdo sem título';
}

export function getDiaryMediaTypeLabel(item) {
  return item.mediaType === 'tv' ? 'Série' : 'Filme';
}

function firstImagePath(...paths) {
  return paths.find((path) => typeof path === 'string' && path.trim().length > 0) || '';
}

export function getDiaryBackdropPath(item) {
  return firstImagePath(
    item.backdropPath,
    item.backdrop_path,
    item.backdrop,
    item.media?.backdropPath,
    item.media?.backdrop_path,
    item.details?.backdropPath,
    item.details?.backdrop_path,
    item.tvShow?.backdrop_path,
    item.showBackdropPath,
    item.stillPath,
    item.still_path
  );
}

export function getDiaryPosterPath(item) {
  return firstImagePath(
    item.posterPath,
    item.poster_path,
    item.poster,
    item.media?.posterPath,
    item.media?.poster_path,
    item.details?.posterPath,
    item.details?.poster_path,
    item.profilePath,
    item.profile_path,
    item.stillPath,
    item.still_path
  );
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = image.height * targetRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / targetRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function clampText(ctx, text, maxWidth) {
  const value = String(text || '');
  if (ctx.measureText(value).width <= maxWidth) return value;

  let clipped = value;
  while (clipped.length > 1 && ctx.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }

  return `${clipped.trim()}...`;
}

function drawGeneratedBackdrop(ctx, item, index, x, y, width, height) {
  const palettes = [
    ['#25164a', '#08111f', '#6d28d9'],
    ['#102a43', '#071017', '#0891b2'],
    ['#3b1d16', '#100b0a', '#f59e0b'],
    ['#123524', '#070f0b', '#22c55e'],
    ['#33172f', '#100911', '#db2777'],
  ];
  const [start, end, accent] = palettes[index % palettes.length];
  const title = getDiaryMediaTitle(item);

  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, start);
  gradient.addColorStop(0.58, end);
  gradient.addColorStop(1, '#050507');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.arc(x + width * 0.18, y + height * 0.5, height * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 92px Inter, Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(clampText(ctx, title.toUpperCase(), width * 0.72), x + width - 38, y + height - 32);
  ctx.restore();
}

export async function createDiaryShareImageBlob(items) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas indisponível');
  }

  const width = 1080;
  const height = 1920;
  const paddingX = 70;
  const rowHeight = 160;
  const listTop = 230;

  canvas.width = width;
  canvas.height = height;

  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#07070a');
  bgGradient.addColorStop(0.48, '#111014');
  bgGradient.addColorStop(1, '#07070a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(139, 92, 246, 0.18)';
  ctx.beginPath();
  ctx.arc(176, 190, 300, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c4b5fd';
  ctx.font = '900 28px Inter, Arial, sans-serif';
  ctx.fillText('CINESORTE', paddingX, 82);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px Inter, Arial, sans-serif';
  ctx.fillText('Meu diário', paddingX, 152);

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const y = listTop + index * rowHeight;
    const backdropPath = getDiaryBackdropPath(item);
    const posterPath = getDiaryPosterPath(item);
    const imagePath = backdropPath || posterPath;
    const imageSrc = tmdbImage(imagePath, backdropPath ? 'w780' : 'w500');

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(paddingX, y, width - paddingX * 2, rowHeight - 12, 30);
    ctx.clip();

    if (imageSrc) {
      try {
        const image = await loadCanvasImage(imageSrc);
        drawCoverImage(ctx, image, paddingX, y, width - paddingX * 2, rowHeight - 12);
      } catch {
        drawGeneratedBackdrop(ctx, item, index, paddingX, y, width - paddingX * 2, rowHeight - 12);
      }
    } else {
      drawGeneratedBackdrop(ctx, item, index, paddingX, y, width - paddingX * 2, rowHeight - 12);
    }

    const shade = ctx.createLinearGradient(paddingX, y, width - paddingX, y);
    shade.addColorStop(0, 'rgba(7,7,10,0.95)');
    shade.addColorStop(0.32, 'rgba(7,7,10,0.74)');
    shade.addColorStop(0.72, 'rgba(7,7,10,0.38)');
    shade.addColorStop(1, 'rgba(7,7,10,0.88)');
    ctx.fillStyle = shade;
    ctx.fillRect(paddingX, y, width - paddingX * 2, rowHeight - 12);
    ctx.restore();

    ctx.fillStyle = '#c4b5fd';
    ctx.font = '900 42px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(index + 1).padStart(2, '0'), paddingX + 58, y + 92);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px Inter, Arial, sans-serif';
    ctx.fillText(clampText(ctx, getDiaryMediaTitle(item), 560), paddingX + 124, y + 72);

    ctx.fillStyle = '#d4d4d8';
    ctx.font = '800 22px Inter, Arial, sans-serif';
    ctx.fillText(getDiaryMediaTypeLabel(item).toUpperCase(), paddingX + 124, y + 110);

    const rating = Number(item.vote_average || item.rating || 0);
    if (rating > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.52)';
      ctx.beginPath();
      ctx.roundRect(width - paddingX - 156, y + 48, 102, 54, 27);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.font = '900 26px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(rating.toFixed(1), width - paddingX - 105, y + 83);
      ctx.textAlign = 'left';
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas vazio'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}

export async function downloadDiaryShareImage(items) {
  const blob = await createDiaryShareImageBlob(items);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'diario-cinesorte.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 200);
}
