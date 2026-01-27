import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, UserPlus, TrendingUp, Layers } from "lucide-react";
import { getNotifications, getUnreadCount, markNotificationRead } from "../../services/api";

export default function NotificationBell({ isMobile }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch (e) {}
  };

  const handleOpen = async () => {
    if (!isOpen) {
      setIsOpen(true);
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (e) {}
    } else {
      setIsOpen(false);
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
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        } catch (e) {}
    }

    setIsOpen(false);

    if (notif.type === 'follow' && notif.senderUsername) {
        navigate(`/app/profile/${notif.senderUsername}`);
    } else if (notif.type === 'new_content' && notif.mediaId && notif.mediaType) {
        let cleanId = notif.mediaId.replace(/^(movie-|tv-)/, '');
        navigate(`/app/${notif.mediaType}/${cleanId}`);
    } else if (notif.type === 'level_up') {
        navigate('/app/profile');
    } else if (notif.type === 'list_share') {
        navigate('/app/feed'); 
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "follow": return <UserPlus size={16} className="text-blue-500" />;
      case "new_content": return <Heart size={16} className="text-red-500" />;
      case "level_up": return <TrendingUp size={16} className="text-yellow-500" />;
      case "list_share": return <Layers size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-zinc-400" />;
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); 

    if (diff < 60) return "Agora";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-zinc-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-80 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden ${isMobile ? 'right-0 top-full mt-2' : 'right-0 top-full mt-4'}`}>
          <div className="p-3 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-sm text-white">Notificações</h3>
            {unreadCount > 0 && <span className="text-xs text-violet-400 font-medium">{unreadCount} novas</span>}
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