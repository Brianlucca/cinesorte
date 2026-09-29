import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Clapperboard,
  ChevronDown,
  Dices,
  Download,
  Globe,
  Home,
  List,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  UsersRound,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@shared/context/useAuth";
import { getMessageUnreadCount } from "@shared/api/api";
import NotificationBell from "@shared/components/ui/NotificationBell";

const SearchModal = lazy(() => import("@shared/components/ui/SearchModal"));
const TermsModal = lazy(() => import("@shared/components/ui/TermsModal"));
const MessagesDock = lazy(() => import("@features/messages/components/MessagesDock"));
const MESSAGES_UNREAD_REFRESH_MS = 120000;
const EDGE_EXTENSION_URL = import.meta.env.VITE_EXTENSION_STORE_URL || "";

const privateNavigation = [
  { to: "/app", label: "Início", icon: Home },
  { to: "/app/feed", label: "Feed", icon: Globe },
  { to: "/app/roulette", label: "Roleta", icon: Dices },
  { to: "/app/watch-party", label: "CineParty", icon: UsersRound },
  { to: "/app/lists", label: "Minha lista", icon: List },
];

function Brand() {
  return (
    <Link to="/app" className="flex shrink-0 items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-black/25 text-violet-300 backdrop-blur-md">
        <Clapperboard size={21} />
      </span>
      <span className="text-lg font-semibold tracking-[-0.035em] sm:text-xl">
        Cine<span className="text-violet-400">Sorte</span>
      </span>
    </Link>
  );
}

