import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@shared/context/useToast";
import { watchPartyRepository as repository } from "@features/watch-party/services/watchPartyRepository";
import {
  getYouTubeVideoId,
  youtubeThumbnail,
} from "@features/watch-party/utils/youtube";
import { useTemporaryPartyChat } from "@features/watch-party/hooks/useTemporaryPartyChat";

const normalizeRoom = (room) => ({
  ...room,
  participants: (room.participants || []).map((participant) => ({
    ...participant,
    name: participant.name || participant.username || "Usuário",
    online: true,
  })),
  messages: (room.messages || []).map((message) => ({
    ...message,
    text: message.text || message.body,
  })),
  queue: room.queue || [],
});

export function useWatchPartyRoom() {
  const { roomId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const chat = useTemporaryPartyChat(roomId);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerCommand, setPlayerCommand] = useState(null);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    repository
      .findById(roomId)
      .then((data) => {
        if (active) setRoom(normalizeRoom(data));
      })
      .catch(() => {
        if (active) setRoom(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roomId]);

  const controlPlayback = useCallback(
    (action, position = 0) => {
      if (!room) return;
      const status =
        action === "play"
          ? "playing"
          : action === "pause"
            ? "paused"
            : room.playback.status;
      setRoom((current) => ({
        ...current,
        playback: { ...current.playback, status, position },
      }));
      setPlayerCommand({ action, position, nonce: Date.now() });
    },
    [room],
  );

  const addVideo = useCallback(
    async ({ url, title }) => {
      const videoId = getYouTubeVideoId(url);
      if (!videoId) throw new Error("Use um link ou ID válido do YouTube.");
      const item = await repository.addVideo(room.id, {
        videoId,
        title: title.trim() || "Vídeo do YouTube",
        thumbnail: youtubeThumbnail(videoId),
      });
      setRoom((current) => ({
        ...current,
        queue: [...current.queue, item],
        playback: current.playback.videoId
          ? current.playback
          : { ...current.playback, videoId, status: "paused", position: 0 },
      }));
      setIsAddVideoOpen(false);
      toast.success(
        "Vídeo adicionado",
        "Ele já está disponível na fila da sala.",
      );
    },
    [room, toast],
  );

  const selectVideo = useCallback((videoId) => {
    setRoom((current) => ({
      ...current,
      playback: { ...current.playback, videoId, status: "paused", position: 0 },
    }));
    setPlayerCommand({ action: "load", videoId, nonce: Date.now() });
  }, []);

  const playNextVideo = useCallback(() => {
    const currentIndex = room.queue.findIndex(
      (item) => item.videoId === room.playback.videoId,
    );
    const nextVideo = room.queue[currentIndex + 1];
    if (!nextVideo) {
      setRoom((current) => ({
        ...current,
        playback: { ...current.playback, status: "ended", position: 0 },
      }));
      toast.info("Fim da fila", "Não há outro vídeo esperando para tocar.");
      return;
    }
    selectVideo(nextVideo.videoId);
    setRoom((current) => ({
      ...current,
      playback: { ...current.playback, status: "playing" },
    }));
    toast.info("Próximo vídeo", nextVideo.title);
  }, [room, selectVideo, toast]);

  const removeVideo = useCallback(
    (itemId) =>
      setRoom((current) => ({
        ...current,
        queue: current.queue.filter((item) => item.id !== itemId),
      })),
    [],
  );
  const updateSettings = useCallback(
    async (settings) => {
      const updatedRoom = await repository.updateSettings(room.id, settings);
      setRoom((current) => ({ ...current, ...updatedRoom }));
      setIsSettingsOpen(false);
      toast.success("Sala atualizada", "As novas regras já estão valendo.");
    },
    [room, toast],
  );
  const copyInvite = useCallback(async () => {
    const invitation =
      room.privacy === "public"
        ? `${window.location.origin}/app/watch-party/${room.id}`
        : room.code;
    await navigator.clipboard.writeText(invitation);
    toast.success(
      room.privacy === "public" ? "Link copiado" : "Código copiado",
      room.privacy === "public"
        ? "Qualquer pessoa conectada ao CineSorte pode acessar."
        : `Código da sala: ${room.code}`,
    );
  }, [room, toast]);
  const deleteRoom = useCallback(async () => {
    if (!room) return;
    try {
      await repository.delete(room.id);
      toast.success("Sala excluída", "A sessão e seus dados foram removidos.");
      navigate("/app/watch-party", { replace: true });
    } catch (error) {
      toast.error(
        "Não foi possível excluir",
        error.message || "Tente novamente.",
      );
    }
  }, [navigate, room, toast]);
  const currentVideo = useMemo(
    () =>
      room?.queue.find((item) => item.videoId === room.playback.videoId) ||
      null,
    [room],
  );
  const blockParticipant = useCallback(
    async (userId) => {
      if (!room) return;
      try {
        const sent = chat.kickParticipant(userId);
        if (!sent) await repository.blockParticipant(room.id, userId);
        toast.success(
          "Pessoa removida",
          "Ela não poderá entrar novamente nesta sala.",
        );
      } catch (error) {
        toast.error(
          "Não foi possível remover",
          error.message || "Tente novamente.",
        );
      }
    },
    [chat, room, toast],
  );

  return {
    state: {
      room,
      messages: chat.messages,
      participants: chat.participants,
      loading,
      currentVideo,
      playerCommand,
      isAddVideoOpen,
      isParticipantsOpen,
      isSettingsOpen,
    },
    actions: {
      controlPlayback,
      addVideo,
      selectVideo,
      playNextVideo,
      removeVideo,
      sendMessage: chat.sendMessage,
      copyInvite,
      updateSettings,
      deleteRoom,
      blockParticipant,
      openAddVideo: () => setIsAddVideoOpen(true),
      closeAddVideo: () => setIsAddVideoOpen(false),
      openParticipants: () => setIsParticipantsOpen(true),
      closeParticipants: () => setIsParticipantsOpen(false),
      openSettings: () => setIsSettingsOpen(true),
      closeSettings: () => setIsSettingsOpen(false),
      leave: () => navigate("/app/watch-party"),
    },
  };
}
