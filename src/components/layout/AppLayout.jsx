import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Dices,
  Film,
  Globe,
  Home,
  List,
  LogOut,
  Menu,
  PanelLeftOpen,
  Search,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import NotificationBell from "../ui/NotificationBell";
import SearchModal from "../ui/SearchModal";
import TermsModal from "../ui/TermsModal";

function FeedPreview({ user }) {
  return (
    <div className="mx-2 mt-1 grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-2.5">
      <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center">
        <strong className="block text-sm font-black text-white">{user?.followingCount || 0}</strong>
        <span className="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-zinc-600">Seguindo</span>
      </div>
      <div className="rounded-xl bg-black/20 px-2 py-2.5 text-center">
        <strong className="block text-sm font-black text-white">{user?.followersCount || 0}</strong>
        <span className="mt-0.5 block text-[8px] font-black uppercase tracking-wider text-zinc-600">Seguidores</span>
      </div>
    </div>
  );
}

function SavedPreview({ items, totalItems, loading }) {
  return (
    <div className="mx-2 mt-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-zinc-600">Salvos recentemente</span>
        <span className="text-[9px] font-black text-violet-400">{totalItems}</span>
      </div>

      {loading ? (
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2, 3].map((item) => <span key={item} className="h-14 flex-1 animate-pulse rounded-lg bg-white/[0.05]" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-3 flex items-center">
          <div className="flex min-w-0 flex-1 -space-x-2">
            {items.slice(0, 5).map((item, index) => (
              <div key={`${item.id}-${index}`} className="h-[58px] w-10 shrink-0 overflow-hidden rounded-lg border-2 border-[#111115] bg-zinc-900 shadow-lg transition-transform hover:-translate-y-1 hover:z-10">
                {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w154${item.poster_path}`} className="h-full w-full object-cover" alt="" /> : <Film size={13} className="m-auto h-full text-zinc-700" />}
              </div>
            ))}
          </div>
          <ChevronRight size={14} className="shrink-0 text-zinc-700" />
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-black/20 p-3">
          <Bookmark size={16} className="text-zinc-700" />
          <span className="text-[10px] leading-4 text-zinc-600">Suas capas salvas aparecerão aqui.</span>
        </div>
      )}
    </div>
  );
}

function RoulettePreview({ items, totalItems }) {
  const backdrop = items.find((item) => item.backdrop_path)?.backdrop_path;

  return (
    <div className="group/roulette relative mx-2 mt-1 overflow-hidden rounded-2xl border border-violet-400/10 bg-violet-500/[0.06] p-3">
      {backdrop && <img src={`https://image.tmdb.org/t/p/w500${backdrop}`} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10 transition-transform duration-700 group-hover/roulette:scale-110" alt="" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#14101d]/95 to-[#14101d]/70" />
      <div className="relative flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Dices size={17} /></span>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-zinc-300">Deixe o acaso escolher</p>
          <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">{totalItems > 0 ? `${totalItems} salvos disponíveis` : "Explore uma escolha surpresa"}</p>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { logout, user, showTermsModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [sidebarLists, setSidebarLists] = useState([]);
  const [sidebarListsLoading, setSidebarListsLoading] = useState(false);
  const [listsLoadedAt, setListsLoadedAt] = useState(0);

  useEffect(() => {
    if (isSidebarCollapsed || !user || Date.now() - listsLoadedAt < 60000) return undefined;

    const controller = new AbortController();
    setSidebarListsLoading(true);
    api.get("/users/lists/me", { signal: controller.signal })
      .then((data) => setSidebarLists(Array.isArray(data) ? data : []))
      .catch(() => setSidebarLists([]))
      .finally(() => {
        if (!controller.signal.aborted) {
          setSidebarListsLoading(false);
          setListsLoadedAt(Date.now());
        }
      });

    return () => controller.abort();
  }, [isSidebarCollapsed, listsLoadedAt, user]);

  const savedItems = useMemo(() => {
    const seen = new Set();
    return sidebarLists.flatMap((list) => list.items || []).filter((item) => {
      const key = `${item.media_type || item.mediaType || "media"}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
  }, [sidebarLists]);

  const totalSavedItems = useMemo(
    () => sidebarLists.reduce((total, list) => total + (list.items?.length || 0), 0),
    [sidebarLists],
  );
  const xpNeeded = 100 + ((user?.level || 1) - 1) * 75;
  const xpProgress = Math.min(100, Math.round(((user?.xp || 0) / xpNeeded) * 100));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/app" ? location.pathname === path : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const NavItem = ({ to, icon, label, onClick, isMobileItem, preview }) => {
    const Icon = icon;
    const active = to ? isActive(to) : false;
    const collapsed = isSidebarCollapsed && !isMobileItem;
    const content = (
      <div className={`relative z-10 flex min-w-0 items-center ${isMobileItem ? "gap-3" : collapsed ? "justify-center" : "gap-3"}`}>
        <Icon size={19} className={`shrink-0 transition-colors ${active ? "text-white" : "text-zinc-500 group-hover:text-violet-300"}`} />
        <span className={`${isMobileItem ? "" : collapsed ? "max-w-0 translate-x-2 opacity-0" : "max-w-[190px] translate-x-0 opacity-100"} overflow-hidden whitespace-nowrap text-[13px] font-bold tracking-wide transition-[max-width,opacity,transform] duration-500`}>{label}</span>
      </div>
    );
    const className = `group relative flex items-center overflow-hidden rounded-2xl transition-all duration-300 ${collapsed ? "mx-auto h-12 w-12 justify-center p-0" : "w-full justify-between px-4 py-3.5"} ${active ? "border border-violet-400/20 bg-[linear-gradient(110deg,rgba(124,58,237,0.95),rgba(139,92,246,0.78))] text-white shadow-[0_12px_30px_rgba(109,40,217,0.25)]" : "border border-transparent text-zinc-500 hover:border-white/[0.05] hover:bg-white/[0.035] hover:text-white"}`;

    const item = onClick ? (
      <button type="button" onClick={onClick} title={collapsed ? label : ""} className={className}>{content}</button>
    ) : (
      <Link to={to} onClick={() => setIsMobileMenuOpen(false)} title={collapsed ? label : ""} className={className}>
        {content}
        {!isMobileItem && <span className={`rounded-full bg-white shadow-[0_0_10px_white] transition-[width,height,opacity] duration-200 ${!collapsed && active ? "h-1.5 w-1.5 opacity-100" : "h-0 w-0 opacity-0"}`} />}
      </Link>
    );

    return (
      <div>
        {item}
        {preview && !isMobileItem && (
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
            <div className="min-h-0 overflow-hidden">{preview}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-zinc-950 text-white">
      <aside className={`relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#09090b] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex ${isSidebarCollapsed ? "w-[88px]" : "w-[300px]"}`}>
        <div className="pointer-events-none absolute left-0 top-0 h-72 w-full bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.12),transparent_62%)]" />

        <div className="relative h-24 shrink-0">
          <button type="button" onClick={() => setIsSidebarCollapsed(false)} className={`group absolute left-1/2 top-[26px] grid h-11 w-11 -translate-x-1/2 place-items-center text-violet-400 transition-[opacity,transform] duration-200 hover:text-violet-300 ${isSidebarCollapsed ? "scale-100 opacity-100 delay-300" : "pointer-events-none scale-90 opacity-0"}`} title="Expandir menu">
            <PanelLeftOpen size={25} className="transition-transform group-hover:scale-105" />
          </button>

          <div className={`absolute inset-0 flex w-[300px] items-center justify-between px-5 transition-[opacity,transform] ${isSidebarCollapsed ? "pointer-events-none -translate-x-3 opacity-0 delay-0 duration-500" : "translate-x-0 opacity-100 delay-100 duration-300"}`}>
            <Link to="/app" className="flex shrink-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center text-violet-400"><Clapperboard size={24} /></span>
              <span className="whitespace-nowrap text-xl font-black tracking-[-0.045em]">Cine<span className="text-violet-400">Sorte</span></span>
            </Link>
            <button type="button" onClick={() => setIsSidebarCollapsed(true)} className="grid h-9 w-9 place-items-center rounded-full text-zinc-600 transition-colors hover:bg-white/[0.05] hover:text-white" title="Recolher menu"><ChevronLeft size={18} /></button>
          </div>
        </div>

        <nav className={`relative flex-1 overflow-y-auto overflow-x-hidden pb-5 ${isSidebarCollapsed ? "scrollbar-hide space-y-2 px-0" : "content-scrollbar px-4"}`}>
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${isSidebarCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100 delay-100"}`}><div className="min-h-0 overflow-hidden"><span className="mb-2 block px-3 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-700">Descobrir</span></div></div>
          <div className="space-y-1.5">
            <NavItem to="/app" icon={Home} label="Início" />
            <NavItem to="/app/feed" icon={Globe} label="Feed Social" preview={<FeedPreview user={user} />} />
            <NavItem icon={Search} label="Buscar" onClick={() => setIsSearchOpen(true)} />
          </div>

          <div className={`my-4 h-px bg-white/[0.06] ${isSidebarCollapsed ? "mx-2" : "mx-3"}`} />
          <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${isSidebarCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100 delay-100"}`}><div className="min-h-0 overflow-hidden"><span className="mb-2 block px-3 text-[8px] font-black uppercase tracking-[0.22em] text-zinc-700">Sua experiência</span></div></div>
          <div className="space-y-1.5">
            <NavItem to="/app/roulette" icon={Dices} label="Roleta" preview={<RoulettePreview items={savedItems} totalItems={totalSavedItems} />} />
            <NavItem to="/app/lists" icon={List} label="Minhas Listas" preview={<SavedPreview items={savedItems} totalItems={totalSavedItems} loading={sidebarListsLoading} />} />
            <NavItem to="/app/profile" icon={User} label="Perfil" />
            <NavItem to="/app/settings" icon={Settings} label="Configurações" />
          </div>
        </nav>

        <div className="relative shrink-0 border-t border-white/[0.06] bg-[#09090b]/95 p-3.5">
          <Link to="/app/profile" className={`flex items-center overflow-hidden rounded-[1.25rem] transition-[background-color,padding,gap] duration-500 ${isSidebarCollapsed ? "justify-center gap-0 bg-transparent p-0" : "gap-3 bg-white/[0.035] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"}`}>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-800 shadow-lg">
              {user?.photoURL ? <img src={user.photoURL} className="h-full w-full object-cover" alt="" /> : <span className="grid h-full place-items-center text-sm font-black text-violet-400">{(user?.name?.[0] || "U").toUpperCase()}</span>}
            </div>
            <div className={`min-w-0 overflow-hidden transition-[max-width,opacity,transform] duration-500 ${isSidebarCollapsed ? "max-w-0 translate-x-3 opacity-0" : "max-w-[210px] translate-x-0 opacity-100 delay-100"}`}>
                <div className="min-w-0">
                  <p className="truncate text-xs font-black text-white">{user?.name}</p>
                  <p className="mt-0.5 truncate text-[9px] font-bold text-zinc-600">@{user?.username?.toLowerCase()}</p>
                </div>
                <div className="mt-2.5 flex min-w-0 items-center gap-2">
                  <span className="inline-flex min-w-0 items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-zinc-500">
                    <Shield size={10} className="shrink-0 text-violet-400" />
                    <span className="truncate">{user?.levelTitle || "Espectador"}</span>
                  </span>
                  <span className="ml-auto shrink-0 text-[8px] font-black text-zinc-700">NV. {user?.level || 1}</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-300" style={{ width: `${xpProgress}%` }} /></div>
            </div>
          </Link>
          <button type="button" onClick={handleLogout} title={isSidebarCollapsed ? "Sair" : ""} className={`mt-2 flex items-center rounded-2xl border border-transparent text-red-400 transition-all hover:border-red-400/10 hover:bg-red-500/[0.07] hover:text-red-300 ${isSidebarCollapsed ? "mx-auto h-11 w-11 justify-center" : "w-full gap-3 px-4 py-3"}`}>
            <LogOut size={17} className="shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] transition-[max-width,opacity,transform] duration-500 ${isSidebarCollapsed ? "max-w-0 translate-x-2 opacity-0" : "max-w-32 translate-x-0 opacity-100 delay-100"}`}>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/85 px-4 py-3 backdrop-blur-xl md:hidden">
        <span className="flex items-center gap-2 text-lg font-black tracking-tight"><Film className="h-5 w-5 text-violet-500" /> CineSorte</span>
        <button type="button" onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-zinc-400"><Menu /></button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-950 p-6 md:hidden">
          <div className="mb-8 flex items-center justify-between"><span className="text-xl font-black">Cine<span className="text-violet-400">Sorte</span></span><button type="button" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400"><X size={28} /></button></div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/app" icon={Home} label="Início" isMobileItem />
            <NavItem to="/app/feed" icon={Globe} label="Feed Social" isMobileItem />
            <NavItem icon={Search} label="Buscar" onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} isMobileItem />
            <div className="my-3 h-px bg-white/[0.06]" />
            <NavItem to="/app/roulette" icon={Dices} label="Roleta" isMobileItem />
            <NavItem to="/app/lists" icon={List} label="Minhas Listas" isMobileItem />
            <NavItem to="/app/profile" icon={User} label="Perfil" isMobileItem />
            <NavItem to="/app/settings" icon={Settings} label="Configurações" isMobileItem />
          </nav>
          <button type="button" onClick={handleLogout} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/15 bg-red-500/[0.07] py-4 text-xs font-black uppercase tracking-widest text-red-400"><LogOut size={17} /> Sair da conta</button>
        </div>
      )}

      <main className="relative h-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-zinc-950">
        <div className="h-full w-full pt-16 md:pt-0"><Outlet /></div>
      </main>

      <NotificationBell />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {showTermsModal && <TermsModal />}
    </div>
  );
}
