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
    item.still_path,
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
    item.still_path,
  );
}
