import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@shared/context/useToast";
import { INITIAL_PARTY_FORM } from "@features/watch-party/data/watchPartyOptions";
import { watchPartyRepository as repository } from "@features/watch-party/services/watchPartyRepository";

const normalizeCode = (value) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);

export function useWatchPartyLobby() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_PARTY_FORM);
  const [inviteCode, setInviteCode] = useState("");
  const [myRooms, setMyRooms] = useState([]);
  const [followingRooms, setFollowingRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    let active = true;
    const loadRooms = () =>
      Promise.allSettled([
        repository.listMine(),
        repository.listFollowing(),
        repository.listPublic(),
      ])
        .then(([mine, following, publicRooms]) => {
          if (!active) return;
          setMyRooms(
            mine.status === "fulfilled" && Array.isArray(mine.value)
              ? mine.value
              : [],
          );
          const networkRooms =
            following.status === "fulfilled" && Array.isArray(following.value)
              ? following.value
              : [];
          const publicList =
            publicRooms.status === "fulfilled" &&
            Array.isArray(publicRooms.value)
              ? publicRooms.value
              : [];
          setFollowingRooms([
            ...new Map(
              [...publicList, ...networkRooms].map((room) => [room.id, room]),
            ).values(),
          ]);
        })
        .finally(() => {
          if (active) setLoadingRooms(false);
        });
    loadRooms();
    const refreshTimer = window.setInterval(loadRooms, 30000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  const canCreate = useMemo(() => form.name.trim().length >= 3, [form.name]);
  const canJoin = inviteCode.length >= 6;

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);
  const updateInviteCode = useCallback(
    (value) => setInviteCode(normalizeCode(value)),
    [],
  );

  const createRoom = useCallback(async () => {
    if (!canCreate) return;
    try {
      const room = await repository.create({ form });
      setIsCreateOpen(false);
      navigate(`/app/watch-party/${room.id}`);
    } catch (error) {
      toast.error(
        "Não foi possível criar",
        error.message || "Confira a conexão com o servidor.",
      );
    }
  }, [canCreate, form, navigate, toast]);

  const joinRoom = useCallback(async () => {
    if (!canJoin) return;
    try {
      const room = await repository.findByCode(inviteCode);
      navigate(`/app/watch-party/${room.id}`);
    } catch {
      toast.error(
        "Sala não encontrada",
        "Confira o código recebido e tente novamente.",
      );
    }
  }, [canJoin, inviteCode, navigate, toast]);

  return {
    state: {
      isCreateOpen,
      form,
      inviteCode,
      canCreate,
      canJoin,
      myRooms,
      followingRooms,
      loadingRooms,
    },
    actions: {
      openCreate,
      closeCreate,
      updateField,
      updateInviteCode,
      createRoom,
      joinRoom,
    },
  };
}
