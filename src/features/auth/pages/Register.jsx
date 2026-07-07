import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';
import {
  AlertCircle,
  ArrowRight,
  AtSign,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  User,
} from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import TermsModal from '@shared/components/ui/TermsModal';
import AuthHelpModal from '@shared/components/ui/AuthHelpModal';
import AuthShell from '@features/auth/components/AuthShell';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const NAME_REGEX = /^[\p{L}\s]+$/u;
const NICKNAME_REGEX = /^[a-z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_SPECIAL_REGEX = /[!@#$&*.,?_~-]/;
const PASSWORD_UPPER_REGEX = /[A-Z]/;

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    const password = formData.password;
    const pwdLength = password.length >= 6;
    const pwdUpper = PASSWORD_UPPER_REGEX.test(password);
    const pwdSpecial = PASSWORD_SPECIAL_REGEX.test(password);
    const isPwdValid = pwdLength && pwdUpper && pwdSpecial;
    const isMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
    return { isNameValid, isNickValid, isEmailValid, pwdLength, pwdUpper, pwdSpecial, isPwdValid, isMatch };
  }, [formData]);

  const canSubmit =
    validations.isNameValid &&
    validations.isNickValid &&
    validations.isEmailValid &&
    validations.isPwdValid &&
    validations.isMatch &&
    termsAccepted &&
    turnstileToken;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nickname' ? value.toLowerCase().replace(/\s/g, '') : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validations.isNameValid) return setError('Nome deve conter pelo menos 2 letras.');
    if (!validations.isNickValid) return setError('Nome de usuário inválido. Use letras minúsculas, números ou _.');
    if (!validations.isEmailValid) return setError('Digite um email válido.');
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition-all ${
        met
          ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
          : 'border-white/[0.07] bg-black/25 text-zinc-600'
      }`}
    >
      {met && <Check size={12} />}
      {text}
    </span>
  );

  const footer = (
    <div className="rounded-[1.25rem] border border-white/[0.07] bg-white/[0.025] p-4 text-center">
      <p className="text-sm font-medium text-zinc-500">
        Já possui uma conta?{' '}
        <Link to={`/login${location.search}`} className="font-black text-white transition-colors hover:text-violet-300">
          Entrar agora
        </Link>
      </p>
    </div>
  );

  return (
    <>
      <AuthShell
        eyebrow="Primeiro acesso"
        title="Criar sua conta"
        description="Leva menos de um minuto para começar a salvar filmes, escrever reviews e conversar com outros perfis."
        sideTitle="Entre no CineSorte."
        sideDescription="Monte suas listas, acompanhe seu diário de filmes e descubra recomendações com base no seu gosto."
        footer={footer}
        onHelp={() => setShowHelpModal(true)}
      >
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-500/10 p-4 text-sm font-medium leading-6 text-red-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2.5">
              <label htmlFor="register-name" className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Nome
              </label>
              <div className="group relative">
                <User size={17} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-300" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`w-full rounded-2xl border bg-black/30 py-4 pl-11 pr-10 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:bg-black/45 ${
                    formData.name && !validations.isNameValid ? 'border-red-400/40' : 'border-white/[0.08] focus:border-violet-300/35'
                  }`}
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                />
                {validations.isNameValid && <CheckCircle2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />}
              </div>
            </div>

            <div className="space-y-2.5">
              <label htmlFor="register-nickname" className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Usuário
              </label>
              <div className="group relative">
                <AtSign size={17} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-300" />
                <input
                  id="register-nickname"
                  name="nickname"
                  type="text"
                  autoComplete="username"
                  className={`w-full rounded-2xl border bg-black/30 py-4 pl-11 pr-10 text-sm font-semibold lowercase text-white outline-none transition-all placeholder:text-zinc-700 focus:bg-black/45 ${
                    formData.nickname && !validations.isNickValid ? 'border-red-400/40' : 'border-white/[0.08] focus:border-violet-300/35'
                  }`}
                  placeholder="joaosilva"
                  value={formData.nickname}
                  onChange={handleChange}
                />
                {validations.isNickValid && <CheckCircle2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="register-email" className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Email
            </label>
            <div className="group relative">
              <Mail size={17} className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-violet-300" />
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`w-full rounded-2xl border bg-black/30 py-4 pl-11 pr-10 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:bg-black/45 ${
                  formData.email && !validations.isEmailValid ? 'border-red-400/40' : 'border-white/[0.08] focus:border-violet-300/35'
                }`}
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
              />
              {validations.isEmailValid && <CheckCircle2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />}
            </div>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="register-password" className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Senha
            </label>
            <div className="group relative">
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`w-full rounded-2xl border bg-black/30 py-4 pl-4 pr-12 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:bg-black/45 ${
                  formData.password && !validations.isPwdValid ? 'border-amber-300/40' : 'border-white/[0.08] focus:border-violet-300/35'
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <PasswordPill met={validations.pwdLength} text="6+ caracteres" />
              <PasswordPill met={validations.pwdUpper} text="Maiúscula" />
              <PasswordPill met={validations.pwdSpecial} text="Símbolo" />
            </div>
          </div>

          <div className="space-y-2.5">
            <label htmlFor="register-confirm-password" className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              Confirmar senha
            </label>
            <div className="relative">
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`w-full rounded-2xl border bg-black/30 py-4 pl-4 pr-10 text-sm font-semibold text-white outline-none transition-all placeholder:text-zinc-700 focus:bg-black/45 ${
                  formData.confirmPassword && !validations.isMatch ? 'border-red-400/40' : 'border-white/[0.08] focus:border-violet-300/35'
                }`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {formData.confirmPassword && validations.isMatch && <CheckCircle2 size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300" />}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/25 p-4 transition-colors hover:bg-white/[0.035]">
            <span className="relative mt-0.5 flex shrink-0 items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="peer h-5 w-5 appearance-none rounded-lg border-2 border-zinc-600 bg-black/50 outline-none transition-all checked:border-violet-500 checked:bg-violet-500"
              />
              <Check size={13} className="pointer-events-none absolute left-1 top-1 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </span>
            <span className="text-sm font-medium leading-6 text-zinc-400">
              Concordo com os{' '}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setShowTermsPreview(true);
                }}
                className="font-black text-white transition-colors hover:text-violet-300"
              >
                Termos de Uso
              </button>{' '}
              e Política de Privacidade.
            </span>
          </label>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/20 p-3">
            <Turnstile
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              options={{ theme: 'dark', language: 'pt-BR' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-zinc-950 shadow-xl shadow-black/20 transition-all hover:scale-[1.01] hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.99]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            {loading ? 'Criando conta' : 'Criar conta'}
          </button>
        </form>
      </AuthShell>

      {showTermsPreview && <TermsModal variant="info" onClose={() => setShowTermsPreview(false)} />}
      <AuthHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </>
  );
}
