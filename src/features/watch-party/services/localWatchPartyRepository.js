const STORAGE_KEY = "cinesorte:watch-parties:v1";

const readRooms = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const saveRooms = (rooms) => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
const makeId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

function transact(roomId, update) {
  const rooms = readRooms();
  const room = rooms[roomId];
  if (!room) throw new Error("Sala não encontrada ou encerrada.");
  const nextRoom = { ...update(room), updatedAt: new Date().toISOString() };
  rooms[roomId] = nextRoom;
  saveRooms(rooms);
  return nextRoom;
}

export const localWatchPartyRepository = {
  create({ form, user }) {
    const id = makeId();
    const now = new Date().toISOString();
    const room = {
      id,
      code: makeCode(),
      name: form.name.trim(),
      service: form.service,
      privacy: form.privacy,
      allowGuestControl: form.allowGuestControl,
      hostId: user?.id || user?.username || "local-user",
      createdAt: now,
      updatedAt: now,
      playback: { status: "idle", position: 0, changedAt: now },
      queue: [],
      messages: [],
      participants: [{
        id: user?.id || user?.username || "local-user",
        name: user?.name || "Você",
        username: user?.username || "voce",
        photoURL: user?.photoURL || null,
        role: "host",
        online: true,
      }],
    };
    const rooms = readRooms();
    rooms[id] = room;
    saveRooms(rooms);
    return room;
  },

  findById(roomId) {
    return readRooms()[roomId] || null;
  },

  listByHost(hostId) {
    return Object.values(readRooms())
      .filter((room) => room.hostId === hostId)
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  },

  findByCode(code) {
    return Object.values(readRooms()).find((room) => room.code === code.toUpperCase()) || null;
  },

  updatePlayback(roomId, playback) {
    return transact(roomId, (room) => ({ ...room, playback: { ...room.playback, ...playback, changedAt: new Date().toISOString() } }));
  },

  updateSettings(roomId, settings) {
    return transact(roomId, (room) => ({ ...room, ...settings }));
  },

  addVideo(roomId, video) {
    return transact(roomId, (room) => {
      const item = { ...video, id: makeId(), addedAt: new Date().toISOString() };
      const queue = [...room.queue, item];
      return { ...room, queue, playback: room.playback.videoId ? room.playback : { ...room.playback, videoId: item.videoId, status: "paused", position: 0 } };
    });
  },

  selectVideo(roomId, videoId) {
    return transact(roomId, (room) => ({ ...room, playback: { ...room.playback, videoId, status: "paused", position: 0 } }));
  },

  removeVideo(roomId, itemId) {
    return transact(roomId, (room) => ({ ...room, queue: room.queue.filter((item) => item.id !== itemId) }));
  },

  sendMessage(roomId, message) {
    return transact(roomId, (room) => ({ ...room, messages: [...room.messages, { ...message, id: makeId(), createdAt: new Date().toISOString() }] }));
  },
};
