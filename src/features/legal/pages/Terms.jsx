import { createElement } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clapperboard,
  Eye,
  Film,
  HeartHandshake,
  LockKeyhole,
  Puzzle,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'conduta', number: '01', title: 'Código de Conduta e Respeito', icon: HeartHandshake, body: <><p>Queremos manter um ambiente seguro, respeitoso e acolhedor para toda a comunidade.</p><p><strong className="text-zinc-200">Tolerância zero:</strong> não aceitamos:</p><ul><li>Racismo, homofobia, transfobia ou qualquer discriminação.</li><li>Discurso de ódio, assédio, bullying ou ameaças.</li><li>Linguagem ofensiva extrema, ataques pessoais e perseguição.</li></ul><p>Conteúdos impróprios podem ser bloqueados automaticamente e o descumprimento das regras pode levar à remoção permanente da conta.</p></> },
  { id: 'dados-seguranca', number: '02', title: 'Coleta de Dados e Logs de Segurança', icon: Eye, body: <><p>Para proteger contas, combater abuso e investigar acessos indevidos, registramos eventos de segurança relacionados ao uso da plataforma.</p><ul><li><strong className="text-zinc-200">Aceite dos termos:</strong> registramos data, hora e navegador para comprovar a ciência das regras.</li><li><strong className="text-zinc-200">Logs de autenticação e segurança:</strong> podemos registrar IP, navegador, rota acessada, data, hora e resultado de eventos como login, logout, redefinição de senha e sessões inválidas, sempre para prevenção de fraude, auditoria e proteção da conta.</li><li><strong className="text-zinc-200">Alertas de novo acesso:</strong> ao detectar login, podemos usar o IP do acesso para estimar cidade, região, país e coordenadas aproximadas por meio de serviços externos de geolocalização, como ipapi.co, e renderizar um mapa aproximado no email de segurança. A localização pode variar conforme provedor, VPN, rede móvel ou proxy.</li><li><strong className="text-zinc-200">Histórico de alterações:</strong> mudanças sensíveis no perfil, como username, foto, capa e biografia, podem ser registradas para auditoria de segurança.</li></ul></> },
  { id: 'infraestrutura', number: '03', title: 'Segurança e Infraestrutura', icon: LockKeyhole, body: <><p>Mesmo sendo um projeto independente, aplicamos medidas de segurança para proteger autenticação, sessões e tráfego.</p><ul><li><strong className="text-zinc-200">Gestão de identidade:</strong> as credenciais são processadas pelo Google Firebase Auth. O CineSorte não armazena sua senha em texto puro e não tem acesso à senha original da sua conta.</li><li><strong className="text-zinc-200">Proteção de acesso:</strong> usamos verificações de segurança, proteção contra abuso automatizado e tráfego criptografado via HTTPS.</li></ul></> },
  { id: 'conteudo', number: '04', title: 'Conteúdo e Direitos Autorais', icon: Film, body: <><p>O CineSorte funciona como catálogo pessoal e rede social de filmes e séries:</p><ul><li><strong className="text-zinc-200">Não hospedamos vídeos:</strong> não é possível assistir filmes ou séries dentro da plataforma.</li><li><strong className="text-zinc-200">Fonte de dados:</strong> sinopses, datas e imagens podem ser consumidas da API pública do TMDB.</li></ul></> },
  { id: 'privacidade', number: '05', title: 'Privacidade e Uso de Dados', icon: ShieldCheck, body: <><p>Os dados coletados são usados para o funcionamento da plataforma, como:</p><ul><li>criação do perfil público e interação social;</li><li>recomendações e recursos baseados no seu uso;</li><li>gamificação e progressão da conta;</li><li>prevenção de fraude, abuso e invasão de conta.</li></ul><p>Seus dados não são vendidos a terceiros e os logs de segurança são usados exclusivamente para proteção da plataforma e dos usuários.</p></> },
  { id: 'sync', number: '06', title: 'Extensão CineSorte Sync', icon: Puzzle, body: <><p>O uso da extensão é opcional. Quando conectada voluntariamente, ela identifica nos serviços compatíveis o título, temporada, episódio, URL, duração e posição de reprodução para manter o recurso “Continuar assistindo” sincronizado.</p><p>A captura ocorre ao iniciar, pausar, finalizar ou sair do player. A conexão utiliza um token exclusivo e revogável, que não é a senha da conta.</p><div className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.05] p-4 text-emerald-100/70">A extensão não coleta senhas, cookies de streaming, mensagens pessoais, dados financeiros ou localização precisa. Você pode desconectá-la e revogar a autorização.</div><p>Consulte os detalhes na <Link to="/privacidade" className="font-black text-violet-300 hover:text-violet-200">Política de Privacidade</Link>.</p></> },
  { id: 'isencao', number: '07', title: 'Isenção de Responsabilidade', icon: AlertTriangle, body: <><p>O CineSorte é disponibilizado no estado em que se encontra, podendo sofrer alterações, pausas, redefinições de dados ou encerramento sem aviso prévio.</p><ul><li>o uso da plataforma é por conta e risco do usuário;</li><li>o desenvolvedor não garante disponibilidade contínua;</li><li>a plataforma pode evoluir, mudar regras internas e atualizar estes termos quando necessário.</li></ul></> },
];