export default function AppLayout() {
  const { logout, user, loading: authLoading, showTermsModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mainScrollRef = useRef(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMessagesLoaded, setIsMessagesLoaded] = useState(false);
  const [messageUnreadTotal, setMessageUnreadTotal] = useState(0);
  const [pendingMessageConversationId, setPendingMessageConversationId] = useState(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsHeaderScrolled((mainScrollRef.current?.scrollTop || 0) > 12);
    });
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  useEffect(() => {
    if (!user || isMessagesLoaded) return undefined;

    let active = true;
    const refreshUnread = async () => {
      try {
        const response = await getMessageUnreadCount();
        if (active) setMessageUnreadTotal(Number(response?.count) || 0);
      } catch {
        if (active) setMessageUnreadTotal(0);
      }
    };

    refreshUnread();
    const interval = window.setInterval(() => {
      if (!document.hidden) refreshUnread();
    }, MESSAGES_UNREAD_REFRESH_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isMessagesLoaded, user]);

  useEffect(() => {
    const handleOpenMessages = (event) => {
      setPendingMessageConversationId(event.detail?.conversationId || null);
      setIsMessagesLoaded(true);
    };

    window.addEventListener("cinesorte:open-messages", handleOpenMessages);
    return () => window.removeEventListener("cinesorte:open-messages", handleOpenMessages);
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!event.target.closest("[data-desktop-menu]")) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const isActive = (path) =>
    path === "/app"
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const openMessages = () => {
    setPendingMessageConversationId(null);
    if (isMessagesLoaded) {
      window.dispatchEvent(new CustomEvent("cinesorte:open-messages"));
    } else {
      setIsMessagesLoaded(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const immersiveRoute =
    location.pathname === "/app" ||
    /^\/app\/(movie|tv|person)\//.test(location.pathname);

  const headerClassName = `fixed inset-x-0 top-0 z-[70] transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
    isHeaderScrolled
      ? "bg-[#111216]/92 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl"
      : "bg-gradient-to-b from-black/72 via-black/32 to-transparent"
  }`;

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#111216] text-violet-400">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500/25 border-t-violet-400" />
      </div>
    );
  }

  if (!user) {
    const currentPath = `${location.pathname}${location.search}`;
    const loginPath = `/login?redirect=${encodeURIComponent(currentPath)}`;
    const registerPath = `/register?redirect=${encodeURIComponent(currentPath)}`;

    return (
      <div className="fixed inset-0 overflow-hidden bg-[#111216] text-white">
        <header className={headerClassName}>
          <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 md:h-[72px] md:px-10 xl:px-14">
            <Brand />

            <nav className="ml-2 hidden items-center gap-1 sm:flex md:ml-6">
              <Link to="/app" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06] md:inline-flex">
                Início
              </Link>
              <button
                type="button"
                onClick={openSearch}
                className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Search size={16} /> Explorar
              </button>
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={openSearch}
                className="grid h-9 w-9 place-items-center rounded-xl bg-black/25 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/[0.08] hover:text-white sm:hidden"
                aria-label="Buscar filmes e séries"
              >
                <Search size={18} />
              </button>
              <Link to={loginPath} className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white">
                Entrar
              </Link>
              <Link to={registerPath} className="hidden rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-violet-100 sm:inline-flex">
                Criar conta
              </Link>
            </div>
          </div>
        </header>

        <main
          ref={mainScrollRef}
          onScroll={(event) => setIsHeaderScrolled(event.currentTarget.scrollTop > 12)}
          className="relative h-full min-w-0 overflow-x-hidden overflow-y-auto bg-[#111216]"
        >
          <div className="h-full w-full pt-16 md:pt-0"><Outlet /></div>
        </main>

        {isSearchOpen && (
          <Suspense fallback={null}>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#111216] text-white">
      <header className={headerClassName}>
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 md:h-[72px] md:px-8 xl:px-12">
          <Brand />
          <nav className="ml-2 hidden items-center gap-1 sm:flex md:ml-6" aria-label="Navegação inicial">
            <Link to="/app" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06] md:inline-flex">
              Início
            </Link>
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Explorar catálogo"
              title="Explorar"
            >
              <Search size={16} /> Explorar
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="grid h-9 w-9 place-items-center rounded-xl bg-black/25 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/[0.08] hover:text-white sm:hidden"
              aria-label="Buscar filmes e séries"
            >
              <Search size={18} />
            </button>
            {EDGE_EXTENSION_URL && (
              <a
                href={EDGE_EXTENSION_URL}
                target="_blank"
                rel="noreferrer"
                className="hidden h-10 items-center gap-2 rounded-xl bg-black/25 px-3 text-sm font-semibold text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/[0.08] hover:text-white lg:inline-flex"
                title="Baixar extensão CineSorte Sync"
              >
                <Download size={17} />
                <span className="hidden 2xl:inline">Extensão</span>
              </a>
            )}
            <button
              type="button"
              onClick={openMessages}
              className="relative hidden h-10 w-10 place-items-center rounded-full bg-black/25 text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/[0.08] hover:text-white sm:grid"
              aria-label="Abrir mensagens"
            >
              <MessageCircle size={18} />
              {messageUnreadTotal > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-violet-500 px-1 text-[9px] font-semibold text-white">
                  {messageUnreadTotal > 9 ? "9+" : messageUnreadTotal}
                </span>
              )}
            </button>
            <NotificationBell mobileHeaderScrolled={isHeaderScrolled} inline />

            <div className="relative hidden lg:block" data-desktop-menu>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
                className="flex h-10 items-center gap-2 rounded-full bg-black/25 py-1 pl-1 pr-2.5 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
                aria-label="Abrir menu da conta"
                aria-expanded={isProfileMenuOpen}
              >
                <span className="h-8 w-8 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full place-items-center text-xs font-semibold text-violet-300">{(user.name?.[0] || user.username?.[0] || "U").toUpperCase()}</span>
                  )}
                </span>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] max-h-[calc(100dvh-5rem)] w-64 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#181a20] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
                  <div className="px-3 pb-3 pt-2">
                    <p className="truncate text-sm font-semibold text-white">{user.name || user.username}</p>
                    <p className="mt-0.5 truncate text-[11px] text-zinc-500">@{user.username?.toLowerCase()}</p>
                  </div>
                  <div className="h-px bg-white/[0.06]" />
                  <span className="mb-1 mt-2 block px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Navegação</span>
                  {privateNavigation.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsProfileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive(item.to) ? "bg-white/[0.07] text-white" : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"}`}
                    >
                      <item.icon size={17} className={isActive(item.to) ? "text-violet-300" : "text-zinc-500"} /> {item.label}
                    </Link>
                  ))}
                  <button type="button" onClick={() => { openMessages(); setIsProfileMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"><MessageCircle size={17} className="text-zinc-500" /> Mensagens {messageUnreadTotal > 0 && <span className="ml-auto rounded-full bg-violet-500 px-2 py-0.5 text-[10px] text-white">{messageUnreadTotal > 99 ? "99+" : messageUnreadTotal}</span>}</button>
                  <div className="my-2 h-px bg-white/[0.06]" />
                  <Link to="/app/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"><User size={17} /> Perfil</Link>
                  <Link to="/app/settings" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"><Settings size={17} /> Configurações</Link>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"><LogOut size={17} /> Sair da conta</button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="grid h-9 w-9 place-items-center rounded-xl bg-black/25 text-zinc-200 backdrop-blur-md transition-colors hover:bg-white/[0.08] lg:hidden"
              aria-label="Abrir menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[2147483000] flex flex-col overflow-hidden bg-[#111216] text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Menu principal">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative flex h-16 shrink-0 items-center justify-between px-5 sm:px-6">
            <Brand />
            <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-zinc-300 transition-colors hover:bg-white/[0.09] hover:text-white" aria-label="Fechar menu"><X size={20} /></button>
          </div>

          <div className="relative flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-6">
            <span className="mb-3 block px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Navegação</span>
            <nav className="space-y-1.5" aria-label="Navegação mobile">
              {privateNavigation.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive(item.to) ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`}>
                  <item.icon size={19} className={isActive(item.to) ? "text-violet-300" : "text-zinc-500"} /> {item.label}
                </Link>
              ))}
              <button type="button" onClick={() => { openMessages(); setIsMobileMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"><MessageCircle size={19} className="text-zinc-500" /> Mensagens {messageUnreadTotal > 0 && <span className="ml-auto rounded-full bg-violet-500 px-2 py-0.5 text-[10px] text-white">{messageUnreadTotal > 99 ? "99+" : messageUnreadTotal}</span>}</button>
              {EDGE_EXTENSION_URL && <a href={EDGE_EXTENSION_URL} target="_blank" rel="noreferrer" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"><Download size={19} className="text-zinc-500" /> Baixar extensão</a>}
            </nav>

            <div className="my-4 h-px bg-white/[0.06]" />
            <span className="mb-3 block px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Sua conta</span>
            <div className="space-y-1">
              <Link to="/app/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"><User size={19} className="text-zinc-500" /> Perfil</Link>
              <Link to="/app/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"><Settings size={19} className="text-zinc-500" /> Configurações</Link>
            </div>

            <div className="mb-3 mt-5 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
                {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-sm font-semibold text-violet-300">{(user.name?.[0] || "U").toUpperCase()}</span>}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user.name || user.username}</p>
                <p className="truncate text-[11px] text-zinc-500">@{user.username?.toLowerCase()}</p>
              </div>
              <button type="button" onClick={handleLogout} className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-xl text-red-300 transition-colors hover:bg-red-500/10" aria-label="Sair da conta"><LogOut size={18} /></button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <main
        ref={mainScrollRef}
        onScroll={(event) => setIsHeaderScrolled(event.currentTarget.scrollTop > 12)}
        className="relative h-full min-w-0 overflow-x-hidden overflow-y-auto bg-[#111216]"
      >
        <div className={`h-full w-full pt-16 ${immersiveRoute ? "md:pt-0" : "md:pt-[72px]"}`}><Outlet /></div>
      </main>

      {isMessagesLoaded && (
        <Suspense fallback={null}>
          <MessagesDock defaultOpen initialConversationId={pendingMessageConversationId} />
        </Suspense>
      )}
      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </Suspense>
      )}
      {showTermsModal && (
        <Suspense fallback={null}>
          <TermsModal />
        </Suspense>
      )}
    </div>
  );
}
