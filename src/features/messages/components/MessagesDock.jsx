import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Search,
  UserPlus,
  Ban,
  X,
} from "lucide-react";
import {
  getConversationMessages,
  getHiddenOwnedMessageGroups,
  getMessageConversations,
  getMessageUnreadCount,
  deleteMessageConversation,
  deleteMessageGroup,
  markConversationRead,
  restoreMessageConversation,
  sendConversationMessage,
  getBlockedUsers,
  unblockUser,
  blockUser,
} from "@shared/api/api";
import { useAuth } from "@shared/context/useAuth";
import { useToast } from "@shared/context/useToast";
import ConversationComposer from "@features/messages/components/ConversationComposer";
import MessageChatWindow from "@features/messages/components/MessageChatWindow";
import MessageThreadList from "@features/messages/components/MessageThreadList";
import { buildConversationView, cleanMessageMedia } from "@features/messages/utils/messageUtils";
import Modal from "@shared/components/ui/Modal";

const FALLBACK_REFRESH_MS = 120000;
const MESSAGE_FILTERS = [
  { id: "all", label: "Tudo" },
  { id: "direct", label: "Privado" },
  { id: "group", label: "Grupos" },
  { id: "hidden", label: "Ocultos" },
  { id: "blocked", label: "Bloqueados" },
];

function streamUrl(path) {
  const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
  return `${base}/messages${path}`;
}

