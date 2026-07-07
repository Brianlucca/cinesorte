import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Loader2,
  MessageCircle,
  MessageSquarePlus,
  Search,
  UserPlus,
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
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConversationComposer from "./ConversationComposer";
import MessageChatWindow from "./MessageChatWindow";
import MessageThreadList from "./MessageThreadList";
import { buildConversationView, cleanMessageMedia } from "./messageUtils";

const FALLBACK_REFRESH_MS = 120000;

function streamUrl(path) {
  const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
  return `${base}/messages${path}`;
}

export default function MessagesDock() {
  const { authenticated } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
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
      if (!silent) toast.error("Mensagens indisponiveis", error.message || "Nao foi possivel carregar as conversas.");
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
      if (!silent) toast.error("Conversa indisponivel", error.message || "Nao foi possivel carregar as mensagens.");
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
        toast.error("Nao foi possivel restaurar", error.message || "Tente novamente em instantes.");
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
      await loadConversations({ silent: true });
      window.dispatchEvent(new CustomEvent("cinesorte:notifications-refresh"));
    } catch (error) {
      toast.error("Mensagem nao enviada", error.message || "Tente novamente em instantes.");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeThreadId) return;
    const isGroup = activeThread?.type === "group";
    const confirmation = isGroup
      ? "Ocultar este grupo da sua lista? O grupo continua existindo para os participantes."
      : "Apagar esta conversa da sua lista?";
    if (!window.confirm(confirmation)) return;

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
      toast.error(isGroup ? "Nao foi possivel ocultar" : "Nao foi possivel apagar", error.message || "Tente novamente em instantes.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeThreadId) return;
    if (!window.confirm("Excluir este grupo para todos os participantes?")) return;

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
      toast.error("Nao foi possivel excluir", error.message || "Apenas o criador pode excluir o grupo.");
    }
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
                title="Buscar usuario"
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

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { id: "all", label: "Tudo" },
              { id: "direct", label: "Privado" },
              { id: "group", label: "Grupos" },
              { id: "hidden", label: "Ocultos" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  filter === tab.id
                    ? "border-white bg-white text-zinc-950"
                    : "border-white/[0.07] bg-white/[0.025] text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {composerMode && (
          <ConversationComposer
            mode={composerMode}
            onClose={() => setComposerMode(null)}
            onCreated={handleCreatedConversation}
          />
        )}

        <div className="content-scrollbar flex-1 space-y-2 overflow-y-auto p-3">
          <MessageThreadList
            threads={filteredThreads}
            activeThreadId={activeThreadId}
            onSelect={selectThread}
          />
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
          />
        </div>
      )}
    </div>
  );
}
