import { useEffect, useMemo, useState } from "react";

const DEFAULT_ACCENT = { r: 139, g: 92, b: 246 };
const BASE_SURFACE = { r: 17, g: 18, b: 22 };
const PALETTE_STORAGE_PREFIX = "cinesorte_media_palette_v1";
const paletteCache = new Map();

const GENRE_ACCENTS = [
  { terms: ["terror", "thriller", "crime"], color: { r: 225, g: 84, b: 104 } },
  { terms: ["ficcao cientifica", "science fiction", "misterio"], color: { r: 67, g: 190, b: 201 } },
  { terms: ["fantasia", "fantasy"], color: { r: 167, g: 139, b: 250 } },
  { terms: ["romance"], color: { r: 236, g: 111, b: 157 } },
  { terms: ["animacao", "familia", "comedia"], color: { r: 242, g: 166, b: 74 } },
  { terms: ["acao", "aventura", "guerra"], color: { r: 235, g: 112, b: 72 } },
  { terms: ["documentario", "historia"], color: { r: 108, g: 190, b: 139 } },
];

const FALLBACK_ACCENTS = [
  DEFAULT_ACCENT,
  { r: 57, g: 189, b: 184 },
  { r: 228, g: 116, b: 79 },
  { r: 219, g: 105, b: 151 },
  { r: 201, g: 156, b: 69 },
  { r: 91, g: 142, b: 229 },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const isValidAccent = (accent) =>
  accent &&
  [accent.r, accent.g, accent.b].every(
    (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255,
  );

const getPaletteStorageKey = (imageUrl) =>
  `${PALETTE_STORAGE_PREFIX}:${imageUrl}`;

const readCachedAccent = (imageUrl) => {
  if (!imageUrl) return null;
  if (paletteCache.has(imageUrl)) return paletteCache.get(imageUrl);

  try {
    const storedAccent = JSON.parse(
      localStorage.getItem(getPaletteStorageKey(imageUrl)),
    );
    if (!isValidAccent(storedAccent)) return null;
    paletteCache.set(imageUrl, storedAccent);
    return storedAccent;
  } catch {
    return null;
  }
};

const writeCachedAccent = (imageUrl, accent) => {
  paletteCache.set(imageUrl, accent);
  try {
    localStorage.setItem(
      getPaletteStorageKey(imageUrl),
      JSON.stringify(accent),
    );
  } catch {
    // The in-memory palette still prevents changes while navigating.
  }
};

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const rgbToHsl = ({ r, g, b }) => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: lightness };

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue;

  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  return { h: hue / 6, s: saturation, l: lightness };
};

const hslToRgb = ({ h, s, l }) => {
  if (s === 0) {
    const channel = Math.round(l * 255);
    return { r: channel, g: channel, b: channel };
  }

  const hueToRgb = (p, q, hue) => {
    let adjustedHue = hue;
    if (adjustedHue < 0) adjustedHue += 1;
    if (adjustedHue > 1) adjustedHue -= 1;
    if (adjustedHue < 1 / 6) return p + (q - p) * 6 * adjustedHue;
    if (adjustedHue < 1 / 2) return q;
    if (adjustedHue < 2 / 3) return p + (q - p) * (2 / 3 - adjustedHue) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h) * 255),
    b: Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  };
};

const normalizeAccent = (color) => {
  const hsl = rgbToHsl(color);
  return hslToRgb({
    h: hsl.h,
    s: clamp(hsl.s * 1.12, 0.56, 0.82),
    l: clamp(hsl.l, 0.5, 0.62),
  });
};

const blend = (foreground, background, amount) => ({
  r: Math.round(foreground.r * amount + background.r * (1 - amount)),
  g: Math.round(foreground.g * amount + background.g * (1 - amount)),
  b: Math.round(foreground.b * amount + background.b * (1 - amount)),
});

const toRgb = ({ r, g, b }) => `rgb(${r} ${g} ${b})`;
const toRgba = ({ r, g, b }, alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const getRelativeLuminance = ({ r, g, b }) => {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
};

const getContrastColor = (background) => {
  const backgroundLuminance = getRelativeLuminance(background);
  const dark = { r: 11, g: 12, b: 15 };
  const darkContrast = (backgroundLuminance + 0.05) / (getRelativeLuminance(dark) + 0.05);
  const lightContrast = 1.05 / (backgroundLuminance + 0.05);
  return darkContrast >= lightContrast ? "#0b0c0f" : "#ffffff";
};

const getFallbackAccent = (genres, seed) => {
  const genreText = normalizeText(genres?.map((genre) => genre?.name || genre).join(" "));
  const genreMatch = GENRE_ACCENTS.find(({ terms }) =>
    terms.some((term) => genreText.includes(term)),
  );

  if (genreMatch) return genreMatch.color;

  const hash = String(seed || "cinesorte")
    .split("")
    .reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 0);
  return FALLBACK_ACCENTS[hash % FALLBACK_ACCENTS.length];
};

