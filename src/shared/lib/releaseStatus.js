const THEATRICAL_TYPES = new Set([2, 3]);
const DIGITAL_TYPES = new Set([4, 5]);
const REGION_PRIORITY = ["BR", "US"];

const UNRELEASED_STATUSES = new Set([
  "post production",
  "in production",
  "planned",
  "rumored",
  "pilot",
  "canceled",
]);

const FEMININE_PLATFORMS = [
  /^netflix\b/i,
  /^hbo\b/i,
  /^globo\b/i,
  /^crunchyroll\b/i,
  /^pluto\b/i,
  /^discovery channel\b/i,
];

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export const toDateKey = (value) => {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
};

const todayKey = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const splitDateKey = (dateKey) => {
  const key = toDateKey(dateKey);
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return null;
  return { year, month, day };
};

export const formatReleaseDay = (dateKey) => {
  const parts = splitDateKey(dateKey);
  if (!parts) return null;
  return `${parts.day} de ${MONTHS_SHORT[parts.month - 1]}.`;
};

export const formatReleaseFull = (dateKey) => {
  const parts = splitDateKey(dateKey);
  if (!parts) return null;
  return `${parts.day} de ${MONTHS_LONG[parts.month - 1]} de ${parts.year}`;
};

const resolveMediaType = (media, mediaType) => {
  const explicit = mediaType || media?.media_type || media?.mediaType;
  if (explicit === "movie" || explicit === "tv") return explicit;
  return media?.first_air_date || media?.firstAirDate || media?.name ? "tv" : "movie";
};

const collectReleaseEvents = (media) => {
  const events = [];
  const results = media?.release_dates?.results;
  if (!Array.isArray(results)) return events;

  REGION_PRIORITY.forEach((region) => {
    const entry = results.find((item) => item?.iso_3166_1 === region);
    if (!entry) return;

    (entry.release_dates || []).forEach((release) => {
      const date = toDateKey(release?.release_date);
      if (!date) return;
      const type = Number(release?.type);
      if (THEATRICAL_TYPES.has(type)) events.push({ date, kind: "theatrical" });
      else if (DIGITAL_TYPES.has(type)) events.push({ date, kind: "digital" });
    });
  });

  return events;
};

const withPreposition = (name) => {
  const clean = String(name || "").trim();
  if (!clean) return null;
  const feminine = FEMININE_PLATFORMS.some((pattern) => pattern.test(clean));
  return `${feminine ? "na" : "no"} ${clean}`;
};

const findNetworkPlatform = (media) => {
  const networks = media?.networks;
  if (!Array.isArray(networks) || networks.length === 0) return null;
  return withPreposition(networks[0]?.name);
};

const build = (kind, date, media, type) => {
  const platform = type === "tv" ? findNetworkPlatform(media) : null;

  const where =
    kind === "theatrical"
      ? "nos cinemas"
      : kind === "digital"
        ? platform || "no streaming"
        : platform;

  return {
    kind,
    date,
    where,
    label: where ? `Em breve ${where}` : "Em breve",
    dayLabel: formatReleaseDay(date),
    fullDate: formatReleaseFull(date),
  };
};

export function getReleaseStatus(media = {}, mediaType) {
  const type = resolveMediaType(media, mediaType);
  const status = String(media?.status || "").trim().toLowerCase();
  const primaryDate =
    toDateKey(media?.release_date) ||
    toDateKey(media?.first_air_date) ||
    toDateKey(media?.releaseDate) ||
    toDateKey(media?.firstAirDate);
  const today = todayKey();

  if (type === "movie") {
    const future = collectReleaseEvents(media)
      .filter((event) => event.date > today)
      .sort((first, second) => first.date.localeCompare(second.date));

    const theatrical = future.find((event) => event.kind === "theatrical");
    if (theatrical) return build("theatrical", theatrical.date, media, type);

    const digital = future.find((event) => event.kind === "digital");
    if (digital) return build("digital", digital.date, media, type);
  }

  if (primaryDate && primaryDate > today) return build("unknown", primaryDate, media, type);
  if (!primaryDate && UNRELEASED_STATUSES.has(status)) return build("unknown", null, media, type);

  return null;
}

export default getReleaseStatus;
