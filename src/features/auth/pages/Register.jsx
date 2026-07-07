import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import { Check, Eye, EyeOff, ArrowRight, HelpCircle } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import TermsModal from '@shared/components/ui/TermsModal';
import AuthHelpModal from '@shared/components/ui/AuthHelpModal';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const NICKNAME_REGEX = /^[a-z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SPECIAL_REGEX = /[!@#$&*.,?_~-]/;
const PASSWORD_UPPER_REGEX = /[A-Z]/;

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', nickname: '', email: '', password: '', confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsPreview, setShowTermsPreview] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);

  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const path = params.get('redirect');
    return path ? decodeURIComponent(path) : '/app';
  }, [location.search]);

  useEffect(() => {
    if (user) navigate(redirectTo);
  }, [navigate, redirectTo, user]);

  const validations = useMemo(() => {
    const isNameValid = formData.name.length >= 2 && NAME_REGEX.test(formData.name);
    const isNickValid = formData.nickname.length >= 3 && NICKNAME_REGEX.test(formData.nickname);
    const isEmailValid = EMAIL_REGEX.test(formData.email);
    const pwd = formData.password;
    const pwdLength = pwd.length >= 6;
    const pwdUpper = PASSWORD_UPPER_REGEX.test(pwd);
    const pwdSpecial = PASSWORD_SPECIAL_REGEX.test(pwd);
    const isPwdValid = pwdLength && pwdUpper && pwdSpecial;
    const isMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
    return { isNameValid, isNickValid, isEmailValid, pwdLength, pwdUpper, pwdSpecial, isPwdValid, isMatch };
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nickname' ? value.toLowerCase().replace(/\s/g, '') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validations.isNameValid) return setError('Nome deve conter apenas letras.');
    if (!validations.isNickValid) return setError('Nickname inválido (apenas letras, números e _).');
    if (!validations.isPwdValid) return setError('Senha não atende aos requisitos.');
    if (!validations.isMatch) return setError('As senhas não conferem.');
    if (!termsAccepted) return setError('Você deve aceitar os termos de uso.');
    if (!turnstileToken) return setError('Complete a verificação de segurança.');
    setError('');
    setLoading(true);
    try {
      await register({
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
        turnstileToken,
      });
      sessionStorage.setItem('cinesorte:pendingVerificationEmail', formData.email);
      const params = new URLSearchParams(location.search);
      const redirectPath = params.get('redirect');
      navigate(
        redirectPath
          ? `/verify-email?redirect=${encodeURIComponent(redirectPath)}`
          : '/verify-email',
        { state: { email: formData.email } }
      );
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.message || 'Falha no cadastro.');
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const PasswordPill = ({ met, text }) => (
    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
      met ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-black/40 border-white/5 text-zinc-500'
    }`}>
      {text}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950 overflow-x-hidden">
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-black z-10" />
        <img
          src="/logo.png"
          alt="Cinema Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-20 p-12 flex flex-col justify-between h-full">
          <span className="text-3xl font-black text-white tracking-tight">CineSorte</span>
          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Descubra seu próximo{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                filme favorito
              </span>.
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              Junte-se a milhares de cinéfilos. Crie listas, compartilhe reviews e participe de uma comunidade apaixonada por cinema e séries.
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">© 2026 CineSorte. Todos os Direitos Reservados.</div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-white tracking-tight">Crie sua conta</h2>
            <p className="mt-2 text-zinc-500 font-medium">Preencha seus dados para começar.</p>
          </div>

          {error && (
            <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-medium flex items-center gap-3 shadow-inner">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome</label>
                <div className="relative">
                  <input name="name" type="text"
                    className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 ${formData.name && !validations.isNameValid ? 'border-red-500/50 focus:bg-black/60' : 'border-white/5 focus:border-violet-500/50 focus:bg-black/60'}`}
                    placeholder="João Silva" value={formData.name} onChange={handleChange} />
                  {validations.isNameValid && <Check size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" />}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nickname</label>
                <div className="relative">
                  <input name="nickname" type="text"
                    className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 lowercase ${formData.nickname && !validations.isNickValid ? 'border-red-500/50 focus:bg-black/60' : 'border-white/5 focus:border-violet-500/50 focus:bg-black/60'}`}
                    placeholder="joaosilva" value={formData.nickname} onChange={handleChange} />
                  {validations.isNickValid && <Check size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" />}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <input name="email" type="email"
                  className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 ${formData.email && !validations.isEmailValid ? 'border-red-500/50 focus:bg-black/60' : 'border-white/5 focus:border-violet-500/50 focus:bg-black/60'}`}
                  placeholder="exemplo@email.com" value={formData.email} onChange={handleChange} />
                {validations.isEmailValid && <Check size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" />}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'}
                  className={`w-full bg-black/40 border rounded-2xl pl-5 pr-14 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 ${formData.password && !validations.isPwdValid ? 'border-amber-500/50 focus:bg-black/60' : 'border-white/5 focus:border-violet-500/50 focus:bg-black/60'}`}
                  placeholder="••••••••" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex gap-2 pt-2 flex-wrap">
                <PasswordPill met={validations.pwdLength} text="6+ Caracteres" />
                <PasswordPill met={validations.pwdUpper} text="Maiúscula" />
                <PasswordPill met={validations.pwdSpecial} text="Símbolo (!@#)" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirmação</label>
              <div className="relative">
                <input name="confirmPassword" type="password"
                  className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-white font-medium outline-none transition-all shadow-inner placeholder:text-zinc-600 ${formData.confirmPassword && !validations.isMatch ? 'border-red-500/50 focus:bg-black/60' : 'border-white/5 focus:border-violet-500/50 focus:bg-black/60'}`}
                  placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                {formData.confirmPassword && validations.isMatch && <Check size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" />}
              </div>
            </div>

            <label className="flex items-start gap-4 p-5 border border-white/5 rounded-2xl bg-black/20 hover:bg-black/40 cursor-pointer transition-all group shadow-inner">
              <div className="relative flex items-center mt-0.5 shrink-0">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="peer appearance-none w-6 h-6 border-2 border-zinc-600 rounded-lg bg-black/50 checked:bg-violet-600 checked:border-violet-600 transition-all outline-none" />
                <Check size={16} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <div className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                Concordo com os{' '}
                <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsPreview(true); }} className="text-white font-bold hover:text-violet-400 transition-colors relative z-10">
                  Termos de Uso
                </button>{' '}
                e Política de Privacidade.
              </div>
            </label>

            <div className="flex justify-center lg:justify-start w-full overflow-hidden">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'dark', language: 'pt-BR' }}
              />
            </div>

            <button type="submit" disabled={loading || !turnstileToken}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 group"
            >
              {loading ? 'Processando...' : 'Criar minha conta'}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-zinc-500 font-medium pt-4">
            Já possui uma conta?{' '}
            <Link to={`/login${location.search}`} className="text-white font-bold hover:text-violet-400 transition-colors">
              Entrar agora
            </Link>
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
            >
              <HelpCircle size={16} />
              Preciso de ajuda
            </button>
          </div>
        </div>
      </div>

      {showTermsPreview && <TermsModal variant="info" onClose={() => setShowTermsPreview(false)} />}
      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}
