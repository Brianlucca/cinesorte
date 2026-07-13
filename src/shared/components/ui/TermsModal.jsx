import { createElement } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Clapperboard,
  Eye,
  FileText,
  Film,
  HeartHandshake,
  LockKeyhole,
  Puzzle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@shared/context/useAuth';

function LegalSection({ icon, number, title, children }) {
  return (
    <section className="py-4 first:pt-0 sm:py-5">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-violet-500/[0.06] text-violet-300">
          {createElement(icon, { size: 18 })}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-600">Seção {number}</span>
          <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-zinc-100">{title}</h3>
          <div className="mt-2.5 space-y-2.5 text-[13px] font-normal leading-6 text-zinc-400 [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.62rem] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-violet-500/60 [&_ul]:space-y-1.5 [&_ul]:pt-1">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TermsModal({ variant = 'action', onClose }) {
  const { acceptTerms, logout } = useAuth();

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black/85 p-3 backdrop-blur-md sm:p-6" style={{ zIndex: 2147483647 }}>
      <div
        className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[1.25rem] border border-white/[0.09] bg-[#0d0d12] shadow-[0_35px_120px_rgba(0,0,0,0.65)] animate-in fade-in zoom-in-95 duration-200"
        style={{ width: 'min(92vw, 640px)', height: 'min(86dvh, 720px)', maxHeight: 'calc(100dvh - 24px)' }}
      >
        <header className="relative min-h-0 border-b border-white/[0.07] px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.10),transparent_36%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Clapperboard size={21} strokeWidth={2.25} className="shrink-0 text-violet-400" />
              <div className="min-w-0">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300">CineSorte · Documento legal</span>
                <h2 className="mt-0.5 truncate text-base font-semibold tracking-[-0.025em] text-white sm:text-lg">Termos de Uso e Transparência</h2>
                <p className="mt-1 text-xs font-medium text-zinc-600">Versão 4.1 · vigente desde 13 de julho de 2026</p>
              </div>
            </div>
            {variant === 'info' && (
              <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.07] hover:text-white" aria-label="Fechar termos">
                <X size={19} />
              </button>
            )}
          </div>
        </header>

        <div className="content-scrollbar min-h-0 overscroll-contain overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="rounded-xl border border-violet-300/10 bg-violet-500/[0.04] p-4">
            <div className="flex items-start gap-3">
              <FileText size={18} className="mt-0.5 shrink-0 text-violet-300" />
              <div>
                <h3 className="font-semibold text-zinc-200">Contexto do Projeto</h3>
                <p className="mt-1.5 text-sm font-normal leading-6 text-zinc-400">O CineSorte é uma aplicação desenvolvida por Brian Lucca com foco educacional e de portfólio, simulando uma plataforma social de cinema com recursos reais de autenticação, comunidade e personalização.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-white/[0.07]">
            <LegalSection icon={HeartHandshake} number="01" title="Código de Conduta e Respeito">
              <p>Queremos manter um ambiente seguro, respeitoso e acolhedor para toda a comunidade.</p>
              <p><strong className="text-zinc-200">Tolerância zero:</strong> não aceitamos:</p>
              <ul><li>Racismo, homofobia, transfobia ou qualquer discriminação.</li><li>Discurso de ódio, assédio, bullying ou ameaças.</li><li>Linguagem ofensiva extrema, ataques pessoais e perseguição.</li></ul>
              <p>Conteúdos impróprios podem ser bloqueados automaticamente e o descumprimento das regras pode levar à remoção permanente da conta.</p>
            </LegalSection>

            <LegalSection icon={Eye} number="02" title="Coleta de Dados e Logs de Segurança">
              <p>Para proteger contas, combater abuso e investigar acessos indevidos, registramos eventos de segurança relacionados ao uso da plataforma.</p>
              <ul><li><strong className="text-zinc-200">Aceite dos termos:</strong> registramos data, hora e navegador para comprovar a ciência das regras.</li><li><strong className="text-zinc-200">Logs de autenticação e segurança:</strong> podemos registrar IP, navegador, rota acessada, data, hora e resultado de eventos como login, logout, redefinição de senha e sessões inválidas.</li><li><strong className="text-zinc-200">Alertas de novo acesso:</strong> podemos usar o IP para estimar cidade, região, país e coordenadas aproximadas por serviços como ipapi.co. A localização pode variar conforme provedor, VPN, rede móvel ou proxy.</li><li><strong className="text-zinc-200">Histórico de alterações:</strong> mudanças sensíveis no perfil podem ser registradas para auditoria.</li></ul>
            </LegalSection>

            <LegalSection icon={LockKeyhole} number="03" title="Segurança e Infraestrutura">
              <p>Mesmo sendo um projeto independente, aplicamos medidas de segurança para proteger autenticação, sessões e tráfego.</p>
              <p>As credenciais são processadas pelo Google Firebase Auth. O CineSorte não armazena sua senha em texto puro e não tem acesso à senha original. Usamos proteção contra abuso automatizado e HTTPS.</p>
            </LegalSection>

            <LegalSection icon={Film} number="04" title="Conteúdo e Direitos Autorais">
              <p>O CineSorte funciona como catálogo pessoal e rede social de filmes e séries.</p>
              <ul><li><strong className="text-zinc-200">Não hospedamos vídeos:</strong> não é possível assistir filmes ou séries dentro da plataforma.</li><li><strong className="text-zinc-200">Fonte de dados:</strong> sinopses, datas e imagens podem ser consumidas da API pública do TMDB.</li></ul>
            </LegalSection>

            <LegalSection icon={ShieldCheck} number="05" title="Privacidade e Uso de Dados">
              <p>Os dados coletados são usados para criação do perfil público e interação social, recomendações, gamificação, progressão da conta e prevenção de fraude, abuso e invasão.</p>
              <p>Seus dados não são vendidos a terceiros e os logs de segurança são usados para proteção da plataforma e dos usuários.</p>
            </LegalSection>

            <LegalSection icon={Puzzle} number="06" title="Extensão CineSorte Sync">
              <p>Quando conectada voluntariamente, a extensão sincroniza título, temporada, episódio, URL, duração e posição ao iniciar, pausar, finalizar ou sair do player.</p>
              <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.05] p-4 text-emerald-100/70">Ela utiliza um token exclusivo e revogável. Não coleta senhas, cookies de streaming, mensagens pessoais, dados financeiros ou localização precisa.</div>
            </LegalSection>

            <LegalSection icon={AlertTriangle} number="07" title="Isenção de Responsabilidade">
              <p>O CineSorte é disponibilizado no estado em que se encontra, podendo sofrer alterações, pausas, redefinições de dados ou encerramento sem aviso prévio.</p>
              <ul><li>o uso da plataforma é por conta e risco do usuário;</li><li>o desenvolvedor não garante disponibilidade contínua;</li><li>a plataforma pode evoluir, mudar regras internas e atualizar estes termos quando necessário.</li></ul>
            </LegalSection>
          </div>

          <div className="mt-4 grid gap-3 border-t border-white/[0.07] pt-7 sm:grid-cols-2">
            <Link to="/termos" target="_blank" className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]">
              <span><span className="block text-sm font-semibold text-zinc-200">Termos de Uso completos</span><span className="mt-1 block text-xs text-zinc-600">Regras e condições da plataforma</span></span><ChevronRight size={16} className="text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />
            </Link>
            <Link to="/privacidade" target="_blank" className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]">
              <span><span className="block text-sm font-semibold text-zinc-200">Política de Privacidade</span><span className="mt-1 block text-xs text-zinc-600">Dados, extensão e seus controles</span></span><ChevronRight size={16} className="text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300" />
            </Link>
          </div>
        </div>

        <footer className="min-h-0 border-t border-white/[0.07] bg-[#0a0a0e]/95 px-4 py-3 backdrop-blur-xl sm:px-5">
          {variant === 'action' ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={logout} className="rounded-xl border border-white/[0.08] px-5 py-3.5 text-xs font-semibold text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white">Recusar e sair</button>
              <button type="button" onClick={acceptTerms} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition-colors hover:bg-violet-500"><Check size={15} /> Li e concordo</button>
            </div>
          ) : (
            <button type="button" onClick={onClose} className="w-full rounded-xl bg-white px-6 py-3.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-violet-100">Fechar documento</button>
          )}
        </footer>
      </div>
    </div>,
    document.body,
  );
}
