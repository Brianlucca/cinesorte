import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, UserPlus, TrendingUp, Layers, Info, CheckCheck, AtSign, MessageCircle, X } from "lucide-react";
import { getNotifications, getUnreadCount, markNotificationRead } from "@shared/api/api";

const NOTIFICATION_CACHE_TTL = 30000;
const notificationCache = {
  items: [],
  badgeCount: 0,
  fetchedAt: 0,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [popupNotif, setPopupNotif] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const popupRef = useRef(null);
  const isInitialLoad = useRef(true);
  const lastSeenId = useRef(null);
  const navigate = useNavigate();

  const applyNotifications = useCallback((list, { allowPopup = true } = {}) => {
    const unreadCount = list.filter((item) => !item.read).length;

    setNotifications(list);
    setNotificationsLoaded(true);
    setBadgeCount(unreadCount);
    notificationCache.items = list;
    notificationCache.badgeCount = unreadCount;
    notificationCache.fetchedAt = Date.now();

    if (list.length > 0) {
      const newest = list[0];
      if (allowPopup && !isInitialLoad.current && lastSeenId.current !== newest.id && !newest.read) {
        setPopupNotif(newest);
        setTimeout(() => setPopupNotif(null), 6000);
      }
      lastSeenId.current = newest.id;
    }
    isInitialLoad.current = false;
  }, []);

  const loadNotifications = useCallback(async ({ force = false, allowPopup = true } = {}) => {
    const hasFreshCache = Date.now() - notificationCache.fetchedAt < NOTIFICATION_CACHE_TTL;
    if (!force && hasFreshCache) {
      applyNotifications(notificationCache.items, { allowPopup: false });
      return;
    }

    setNotificationsLoading(true);
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : [];
      applyNotifications(list, { allowPopup });
    } catch {
      setNotifications([]);
      setNotificationsLoaded(true);
    } finally {
      setNotificationsLoading(false);
    }
  }, [applyNotifications]);

  const loadUnreadCount = useCallback(async ({ force = false } = {}) => {
    const hasFreshCache = Date.now() - notificationCache.fetchedAt < NOTIFICATION_CACHE_TTL;
    if (!force && hasFreshCache) {
      setBadgeCount(notificationCache.badgeCount);
      return;
    }

    try {
      const response = await getUnreadCount();
      const count = Number(response?.count) || 0;
      setBadgeCount(count);
      notificationCache.badgeCount = count;
    } catch {
      setBadgeCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(() => {
      if (!document.hidden && !isOpen) {
        loadUnreadCount();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [isOpen, loadUnreadCount]);

  useEffect(() => {
    const refreshNotifications = () => {
      if (isOpen) {
        loadNotifications({ force: true, allowPopup: false });
      } else {
        loadUnreadCount({ force: true });
      }
    };

    window.addEventListener("cinesorte:notifications-refresh", refreshNotifications);
    return () => window.removeEventListener("cinesorte:notifications-refresh", refreshNotifications);
  }, [isOpen, loadNotifications, loadUnreadCount]);

  useEffect(() => {
    if ((!isOpen && !popupNotif) || !buttonRef.current) return undefined;

    const updateAnchor = () => {
      if (!buttonRef.current) return;
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    };

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);

    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [isOpen, popupNotif]);

  const handleOpen = () => {
    const nextOpen = !isOpen;
    if (buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }

    setIsOpen(nextOpen);

    if (nextOpen) {
      setPopupNotif(null);
      loadNotifications({ force: true, allowPopup: false });
    } else {
      loadUnreadCount({ force: true });
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (buttonRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
        setBadgeCount((prev) => Math.max(0, prev - 1));
      } catch {
        setBadgeCount((prev) => prev);
      }
    }

    setIsOpen(false);

    if (notif.type === "message") {
      window.dispatchEvent(
        new CustomEvent("cinesorte:open-messages", {
          detail: { conversationId: notif.conversationId },
        })
      );
      loadUnreadCount({ force: true });
      return;
    }

    if (notif.type === "follow") {
      const targetUser = notif.senderUsername || notif.senderName;
      if (targetUser) {
        navigate(`/app/profile/${targetUser}`);
      }
    } else if ((notif.type === "new_content" || notif.type === "mention") && notif.mediaId && notif.mediaType) {
      const cleanId = String(notif.mediaId).replace(/^(movie-|tv-)/, "");

      if (notif.mediaType === "episode" || (cleanId.includes("-s") && cleanId.includes("-e"))) {
        const match = cleanId.match(/^(\d+)-s(\d+)-e(\d+)$/);
        if (match) {
          const [, tvId, season, episode] = match;
          navigate(`/app/tv/${tvId}/season/${season}/episode/${episode}`);
        } else {
          navigate(`/app/tv/${cleanId}`);
        }
      } else {
        navigate(`/app/${notif.mediaType}/${cleanId}`);
      }
    } else if (notif.type === "level_up") {
      navigate("/app/profile");
    } else if (notif.type === "list_share") {
      navigate("/app/feed");
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setBadgeCount(0);

    try {
      await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    } catch {
      setBadgeCount((prev) => prev);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus size={16} className="text-blue-500" />;
      case "new_content":
        return <Heart size={16} className="text-red-500" />;
      case "level_up":
        return <TrendingUp size={16} className="text-yellow-500" />;
      case "list_share":
        return <Layers size={16} className="text-purple-500" />;
      case "mention":
        return <AtSign size={16} className="text-violet-500" />;
      case "message":
        return <MessageCircle size={16} className="text-cyan-400" />;
      default:
        return <Info size={16} className="text-zinc-400" />;
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "";

    const date = dateInput._seconds ? new Date(dateInput._seconds * 1000) : new Date(dateInput);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} d`;
  };

  const getFloatingStyle = (width, mode = "dropdown") => {
    if (!anchorRect) return {};

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const top =
      mode === "popup" && viewportWidth >= 768
        ? Math.max(16, Math.min(anchorRect.top, viewportHeight - 120))
        : Math.min(anchorRect.bottom + 12, viewportHeight - 120);
    const left =
      mode === "popup" && viewportWidth >= 768
        ? Math.max(16, Math.min(anchorRect.left - width - 16, viewportWidth - width - 16))
        : Math.max(16, Math.min(anchorRect.right - width, viewportWidth - width - 16));

    return { top, left, width };
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <div className="fixed right-16 top-3 z-[100060] md:right-8 md:top-6">
        <button
          ref={buttonRef}
          onClick={handleOpen}
          className="relative rounded-full bg-zinc-900/50 p-2 text-zinc-400 transition-colors hover:text-white md:border md:border-white/10 md:bg-zinc-900/80 md:shadow-lg md:backdrop-blur-md"
        >
          <Bell size={24} />
          {badgeCount > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-zinc-950" />}
        </button>
      </div>

      {popupNotif && !isOpen && anchorRect &&
        createPortal(
          <div
            ref={popupRef}
            style={getFloatingStyle(256, "popup")}
            onClick={() => {
              setPopupNotif(null);
              handleNotificationClick(popupNotif);
            }}
            className="fixed z-[100061] flex cursor-pointer items-start gap-3 rounded-xl border border-violet-500/50 bg-zinc-900 p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 md:slide-in-from-right-2"
          >
            <div className="mt-0.5 shrink-0">{getIcon(popupNotif.type)}</div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-xs font-bold text-violet-400">Nova Notificação</p>
              <p className="line-clamp-2 text-xs leading-snug text-zinc-300">{popupNotif.message}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPopupNotif(null);
              }}
              className="-mr-1 -mt-1 shrink-0 p-1 text-zinc-500 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>,
          document.body
        )}

      {isOpen && anchorRect &&
        createPortal(
          <div
            ref={dropdownRef}
            style={getFloatingStyle(320, "dropdown")}
            className="fixed z-[100061] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-zinc-900/95 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Notificações</h3>
                {badgeCount > 0 && <span className="text-xs font-medium text-zinc-500">({badgeCount})</span>}
              </div>

              {hasUnread && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 rounded bg-violet-500/10 px-2 py-1 text-[10px] font-bold text-violet-400 transition-colors hover:bg-violet-500/20 hover:text-violet-300"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={12} />
                  Ler todas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
              {notificationsLoading && (
                <div className="flex items-center gap-3 border-b border-white/5 p-4 text-sm text-zinc-400">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
                  Carregando notificações
                </div>
              )}

              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex cursor-pointer gap-3 border-b border-white/5 p-4 transition-colors last:border-0 hover:bg-white/5 ${!notif.read ? "bg-white/[0.02]" : ""}`}
                  >
                    <div className="mt-1 shrink-0">{getIcon(notif.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm leading-snug text-zinc-200">{notif.message}</p>
                      <span className="mt-1 block text-[10px] text-zinc-500">{formatDate(notif.createdAt)}</span>
                    </div>
                    {!notif.read && <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />}
                  </div>
                ))
              ) : !notificationsLoading && notificationsLoaded ? (
                <div className="p-8 text-center text-sm text-zinc-500">Nenhuma notificação.</div>
              ) : null}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
