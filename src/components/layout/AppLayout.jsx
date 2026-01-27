import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TermsModal from '../ui/TermsModal';
import NotificationBell from '../ui/NotificationBell';
import { Home, Globe, Dices, List, User, Settings, LogOut, Film, Menu, X, Search } from 'lucide-react';

export default function AppLayout() {
  const { logout, user, showTermsModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive(to)
          ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
      }`}
    >
      <Icon size={20} className={isActive(to) ? 'text-white' : 'text-zinc-500 group-hover:text-white'} />
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-zinc-950/95 backdrop-blur-xl h-screen fixed left-0 top-0 z-40">
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Film className="text-violet-500 w-8 h-8" />
              <span className="text-2xl font-black tracking-tighter">CINE<span className="text-violet-500">SORTE</span></span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <NavItem to="/app" icon={Home} label="Início" />
          <NavItem to="/app/feed" icon={Globe} label="Feed Social" />
          <NavItem to="/app/search" icon={Search} label="Buscar" />
          <NavItem to="/app/roulette" icon={Dices} label="Roleta" />
          <NavItem to="/app/lists" icon={List} label="Minhas Listas" />
          <NavItem to="/app/profile" icon={User} label="Perfil" />
          <NavItem to="/app/settings" icon={Settings} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-xl mb-3 overflow-hidden">
             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-sm font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
               )}
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold truncate">{user?.name || 'Usuário'}</p>
               <p className="text-[10px] text-zinc-500 truncate">@{user?.username}</p>
             </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full z-40 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center">
        <span className="font-black text-xl flex items-center gap-1">
            <Film className="w-5 h-5 text-violet-500" /> CS
        </span>
        
        <div className="flex items-center gap-4">
            <NotificationBell isMobile={true} />
            
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-zinc-950 pt-20 px-6 space-y-4 md:hidden overflow-y-auto animate-in slide-in-from-top-10">
          <NavItem to="/app" icon={Home} label="Início" />
          <NavItem to="/app/feed" icon={Globe} label="Feed Social" />
          <NavItem to="/app/search" icon={Search} label="Buscar" />
          <NavItem to="/app/roulette" icon={Dices} label="Roleta" />
          <NavItem to="/app/lists" icon={List} label="Minhas Listas" />
          <NavItem to="/app/profile" icon={User} label="Perfil" />
          <NavItem to="/app/settings" icon={Settings} label="Configurações" />
          
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-4 text-red-400 mt-8 border-t border-white/10">
            <LogOut size={20} /> Sair
          </button>
        </div>
      )}

      <main className="flex-1 md:ml-64 min-h-screen bg-zinc-950 overflow-x-hidden relative z-0">
        <div className="hidden md:flex fixed top-5 right-6 z-50">
            <div className="bg-zinc-900/30 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-lg hover:border-violet-500/30 transition-colors">
                <NotificationBell isMobile={true} />
            </div>
        </div>

        <div className="pt-16 md:pt-0">
           <Outlet />
        </div>
      </main>

      {showTermsModal && <TermsModal />}
    </div>
  );
}