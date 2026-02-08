import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, UserPlus, TrendingUp, Layers, Info, CheckCheck } from "lucide-react";
import { getNotifications, markNotificationRead } from "../../services/api";

export default function NotificationBell({ isMobile }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
    } catch (e) {
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const badgeCount = useMemo(() => {
    const now = new Date();
    return notifications.filter(n => {
      if (n.read) return false;
      
      const date = n.createdAt?._seconds 
        ? new Date(n.createdAt._seconds * 1000) 
        : new Date(n.createdAt);
      
      const diffHours = (now - date) / (1000 * 60 * 60);
      return diffHours < 1; 
    }).length;
  }, [notifications]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
        try {
            await markNotificationRead(notif.id);
            setNotifications((prev) => 
                prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
            );
        } catch (e) {}
    }

    setIsOpen(false);

    if (notif.type === 'follow') {
        const targetUser = notif.senderUsername || notif.senderName;
        if (targetUser) {
            navigate(`/app/profile/${targetUser}`);
        }
    } else if (notif.type === 'new_content' && notif.mediaId && notif.mediaType) {
        let cleanId = notif.mediaId.replace(/^(movie-|tv-)/, '');
        navigate(`/app/${notif.mediaType}/${cleanId}`);
    } else if (notif.type === 'level_up') {
        navigate('/app/profile');
    } else if (notif.type === 'list_share') {
        navigate('/app/feed'); 
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
        await Promise.all(unread.map(n => markNotificationRead(n.id)));
    } catch (e) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case "follow": return <UserPlus size={16} className="text-blue-500" />;
      case "new_content": return <Heart size={16} className="text-red-500" />;
      case "level_up": return <TrendingUp size={16} className="text-yellow-500" />;
      case "list_share": return <Layers size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-zinc-400" />;
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    
    const date = dateInput._seconds 
      ? new Date(dateInput._seconds * 1000) 
      : new Date(dateInput);
      
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); 

    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} d`;
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div className="relative md:fixed md:top-6 md:right-8 md:z-50" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 md:bg-zinc-900/80 rounded-full md:backdrop-blur-md md:border md:border-white/10 md:shadow-lg"
      >
        <Bell size={24} />
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-zinc-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden right-0 top-full mt-4">
          <div className="p-3 border-b border-white/5 flex justify-between items-center bg-zinc-900/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Notificações</h3>
                {badgeCount > 0 && <span className="text-xs text-zinc-500 font-medium">({badgeCount})</span>}
            </div>
            
            {hasUnread && (
                <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors bg-violet-500/10 px-2 py-1 rounded hover:bg-violet-500/20"
                    title="Marcar todas como lidas"
                >
                    <CheckCheck size={12} />
                    Ler todas
                </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200 leading-snug">{notif.message}</p>
                    <span className="text-[10px] text-zinc-500 mt-1 block">{formatDate(notif.createdAt)}</span>
                  </div>
                  {!notif.read && <div className="w-1.5 h-1.5 bg-violet-500 rounded-full shrink-0 mt-2" />}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-sm">
                Nenhuma notificação.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}