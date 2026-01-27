import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import ForgotPasswordModal from '../../components/ui/ForgotPasswordModal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950">
      
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/40 to-black z-10" />
        <img 
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop" 
            alt="Movie Theater" 
            className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        
        <div className="relative z-20 p-12 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                    <Film strokeWidth={3} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">CineSorte</span>
            </div>
            
            <div className="max-w-md space-y-4">
                <h1 className="text-4xl font-black text-white leading-tight">
                    Sua jornada cinematográfica <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">continua aqui.</span>
                </h1>
                <p className="text-zinc-300 text-lg leading-relaxed">
                    Acesse suas listas personalizadas, continue suas reviews e veja o que seus amigos estão assistindo agora.
                </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                <div className="w-8 h-[1px] bg-zinc-700" />
                Bem-vindo de volta
            </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white tracking-tight">Login</h2>
                <p className="mt-2 text-zinc-400">Digite suas credenciais para acessar.</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Senha</label>
                            <button 
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs text-violet-400 hover:text-violet-300 hover:underline outline-none"
                            >
                                Esqueceu a senha?
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-12 pr-12 py-3 text-white outline-none transition-all placeholder:text-zinc-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full group relative overflow-hidden bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 active:scale-[0.99]"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? 'Autenticando...' : 'Entrar na plataforma'}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </span>
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-zinc-950 text-zinc-500">Novo por aqui?</span>
                </div>
            </div>

            <div className="text-center">
                <Link 
                    to="/register" 
                    className="inline-flex items-center gap-2 text-white font-medium hover:text-violet-400 transition-colors group"
                >
                    Criar uma conta gratuita
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
      </div>
      
      {showForgotModal && <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />}
    </div>
  );
}