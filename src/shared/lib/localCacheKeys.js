export const DASHBOARD_SECTIONS_CACHE_PREFIX = "cinesorte_dashboard_sections_v7";
export const DASHBOARD_BECAUSE_CACHE_PREFIX = "cinesorte_dashboard_because_v2";
export const DASHBOARD_HERO_SET_CACHE_PREFIX = "cinesorte_dashboard_hero_set_v2";
export const INTERACTIONS_CACHE_PREFIX = "cinesorte_interactions_v1";

const VERSIONED_PREFIXES = [
  DASHBOARD_SECTIONS_CACHE_PREFIX,
  DASHBOARD_BECAUSE_CACHE_PREFIX,
  DASHBOARD_HERO_SET_CACHE_PREFIX,
  INTERACTIONS_CACHE_PREFIX,
];

const namespaceOf = (prefix) => String(prefix || "").replace(/_v\d+$/, "");
const versionOf = (prefix) => (String(prefix || "").match(/_v(\d+)$/) || [])[1] || null;

export function pruneStaleLocalCacheVersions() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ).filter(Boolean);

    keys.forEach((key) => {
      const separator = key.indexOf(":");
      const prefix = separator === -1 ? key : key.slice(0, separator);
      if (!versionOf(prefix)) return;

      const activePrefix = VERSIONED_PREFIXES.find(
        (item) => namespaceOf(item) === namespaceOf(prefix),
      );
      if (!activePrefix || activePrefix === prefix) return;

      localStorage.removeItem(key);
    });
  } catch {
    return;
  }
}
