import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TermsModal from '../ui/TermsModal';
import NotificationBell from '../ui/NotificationBell';
import SearchModal from '../ui/SearchModal';
import { Home, Globe, Dices, List, User, Settings, LogOut, Film, Menu, X, Search, ChevronLeft } from 'lucide-react';

export default function AppLayout() {
  const { logout, user, showTermsModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, onClick, isMobileItem }) => {
    const active = to ? isActive(to) : false;
    const collapsed = isSidebarCollapsed && !isMobileItem;

    const content = (
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Icon size={20} className={`shrink-0 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
        {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
      </div>
    );

    const className = `flex items-center ${collapsed ? 'justify-center px-0' : 'justify-between px-4'} py-3 rounded-xl transition-all duration-200 group w-full ${
      active
        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
    }`;

    return onClick ? (
      <button onClick={onClick} title={collapsed ? label : ''} className={className}>{content}</button>
    ) : (
      <Link to={to} onClick={() => setIsMobileMenuOpen(false)} title={collapsed ? label : ''} className={className}>{content}</Link>
    );
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 text-white flex overflow-hidden">
      
      <aside className={`hidden md:flex flex-col border-r border-white/5 bg-zinc-950 h-full shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-6 flex items-center h-24 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {isSidebarCollapsed ? (
            <button onClick={() => setIsSidebarCollapsed(false)} className="hover:opacity-80 transition-opacity outline-none">
              <Film className="text-violet-500 w-8 h-8 shrink-0" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <Film className="text-violet-500 w-8 h-8 shrink-0" />
                <span className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
                  Cine<span className="text-violet-500">Sorte</span>
                </span>
              </div>
              <button onClick={() => setIsSidebarCollapsed(true)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors shrink-0 outline-none">
                <ChevronLeft size={20} />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto scrollbar-hide overflow-x-hidden">
          <NavItem to="/app" icon={Home} label="Início" />
          <NavItem to="/app/feed" icon={Globe} label="Feed Social" />
          <NavItem icon={Search} label="Buscar" onClick={() => setIsSearchOpen(true)} />
          <NavItem to="/app/roulette" icon={Dices} label="Roleta" />
          <NavItem to="/app/lists" icon={List} label="Minhas Listas" />
          <NavItem to="/app/profile" icon={User} label="Perfil" />
          <NavItem to="/app/settings" icon={Settings} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center gap-3 bg-zinc-900/50 ${isSidebarCollapsed ? 'p-0 bg-transparent justify-center' : 'p-2'} rounded-xl mb-3 min-w-0 transition-all`}>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{user?.name?.[0]}</span>}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">@{user?.username}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} title={isSidebarCollapsed ? "Sair" : ""} className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'gap-2 w-full px-4'} py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors overflow-hidden`}>
            <LogOut size={16} className="shrink-0" />
            {!isSidebarCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
        <span className="font-black text-xl flex items-center gap-1">
          <Film className="w-5 h-5 text-violet-500" /> CS
        </span>
        <div className="flex items-center gap-2">
          <NotificationBell isMobile={true} />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400"><Menu /></button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-zinc-950 p-6 flex flex-col md:hidden">
          <div className="flex justify-end mb-8">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400"><X size={32} /></button>
          </div>
          <nav className="space-y-2 flex-1">
            <NavItem to="/app" icon={Home} label="Início" isMobileItem={true} />
            <NavItem to="/app/feed" icon={Globe} label="Feed Social" isMobileItem={true} />
            <NavItem icon={Search} label="Buscar" onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }} isMobileItem={true} />
            <NavItem to="/app/roulette" icon={Dices} label="Roleta" isMobileItem={true} />
            <NavItem to="/app/lists" icon={List} label="Minhas Listas" isMobileItem={true} />
            <NavItem to="/app/profile" icon={User} label="Perfil" isMobileItem={true} />
            <NavItem to="/app/settings" icon={Settings} label="Configurações" isMobileItem={true} />
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/5">
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut size={20} /> Sair da conta
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 h-full relative overflow-y-auto overflow-x-hidden bg-zinc-950">
        <div className="hidden md:flex absolute top-5 right-8 z-40">
           <NotificationBell isMobile={true} />
        </div>

        <div className="w-full h-full pt-16 md:pt-0">
          <Outlet />
        </div>
      </main>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {showTermsModal && <TermsModal />}
    </div>
  );
}