const extractAccent = (imageUrl) => {
  const cachedAccent = readCachedAccent(imageUrl);
  if (cachedAccent) return Promise.resolve(cachedAccent);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const width = 48;
        const height = 27;
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas indisponível");

        context.drawImage(image, 0, 0, width, height);
        const pixels = context.getImageData(0, 0, width, height).data;
        const buckets = new Map();

        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index + 3] < 220) continue;

          const color = { r: pixels[index], g: pixels[index + 1], b: pixels[index + 2] };
          const { s, l } = rgbToHsl(color);
          if (l < 0.1 || l > 0.9 || s < 0.16) continue;

          const key = `${Math.round(color.r / 28)}-${Math.round(color.g / 28)}-${Math.round(color.b / 28)}`;
          const centerPreference = 1 - Math.min(0.55, Math.abs(l - 0.5));
          const weight = (0.45 + s * 1.7) * centerPreference;
          const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, weight: 0, score: 0 };
          bucket.r += color.r * weight;
          bucket.g += color.g * weight;
          bucket.b += color.b * weight;
          bucket.weight += weight;
          bucket.score += weight * (0.75 + s);
          buckets.set(key, bucket);
        }

        const winner = [...buckets.values()].sort((left, right) => right.score - left.score)[0];
        if (!winner) throw new Error("Nenhuma cor útil encontrada");

        const accent = normalizeAccent({
          r: Math.round(winner.r / winner.weight),
          g: Math.round(winner.g / winner.weight),
          b: Math.round(winner.b / winner.weight),
        });
        writeCachedAccent(imageUrl, accent);
        resolve(accent);
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error("Não foi possível analisar a imagem"));
    image.src = imageUrl;
  });
};

const createThemeStyle = (accent) => {
  const normalized = normalizeAccent(accent);
  const textAccent = hslToRgb({ ...rgbToHsl(normalized), l: 0.74 });
  const hoverAccent = hslToRgb({ ...rgbToHsl(normalized), l: 0.68 });
  const surface = blend(normalized, BASE_SURFACE, 0.13);

  return {
    "--media-accent": toRgb(normalized),
    "--media-accent-hover": toRgb(hoverAccent),
    "--media-accent-text": toRgb(textAccent),
    "--media-accent-soft": toRgba(normalized, 0.15),
    "--media-accent-faint": toRgba(normalized, 0.075),
    "--media-accent-border": toRgba(normalized, 0.34),
    "--media-accent-glow": toRgba(normalized, 0.28),
    "--media-accent-surface": toRgb(surface),
    "--media-accent-contrast": getContrastColor(normalized),
  };
};

export function useMediaTheme({ imageUrl, genres, seed }) {
  const fallbackAccent = useMemo(
    () => getFallbackAccent(genres, seed),
    [genres, seed],
  );
  const cachedAccent = useMemo(
    () => readCachedAccent(imageUrl),
    [imageUrl],
  );
  const [resolvedAccent, setResolvedAccent] = useState(null);

  useEffect(() => {
    let active = true;

    if (imageUrl) {
      extractAccent(imageUrl)
        .then((extractedAccent) => {
          if (active) setResolvedAccent({ imageUrl, accent: extractedAccent });
        })
        .catch(() => {
          if (active) setResolvedAccent({ imageUrl, accent: fallbackAccent });
        });
    } else {
      setResolvedAccent(null);
    }

    return () => {
      active = false;
    };
  }, [fallbackAccent, imageUrl]);

  const accent = resolvedAccent?.imageUrl === imageUrl
    ? resolvedAccent.accent
    : cachedAccent || fallbackAccent;

  return useMemo(
    () => ({
      ...createThemeStyle(accent),
      "--media-backdrop-glow": toRgba(normalizeAccent(fallbackAccent), 0.2),
    }),
    [accent, fallbackAccent],
  );
}