export default function MessagesDock({ defaultOpen = false, initialConversationId = null }) {
  const { authenticated } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [composerMode, setComposerMode] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [hiddenConversations, setHiddenConversations] = useState([]);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [chatNotice, setChatNotice] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const handledInitialConversationRef = useRef(null);

  const visibleThreads = useMemo(
    () => conversations.map((conversation) => buildConversationView(conversation)),
    [conversations],
  );
  const hiddenThreads = useMemo(
    () => hiddenConversations.map((conversation) => buildConversationView({ ...conversation, hidden: true })),
    [hiddenConversations],
  );
  const allThreads = useMemo(() => [...visibleThreads, ...hiddenThreads], [visibleThreads, hiddenThreads]);
  const displayThreads = filter === "hidden" ? hiddenThreads : visibleThreads;

  const activeThread = allThreads.find((thread) => thread.id === activeThreadId) || null;
  const activeMessages = activeThreadId ? messagesByConversation[activeThreadId] || [] : [];
  const activeFilter = MESSAGE_FILTERS.find((item) => item.id === filter) || MESSAGE_FILTERS[0];
  const blockedUsernames = useMemo(
    () => new Set(blockedUsers.map((user) => user.username).filter(Boolean)),
    [blockedUsers],
  );
  const activeThreadBlocked = Boolean(activeThread?.username && blockedUsernames.has(activeThread.username));

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return displayThreads.filter((thread) => {
      const matchesFilter = filter === "all" || filter === "hidden" || thread.type === filter;
      const matchesQuery =
        !normalizedQuery ||
        thread.displayName?.toLowerCase().includes(normalizedQuery) ||
        thread.username?.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [displayThreads, filter, query]);

  const refreshUnread = useCallback(async () => {
    if (!authenticated) return;
    try {
      const response = await getMessageUnreadCount();
      setUnreadTotal(Number(response?.count) || 0);
    } catch {
      setUnreadTotal(0);
    }
  }, [authenticated]);

  const loadConversations = useCallback(async ({ silent = false } = {}) => {
    if (!authenticated) return;
    if (!silent) setLoadingConversations(true);
    try {
      const [data, hiddenData] = await Promise.all([
        getMessageConversations(),
        getHiddenOwnedMessageGroups(),
      ]);
      const list = Array.isArray(data) ? data : [];
      const hiddenList = Array.isArray(hiddenData) ? hiddenData : [];
      setConversations(list);
      setHiddenConversations(hiddenList);
      setUnreadTotal(list.reduce((total, item) => total + (Number(item.unreadCount) || 0), 0));
    } catch (error) {
      if (!silent) toast.error("Mensagens indisponíveis", error.message || "Não foi possível carregar as conversas.");
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, [authenticated, toast]);

  const loadMessages = useCallback(async (conversationId, { silent = false } = {}) => {
    if (!conversationId || !authenticated) return;
    if (!silent) setLoadingMessages(true);
    try {
      const data = await getConversationMessages(conversationId, { limit: 40 });
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      if (!silent) toast.error("Conversa indisponível", error.message || "Não foi possível carregar as mensagens.");
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [authenticated, toast]);

  const selectThread = useCallback(async (conversationId) => {
    const selectedThread = allThreads.find((thread) => thread.id === conversationId);
    let threadToOpen = selectedThread;

    if (selectedThread?.hidden) {
      try {
        const restored = await restoreMessageConversation(conversationId);
        threadToOpen = buildConversationView(restored);
        setHiddenConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId));
        setConversations((prev) => {
          const withoutDuplicate = prev.filter((conversation) => conversation.id !== conversationId);
          return [restored, ...withoutDuplicate];
        });
        setFilter("group");
      } catch (error) {
        toast.error("Não foi possível restaurar", error.message || "Tente novamente em instantes.");
        return;
      }
    }

    setActiveThreadId(threadToOpen?.id || conversationId);
    await loadMessages(conversationId);
    try {
      await markConversationRead(conversationId);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
        ),
      );
      await refreshUnread();
      window.dispatchEvent(new CustomEvent("cinesorte:notifications-refresh"));
    } catch {
      // Read receipts are best-effort and should not block the chat.
    }
  }, [allThreads, loadMessages, refreshUnread, toast]);

  useEffect(() => {
    if (defaultOpen) setIsOpen(true);
  }, [defaultOpen]);

  useEffect(() => {
    if (!authenticated || !initialConversationId) return;
    if (handledInitialConversationRef.current === initialConversationId) return;

    handledInitialConversationRef.current = initialConversationId;
    setIsOpen(true);
    selectThread(initialConversationId);
  }, [authenticated, initialConversationId, selectThread]);

  const handleCreatedConversation = (conversation) => {
    setConversations((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== conversation.id);
      return [conversation, ...withoutDuplicate];
    });
    setHiddenConversations((prev) => prev.filter((item) => item.id !== conversation.id));
    setIsOpen(true);
    selectThread(conversation.id);
  };

  const handleSend = async ({ text, media }) => {
    if (!activeThreadId || sending) return;
    if (activeThreadBlocked) {
      toast.info("Conversa bloqueada", "Você pode ver o histórico, mas não pode enviar mensagens para este usuário.");
      return;
    }
    setSending(true);
    try {
      const payload = { text };
      const cleanMedia = cleanMessageMedia(media);
      if (cleanMedia) payload.media = cleanMedia;

      const message = await sendConversationMessage(activeThreadId, payload);
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), message],
      }));
      setConversations((prev) => prev.map((conversation) =>
        conversation.id === activeThreadId
          ? {
              ...conversation,
              lastMessagePreview: message.text || (message.media ? "Mídia compartilhada" : "Mensagem"),
              updatedAt: message.createdAt || Date.now(),
            }
          : conversation,
      ));
      window.dispatchEvent(new CustomEvent("cinesorte:notifications-refresh"));
    } catch (error) {
      toast.error("Mensagem não enviada", error.message || "Tente novamente em instantes.");
    } finally {
      setSending(false);
    }
  };

  const executeDeleteConversation = async () => {
    if (!activeThreadId) return;
    const isGroup = activeThread?.type === "group";

    try {
      await deleteMessageConversation(activeThreadId);
      setConversations((prev) => prev.filter((conversation) => conversation.id !== activeThreadId));
      setHiddenConversations((prev) => prev.filter((conversation) => conversation.id !== activeThreadId));
      setMessagesByConversation((prev) => {
        const next = { ...prev };
        delete next[activeThreadId];
        return next;
      });
      setActiveThreadId(null);
      await loadConversations({ silent: true });
      window.dispatchEvent(new CustomEvent("cinesorte:notifications-refresh"));
    } catch (error) {
      toast.error(isGroup ? "Não foi possível ocultar" : "Não foi possível apagar", error.message || "Tente novamente em instantes.");
    }
  };

  const handleDeleteConversation = () => {
    if (!activeThreadId) return;
    const isGroup = activeThread?.type === "group";
    setConfirmAction({
      type: "delete-conversation",
      title: isGroup ? "Ocultar grupo" : "Apagar conversa",
      message: isGroup
        ? "Este grupo sai da sua lista, mas continua existindo para os participantes."
        : "Esta conversa sai da sua lista de mensagens.",
      confirmLabel: isGroup ? "Ocultar" : "Apagar",
      danger: !isGroup,
    });
  };

  const executeDeleteGroup = async () => {
    if (!activeThreadId) return;

    try {
      await deleteMessageGroup(activeThreadId);
      setConversations((prev) => prev.filter((conversation) => conversation.id !== activeThreadId));
      setHiddenConversations((prev) => prev.filter((conversation) => conversation.id !== activeThreadId));
      setMessagesByConversation((prev) => {
        const next = { ...prev };
        delete next[activeThreadId];
        return next;
      });
      setActiveThreadId(null);
      await loadConversations({ silent: true });
      window.dispatchEvent(new CustomEvent("cinesorte:notifications-refresh"));
    } catch (error) {
      toast.error("Não foi possível excluir", error.message || "Apenas o criador pode excluir o grupo.");
    }
  };

  const handleDeleteGroup = () => {
    if (!activeThreadId) return;
    setConfirmAction({
      type: "delete-group",
      title: "Excluir grupo",
      message: "Este grupo será excluído para todos os participantes.",
      confirmLabel: "Excluir",
      danger: true,
    });
  };

  useEffect(() => {
    if (!authenticated) return undefined;

    refreshUnread();
    const interval = window.setInterval(() => {
      if (!document.hidden) refreshUnread();
    }, FALLBACK_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [authenticated, refreshUnread]);

  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen, loadConversations]);

  const loadBlockedUsers = useCallback(async () => {
    if (!authenticated) return;
    try {
      const data = await getBlockedUsers();
      setBlockedUsers(Array.isArray(data) ? data : []);
    } catch {
      setBlockedUsers([]);
    }
  }, [authenticated]);

  useEffect(() => {
    if (isOpen) loadBlockedUsers();
  }, [isOpen, loadBlockedUsers]);

  useEffect(() => {
    if (filter !== "blocked") return;
    setLoadingBlocked(true);
    loadBlockedUsers().finally(() => setLoadingBlocked(false));
  }, [filter, loadBlockedUsers]);

  useEffect(() => {
    if (!filtersOpen) return undefined;

    const closeFilters = (event) => {
      if (!event.target.closest("[data-message-filter]")) setFiltersOpen(false);
    };

    window.addEventListener("pointerdown", closeFilters);
    return () => window.removeEventListener("pointerdown", closeFilters);
  }, [filtersOpen]);

  const handleUnblockUser = async (username) => {
    try {
      await unblockUser(username);
      setBlockedUsers((prev) => prev.filter((user) => user.username !== username));
      window.dispatchEvent(new CustomEvent("cinesorte:user-unblocked", { detail: { username } }));
      toast.success("Usuário desbloqueado", `@${username} foi removido da lista.`);
    } catch (error) {
      toast.error("Não foi possível desbloquear", error.message || "Tente novamente.");
    }
  };

  const executeBlockUser = async (user) => {
    const username = typeof user === "string" ? user : user?.username;
    if (!username) return;
    try {
      await blockUser(username);
      const blockedUser = {
        username,
        name: typeof user === "object" ? user?.name : undefined,
        photoURL: typeof user === "object" ? user?.photoURL : undefined,
      };
      window.dispatchEvent(new CustomEvent("cinesorte:user-blocked", { detail: blockedUser }));
      setBlockedUsers((prev) => [blockedUser, ...prev.filter((item) => item.username !== username)]);
      setChatNotice(`Você bloqueou @${username}. O histórico continua visível, mas novas mensagens foram bloqueadas.`);
      toast.success("Usuário bloqueado", `@${username} foi bloqueado.`);
    } catch (error) {
      toast.error("Não foi possível bloquear", error.message || "Tente novamente.");
    }
  };

  const handleBlockUser = (user) => {
    const username = typeof user === "string" ? user : user?.username;
    if (!username) return;
    setConfirmAction({
      type: "block-user",
      title: "Bloquear usuário",
      message: `Bloquear @${username}? Vocês deixarão de se seguir e mensagens privadas serão impedidas.`,
      confirmLabel: "Bloquear",
      danger: true,
      user,
    });
  };

  const confirmPendingAction = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;

    if (action.type === "delete-conversation") {
      await executeDeleteConversation();
      return;
    }

    if (action.type === "delete-group") {
      await executeDeleteGroup();
      return;
    }

    if (action.type === "block-user") {
      await executeBlockUser(action.user);
    }
  };

  useEffect(() => {
    const handleBlocked = (event) => {
      const detail = event.detail || {};
      const username = detail.username;
      if (!username) return;

      setBlockedUsers((prev) => {
        const user = {
          username,
          name: detail.name,
          photoURL: detail.photoURL,
        };
        return [user, ...prev.filter((item) => item.username !== username)];
      });
      setChatNotice(`Você bloqueou @${username}. O histórico continua visível, mas novas mensagens foram bloqueadas.`);
    };

    const handleUnblocked = (event) => {
      const username = event.detail?.username;
      if (!username) return;
      setBlockedUsers((prev) => prev.filter((user) => user.username !== username));
      setChatNotice(`Você desbloqueou @${username}.`);
    };

    window.addEventListener("cinesorte:user-blocked", handleBlocked);
    window.addEventListener("cinesorte:user-unblocked", handleUnblocked);
    return () => {
      window.removeEventListener("cinesorte:user-blocked", handleBlocked);
      window.removeEventListener("cinesorte:user-unblocked", handleUnblocked);
    };
  }, [allThreads]);

  useEffect(() => {
    if (!authenticated) return undefined;

    const source = new EventSource(streamUrl("/stream"), { withCredentials: true });
    source.addEventListener("conversations", (event) => {
      try {
        const payload = JSON.parse(event.data);
        setUnreadTotal(Number(payload.unreadCount) || 0);
      } catch {
        // Ignore malformed stream packets.
      }
      loadConversations({ silent: true });
      window.dispatchEvent(new CustomEvent("cinesorte:notifications-refresh"));
    });
    return () => source.close();
  }, [authenticated, loadConversations]);

  useEffect(() => {
    if (!authenticated || !activeThreadId || !isOpen) return undefined;

    const source = new EventSource(streamUrl(`/conversations/${activeThreadId}/stream`), { withCredentials: true });
    source.addEventListener("messages", () => {
      loadMessages(activeThreadId, { silent: true });
      loadConversations({ silent: true });
    });
    return () => source.close();
  }, [activeThreadId, authenticated, isOpen, loadConversations, loadMessages]);

  useEffect(() => {
    const openMessages = (event) => {
      setIsOpen(true);
      if (event.detail?.conversationId) {
        selectThread(event.detail.conversationId);
      }
    };

    window.addEventListener("cinesorte:open-messages", openMessages);
    return () => window.removeEventListener("cinesorte:open-messages", openMessages);
  }, [selectThread]);

  if (!authenticated) return null;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[100050] flex h-14 min-w-[210px] items-center justify-between gap-4 rounded-2xl border border-white/[0.09] bg-[#0d0d11]/95 px-4 text-left text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-8"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-200">
            <MessageCircle size={18} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-zinc-100">Mensagens</span>
            <span className="block text-[10px] text-zinc-600">Privadas, grupos e cards</span>
          </span>
        </span>
        {unreadTotal > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-violet-500 px-2 text-xs font-bold text-white">{unreadTotal}</span>}
      </button>
    );
  }

  return (
    <div
      className={`fixed z-[100050] flex gap-3 ${
        activeThread
          ? "inset-x-2 bottom-2 top-14 flex-col md:inset-x-auto md:bottom-6 md:right-8 md:top-auto md:flex-row-reverse md:items-end"
          : "inset-x-3 bottom-3 flex-col-reverse md:inset-x-auto md:bottom-6 md:right-8 md:flex-row-reverse md:items-end"
      }`}
    >
      <section className={`${activeThread ? "hidden md:flex" : "flex"} max-h-[82vh] w-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0d0d11] shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:flex md:h-[620px] md:w-[380px]`}>
        <header className="border-b border-white/[0.06] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">Central social</p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-100">Mensagens</h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setComposerMode((value) => (value === "group" ? null : "group"))}
                className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                title="Criar grupo"
              >
                <MessageSquarePlus size={17} />
              </button>
              <button
                type="button"
                onClick={() => setComposerMode((value) => (value === "direct" ? null : "direct"))}
                className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                title="Buscar usuário"
              >
                <UserPlus size={16} />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-white/[0.06] hover:text-white">
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-2.5">
            <Search size={16} className="text-zinc-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar pessoas ou grupos"
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-300 outline-none placeholder:text-zinc-700"
            />
            {loadingConversations && <Loader2 size={14} className="animate-spin text-zinc-500" />}
          </div>

          <div className="relative mt-3" data-message-filter>
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-left transition-colors hover:bg-white/[0.035]"
              aria-expanded={filtersOpen}
            >
              <span>
                <span className="block text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">Filtro</span>
                <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-zinc-100">{activeFilter.label}</span>
              </span>
              <ChevronDown
                size={14}
                className={`shrink-0 text-zinc-500 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            {filtersOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111115] p-1 shadow-[0_14px_38px_rgba(0,0,0,0.38)]">
                {MESSAGE_FILTERS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setFilter(tab.id);
                      setFiltersOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-[0.06em] transition-colors ${
                      filter === tab.id
                        ? "bg-white text-zinc-950"
                        : "text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-100"
                    }`}
                  >
                    {tab.label}
                    {filter === tab.id && <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {composerMode && (
          <ConversationComposer
            mode={composerMode}
            onClose={() => setComposerMode(null)}
            onCreated={handleCreatedConversation}
          />
        )}

        {chatNotice && (
          <div className="mx-3 mt-3 flex items-start gap-2 rounded-2xl border border-violet-400/15 bg-violet-500/10 px-3 py-2.5 text-xs leading-5 text-violet-100">
            <span className="min-w-0 flex-1">{chatNotice}</span>
            <button
              type="button"
              onClick={() => setChatNotice("")}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-violet-200/70 hover:bg-white/10 hover:text-white"
              aria-label="Fechar aviso"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="content-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
          {filter === "blocked" ? (
            loadingBlocked ? (
              <div className="grid h-full place-items-center"><Loader2 size={20} className="animate-spin text-zinc-600" /></div>
            ) : blockedUsers.length > 0 ? blockedUsers.map((blockedUser) => (
              <div key={blockedUser.username} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-900 text-sm font-bold text-zinc-500">
                  {blockedUser.photoURL ? <img src={blockedUser.photoURL} alt="" className="h-full w-full object-cover" /> : blockedUser.name?.[0] || "U"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-200">{blockedUser.name || blockedUser.username}</span>
                  <span className="block truncate text-xs text-zinc-600">@{blockedUser.username}</span>
                </span>
                <button type="button" onClick={() => handleUnblockUser(blockedUser.username)} className="rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-[9px] font-bold uppercase text-emerald-200 hover:bg-emerald-500/20">
                  Desbloquear
                </button>
              </div>
            )) : (
              <div className="grid h-full place-items-center text-center text-zinc-600"><div><Ban size={24} className="mx-auto" /><p className="mt-3 text-sm">Nenhum usuário bloqueado</p></div></div>
            )
          ) : (
            <MessageThreadList threads={filteredThreads} activeThreadId={activeThreadId} onSelect={selectThread} />
          )}
        </div>
      </section>

      {activeThread && (
        <div className="hidden md:block">
          <MessageChatWindow
            thread={activeThread}
            messages={activeMessages}
            loading={loadingMessages}
            sending={sending}
            onClose={() => setActiveThreadId(null)}
            onSend={handleSend}
            onDeleteConversation={handleDeleteConversation}
            onDeleteGroup={handleDeleteGroup}
            onBlockUser={handleBlockUser}
            blocked={activeThreadBlocked}
          />
        </div>
      )}

      {activeThread && (
        <div className="min-h-0 flex-1 md:hidden">
          <MessageChatWindow
            thread={activeThread}
            messages={activeMessages}
            loading={loadingMessages}
            sending={sending}
            onClose={() => setActiveThreadId(null)}
            onSend={handleSend}
            onDeleteConversation={handleDeleteConversation}
            onDeleteGroup={handleDeleteGroup}
            onBlockUser={handleBlockUser}
            blocked={activeThreadBlocked}
          />
        </div>
      )}

      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title || "Confirmar ação"}
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-zinc-300">{confirmAction?.message}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmPendingAction}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                confirmAction?.danger
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : "bg-white text-zinc-950 hover:bg-violet-100"
              }`}
            >
              {confirmAction?.confirmLabel || "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
