import {
  addWatchPartyQueueItem, blockWatchPartyParticipant, createWatchPartyRoom, deleteWatchPartyRoom, getFollowingWatchPartyRooms, getMyWatchPartyRooms, getPublicWatchPartyRooms, getWatchPartyRoom,
  getWatchPartyLiveVersion, joinWatchPartyRoom, updateWatchPartyRoom,
} from "@shared/api/api";

export const watchPartyRepository = {
  create: ({ form }) => createWatchPartyRoom(form),
  listMine: () => getMyWatchPartyRooms(),
  listPublic: () => getPublicWatchPartyRooms(),
  listFollowing: () => getFollowingWatchPartyRooms(),
  getLiveVersion: () => getWatchPartyLiveVersion(),
  findById: (roomId) => getWatchPartyRoom(roomId),
  findByCode: (code) => joinWatchPartyRoom(code),
  updateSettings: (roomId, settings) => updateWatchPartyRoom(roomId, settings),
  delete: (roomId) => deleteWatchPartyRoom(roomId),
  blockParticipant: (roomId, userId) => blockWatchPartyParticipant(roomId, userId),
  addVideo: (roomId, video) => addWatchPartyQueueItem(roomId, video),
};
