export function createWatchPartySocket(roomId) {
  const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL);
  apiUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  apiUrl.pathname = `${apiUrl.pathname.replace(/\/$/, "")}/watch-party/ws`;
  apiUrl.search = new URLSearchParams({ roomId }).toString();
  return new WebSocket(apiUrl);
}
