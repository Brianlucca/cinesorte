import { strFromU8, unzipSync } from "fflate";

export const LETTERBOXD_IMPORT_LIMIT = 150;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 80 * 1024 * 1024;

const normalizeHeader = (value) =>
  String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase();

export const normalizeLetterboxdTitle = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseCsvRows = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  row.push(field);
  if (row.some((value) => String(value).trim())) rows.push(row);
  return rows;
};

const toListItems = (text) => {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const column = (names) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
  const titleColumn = column(["name", "title", "original title"]);
  const yearColumn = column(["year", "release year"]);
  const uriColumn = column(["letterboxd uri", "url", "uri"]);
  const positionColumn = column(["position", "rank"]);

  if (titleColumn < 0) {
    throw new Error("O CSV não possui uma coluna Name ou Title reconhecida.");
  }

  const seen = new Set();
  return rows
    .slice(1)
    .map((values, index) => {
      const title = String(values[titleColumn] || "").trim();
      const rawYear = yearColumn >= 0 ? String(values[yearColumn] || "") : "";
      const yearMatch = rawYear.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : "";
      const uri = uriColumn >= 0 ? String(values[uriColumn] || "").trim() : "";
      const rawPosition = positionColumn >= 0 ? Number(values[positionColumn]) : NaN;

      return {
        title,
        year,
        uri,
        position: Number.isFinite(rawPosition) ? rawPosition : index + 1,
      };
    })
    .filter((item) => {
      if (!item.title) return false;
      const key = `${normalizeLetterboxdTitle(item.title)}:${item.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((first, second) => first.position - second.position);
};

const decodeFileName = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const listNameFromPath = (path) => {
  const fileName = path.split("/").pop() || "Lista do Letterboxd";
  const withoutExtension = decodeFileName(fileName.replace(/\.csv$/i, "")).trim();
  if (withoutExtension.toLowerCase() === "watchlist") return "Watchlist do Letterboxd";
  return withoutExtension || "Lista do Letterboxd";
};

const toImportList = (path, bytes) => {
  const items = toListItems(strFromU8(bytes));
  if (items.length === 0) return null;

  return {
    id: path,
    name: listNameFromPath(path).slice(0, 60),
    sourcePath: path,
    items,
  };
};

const isSupportedArchiveEntry = (path) => {
  const normalized = path.replace(/\\/g, "/").toLowerCase();
  const segments = normalized.split("/").filter(Boolean);
  const fileName = segments.at(-1) || "";
  if (!fileName.endsWith(".csv") || segments.includes("deleted")) return false;
  if (fileName === "watchlist.csv") return true;
  return segments.includes("lists") && fileName !== "lists.csv";
};

export const getUniqueTitleCount = (lists) => {
  const titles = new Set();
  lists.forEach((list) => {
    list.items.forEach((item) => {
      titles.add(`${normalizeLetterboxdTitle(item.title)}:${item.year}`);
    });
  });
  return titles.size;
};

export const parseLetterboxdExport = async (file) => {
  if (!file) throw new Error("Selecione um arquivo do Letterboxd.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("O arquivo ultrapassa o limite de 25 MB.");
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".zip") && !lowerName.endsWith(".csv")) {
    throw new Error("Use o arquivo ZIP exportado pelo Letterboxd ou um CSV de lista.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (lowerName.endsWith(".csv")) {
    const list = toImportList(file.name, bytes);
    if (!list) throw new Error("O CSV não contém títulos para importar.");
    return { fileName: file.name, lists: [list] };
  }

  let archive;
  try {
    archive = unzipSync(bytes);
  } catch {
    throw new Error("Não foi possível abrir o ZIP. Gere um novo export no Letterboxd.");
  }

  const entries = Object.entries(archive).filter(([path]) => isSupportedArchiveEntry(path));
  const totalBytes = entries.reduce((total, [, content]) => total + content.byteLength, 0);
  if (totalBytes > MAX_UNCOMPRESSED_BYTES) {
    throw new Error("O conteúdo descompactado ultrapassa o limite de segurança.");
  }

  const lists = entries
    .map(([path, content]) => toImportList(path.replace(/\\/g, "/"), content))
    .filter(Boolean);

  if (lists.length === 0) {
    throw new Error("Nenhuma watchlist ou lista personalizada foi encontrada nesse export.");
  }

  return { fileName: file.name, lists };
};

const releaseYearOf = (item) =>
  String(item.release_date || item.first_air_date || "").slice(0, 4);

const candidateTitles = (item) => [
  item.title,
  item.original_title,
  item.name,
  item.original_name,
].filter(Boolean);

export const pickBestTmdbMatch = (source, results) => {
  const sourceTitle = normalizeLetterboxdTitle(source.title);
  const sourceYear = Number(source.year) || null;

  const ranked = (Array.isArray(results) ? results : [])
    .filter((item) => item?.id && ["movie", "tv"].includes(item.media_type))
    .map((item) => {
      const normalizedTitles = candidateTitles(item).map(normalizeLetterboxdTitle);
      const exactTitle = normalizedTitles.includes(sourceTitle);
      const closeTitle = normalizedTitles.some(
        (title) => title.includes(sourceTitle) || sourceTitle.includes(title),
      );
      const candidateYear = Number(releaseYearOf(item)) || null;
      const yearDistance = sourceYear && candidateYear
        ? Math.abs(sourceYear - candidateYear)
        : null;
      let score = exactTitle ? 100 : closeTitle ? 62 : 0;
      if (yearDistance === 0) score += 30;
      else if (yearDistance === 1) score += 10;
      else if (sourceYear && candidateYear) score -= Math.min(yearDistance * 5, 35);
      if (item.media_type === "movie") score += 6;
      return { item, score, candidateYear, yearDistance };
    })
    .filter(({ candidateYear, yearDistance }) => (
      !sourceYear || !candidateYear || yearDistance <= 1
    ))
    .sort((first, second) => second.score - first.score);

  return ranked[0]?.score >= 62 ? ranked[0].item : null;
};
