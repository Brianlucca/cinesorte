import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Eye, EyeOff, ArrowRight, Film, ShieldCheck } from 'lucide-react';
import TermsModal from '../../components/ui/TermsModal';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', nickname: '', email: '', password: '', confirmPassword: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsPreview, setShowTermsPreview] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  const nicknameRegex = /^[a-z0-9_]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordSpecialRegex = /[!@#$&*.,?_~\-]/;
  const passwordUpperRegex = /[A-Z]/;

  const validations = useMemo(() => {
    const isNameValid = formData.name.length >= 2 && nameRegex.test(formData.name);
    const isNickValid = formData.nickname.length >= 3 && nicknameRegex.test(formData.nickname);
    const isEmailValid = emailRegex.test(formData.email);
    
    const pwd = formData.password;
    const pwdLength = pwd.length >= 6;
    const pwdUpper = passwordUpperRegex.test(pwd);
    const pwdSpecial = passwordSpecialRegex.test(pwd);
    const isPwdValid = pwdLength && pwdUpper && pwdSpecial;
    
    const isMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

    return { isNameValid, isNickValid, isEmailValid, pwdLength, pwdUpper, pwdSpecial, isPwdValid, isMatch };
  }, [formData]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'nickname') {
          setFormData({ ...formData, [name]: value.toLowerCase().replace(/\s/g, '') });
      } else {
          setFormData({ ...formData, [name]: value });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validations.isNameValid) return setError('Nome deve conter apenas letras.');
    if (!validations.isNickValid) return setError('Nickname inválido (apenas letras, números e _).');
    if (!validations.isPwdValid) return setError('Senha não atende aos requisitos.');
    if (!validations.isMatch) return setError('As senhas não conferem.');
    if (!termsAccepted) return setError('Você deve aceitar os termos de uso.');

    setError(''); 
    setLoading(true);
    try {
      await register({ 
          name: formData.name, 
          nickname: formData.nickname, 
          email: formData.email, 
          password: formData.password 
      });
      navigate('/verify-email'); 
    } catch (err) {
        if (err.response?.data?.errors) {
            setError(err.response.data.errors[0] || 'Dados inválidos.');
        } else {
            setError(err.response?.data?.message || 'Falha no cadastro.'); 
        }
    } finally { 
        setLoading(false); 
    }
  };

  const PasswordPill = ({ met, text }) => (
      <div className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border transition-all ${
          met 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
          : 'bg-zinc-800/50 border-zinc-800 text-zinc-500'
      }`}>
          {text}
      </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-black z-10" />
        <img 
            src="/logo.png" 
            alt="Cinema Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-20 p-12 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">CineSorte</span>
            </div>
            
            <div className="space-y-6 max-w-lg">
                <h1 className="text-5xl font-black text-white leading-tight">
                    Descubra seu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">filme favorito</span>.
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Junte-se a milhares de cinéfilos. Crie listas, compartilhe reviews e participe de uma comunidade apaixonada por cinema e séries.
                </p>

            </div>

            <div className="text-xs text-zinc-500 font-mono">
                © 2026 CineSorte. Todos os Direitos Reservados.
            </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white tracking-tight">Crie sua conta</h2>
                <p className="mt-2 text-zinc-400">Preencha seus dados para começar.</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nome</label>
                        <div className="relative group">
                            <input 
                                name="name" 
                                type="text" 
                                className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 ${formData.name && !validations.isNameValid ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50'}`}
                                placeholder="João Silva"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {validations.isNameValid && <Check size={16} className="absolute right-3 top-3.5 text-emerald-500" />}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nickname</label>
                        <div className="relative group">
                            <input 
                                name="nickname" 
                                type="text" 
                                className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 lowercase ${formData.nickname && !validations.isNickValid ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50'}`}
                                placeholder="joaosilva"
                                value={formData.nickname}
                                onChange={handleChange}
                            />
                            {validations.isNickValid && <Check size={16} className="absolute right-3 top-3.5 text-emerald-500" />}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative group">
                        <input 
                            name="email" 
                            type="email" 
                            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 ${formData.email && !validations.isEmailValid ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50'}`}
                            placeholder="exemplo@email.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {validations.isEmailValid && <Check size={16} className="absolute right-3 top-3.5 text-emerald-500" />}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Senha</label>
                    <div className="relative group">
                        <input 
                            name="password" 
                            type={showPassword ? "text" : "password"} 
                            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 pr-12 ${formData.password && !validations.isPwdValid ? 'border-amber-500/50 focus:border-amber-500' : 'border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50'}`}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    
                    <div className="flex gap-2 pt-1 flex-wrap">
                        <PasswordPill met={validations.pwdLength} text="6+ Caracteres" />
                        <PasswordPill met={validations.pwdUpper} text="Maiúscula" />
                        <PasswordPill met={validations.pwdSpecial} text="Símbolo (!@#)" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Confirmação</label>
                    <div className="relative group">
                        <input 
                            name="confirmPassword" 
                            type="password" 
                            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-zinc-600 ${formData.confirmPassword && !validations.isMatch ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50'}`}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {formData.confirmPassword && validations.isMatch && <Check size={16} className="absolute right-3 top-3.5 text-emerald-500" />}
                    </div>
                </div>

                <div className="pt-2">
                    <label className="flex items-start gap-3 p-4 border border-zinc-800 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700 cursor-pointer transition-all group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={termsAccepted} 
                                onChange={e => setTermsAccepted(e.target.checked)} 
                                className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-zinc-800 checked:bg-violet-600 checked:border-violet-600 transition-all"
                            />
                            <Check size={14} className="absolute left-0.5 top-0.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <div className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            Concordo com os <button type="button" onClick={() => setShowTermsPreview(true)} className="text-white font-medium underline underline-offset-2 decoration-zinc-600 hover:decoration-violet-500 transition-all">Termos de Uso</button> e Política de Privacidade.
                        </div>
                    </label>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full group relative overflow-hidden bg-white text-black font-bold py-4 rounded-xl text-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-white/5 active:scale-[0.99]"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? 'Processando...' : 'Criar minha conta'}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </span>
                </button>
            </form>

            <p className="text-center text-zinc-500">
                Já possui uma conta?{' '}
                <Link to="/login" className="text-white font-medium hover:underline underline-offset-4 decoration-zinc-700 hover:decoration-white transition-all">
                    Entrar agora
                </Link>
            </p>
        </div>
      </div>

      {showTermsPreview && (
        <TermsModal variant="info" onClose={() => setShowTermsPreview(false)} />
      )}
    </div>
  );
}