function goToSection(event, id) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Terms() {
  return (
    <main className="min-h-screen bg-[#08080b] text-zinc-300 selection:bg-violet-500 selection:text-white">
      <Helmet><title>Termos de Uso | CineSorte</title><meta name="description" content="Termos de uso do CineSorte e da extensão CineSorte Sync." /></Helmet>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.13),transparent_30%),radial-gradient(circle_at_92%_30%,rgba(79,70,229,0.06),transparent_28%)]" />

      <header className="relative border-b border-white/[0.06] bg-[#08080b]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link to="/" className="flex items-center gap-3"><Clapperboard size={24} strokeWidth={2.25} className="text-violet-400" /><span className="text-xl font-black tracking-[-0.05em] text-white">Cine<span className="text-violet-400">Sorte</span></span></Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-black text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"><ArrowLeft size={15} /> <span className="hidden sm:inline">Voltar ao início</span><span className="sm:hidden">Voltar</span></Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
        <nav className="mb-5 inline-flex rounded-xl border border-white/[0.07] bg-white/[0.025] p-1" aria-label="Documentos legais">
          <span className="rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/30">Termos de Uso</span>
          <Link to="/privacidade" className="rounded-lg px-4 py-2.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-white">Privacidade</Link>
        </nav>

        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0d0d12] px-6 py-9 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(124,58,237,0.17),transparent_32%)]" />
          <div className="relative max-w-[820px]">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300"><Scale size={14} /> Regras de uso</span>
            <h1 className="mt-5 max-w-[760px] text-3xl font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-4xl lg:text-[2.75rem]">Uma experiência melhor começa com regras claras.</h1>
            <p className="mt-5 max-w-[720px] text-sm font-normal leading-7 text-zinc-400 sm:text-base">Estes termos definem as condições de uso da plataforma, as responsabilidades de cada pessoa e as regras da comunidade CineSorte.</p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-500"><span>Versão 4.1</span><span className="text-zinc-700">•</span><span>Vigente desde 13 de julho de 2026</span><span className="text-zinc-700">•</span><span>Documento público</span></div>
          </div>
        </section>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-16">
          <aside className="hidden lg:sticky lg:top-8 lg:block">
            <span className="px-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Neste documento</span>
            <nav className="mt-3 space-y-1" aria-label="Índice dos termos de uso">
              {sections.map((section) => <a key={section.id} href={`#${section.id}`} onClick={(event) => goToSection(event, section.id)} className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-zinc-500 transition-all hover:bg-white/[0.04] hover:text-white"><span><span className="mr-2 text-[10px] text-zinc-700 group-hover:text-violet-400">{section.number}</span>{section.title}</span><ChevronRight size={13} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" /></a>)}
            </nav>
          </aside>

          <article className="min-w-0 max-w-[900px]">
            <div className="mb-8 rounded-2xl border border-violet-300/10 bg-violet-500/[0.04] p-5 text-sm leading-7 text-zinc-400"><strong className="mb-1 block font-semibold text-zinc-200">Contexto do Projeto</strong>O CineSorte é uma aplicação desenvolvida por Brian Lucca com foco educacional e de portfólio, simulando uma plataforma social de cinema com recursos reais de autenticação, comunidade e personalização.</div>
            <div className="divide-y divide-white/[0.07]">
              {sections.map(({ id, number, title, icon, body }) => <section id={id} key={id} className="scroll-mt-8 py-9 first:pt-0 sm:py-11"><div className="flex items-start gap-4 sm:gap-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-violet-500/[0.06] text-violet-300">{createElement(icon, { size: 18 })}</span><div className="min-w-0 flex-1"><span className="text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-600">Seção {number}</span><h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-zinc-100 sm:text-[1.4rem]">{title}</h2><div className="mt-4 space-y-4 text-sm font-normal leading-7 text-zinc-400 sm:text-[15px] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.72rem] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-violet-500/60 [&_ul]:space-y-2 [&_ul]:pt-1">{body}</div></div></div></section>)}
            </div>
          </article>
        </div>
      </div>

      <footer className="relative mt-8 border-t border-white/[0.06] px-5 py-8 sm:px-8 lg:px-12 xl:px-16"><div className="mx-auto flex max-w-[1312px] flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 CineSorte. Termos públicos e acessíveis sem login.</span><span className="inline-flex items-center gap-2"><Check size={13} className="text-emerald-500" /> Última revisão: 13 de julho de 2026</span></div></footer>
    </main>
  );
}
