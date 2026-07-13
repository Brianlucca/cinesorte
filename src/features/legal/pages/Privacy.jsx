import { createElement } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clapperboard,
  Database,
  EyeOff,
  FileText,
  LockKeyhole,
  MessageCircleQuestion,
  Puzzle,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCheck,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'quem-somos',
    number: '01',
    title: 'Quem somos',
    icon: Clapperboard,
    content: (
      <p>O CineSorte é uma plataforma social e um catálogo pessoal de filmes e séries desenvolvido por Brian Lucca. Esta política explica como os dados são tratados no site CineSorte e na extensão CineSorte Sync.</p>
    ),
  },
  {
    id: 'termos-transparencia',
    number: '02',
    title: 'Termos de uso e transparência',
    icon: FileText,
    content: (
      <>
        <p><strong className="text-zinc-200">Contexto do Projeto:</strong> O CineSorte é uma aplicação desenvolvida por Brian Lucca com foco educacional e de portfólio, simulando uma plataforma social de cinema com recursos reais de autenticação, comunidade e personalização.</p>
        <h3 className="pt-3 font-semibold text-zinc-200">Código de Conduta e Respeito</h3>
        <p>Queremos manter um ambiente seguro, respeitoso e acolhedor para toda a comunidade. Não aceitamos racismo, homofobia, transfobia ou qualquer discriminação; discurso de ódio, assédio, bullying ou ameaças; linguagem ofensiva extrema, ataques pessoais e perseguição. Conteúdos impróprios podem ser bloqueados automaticamente e o descumprimento das regras pode levar à remoção permanente da conta.</p>
        <h3 className="pt-3 font-semibold text-zinc-200">Coleta de Dados e Logs de Segurança</h3>
        <p>Para proteger contas, combater abuso e investigar acessos indevidos, registramos eventos de segurança relacionados ao uso da plataforma.</p>
        <ul><li><strong className="text-zinc-200">Aceite dos termos:</strong> registramos data, hora e navegador para comprovar a ciência das regras.</li><li><strong className="text-zinc-200">Logs de autenticação e segurança:</strong> podemos registrar IP, navegador, rota acessada, data, hora e resultado de eventos como login, logout, redefinição de senha e sessões inválidas, sempre para prevenção de fraude, auditoria e proteção da conta.</li><li><strong className="text-zinc-200">Alertas de novo acesso:</strong> podemos usar o IP para estimar cidade, região, país e coordenadas aproximadas por serviços externos, como ipapi.co, e renderizar um mapa aproximado no email de segurança. A localização pode variar conforme provedor, VPN, rede móvel ou proxy.</li><li><strong className="text-zinc-200">Histórico de alterações:</strong> mudanças sensíveis no perfil, como username, foto, capa e biografia, podem ser registradas para auditoria.</li></ul>
        <h3 className="pt-3 font-semibold text-zinc-200">Segurança e Infraestrutura</h3>
        <p>As credenciais são processadas pelo Google Firebase Auth. O CineSorte não armazena sua senha em texto puro nem tem acesso à senha original. Usamos verificações de segurança, proteção contra abuso automatizado e tráfego criptografado via HTTPS.</p>
        <h3 className="pt-3 font-semibold text-zinc-200">Conteúdo e Direitos Autorais</h3>
        <p>O CineSorte funciona como catálogo pessoal e rede social de filmes e séries. Não hospedamos vídeos, e sinopses, datas e imagens podem ser consumidas da API pública do TMDB.</p>
        <h3 className="pt-3 font-semibold text-zinc-200">Privacidade e Uso de Dados</h3>
        <p>Os dados são usados para criação do perfil público e interação social, recomendações, gamificação, progressão da conta e prevenção de fraude, abuso e invasão. Seus dados não são vendidos a terceiros e os logs de segurança são usados para proteção da plataforma e dos usuários.</p>
        <h3 className="pt-3 font-semibold text-zinc-200">Extensão CineSorte Sync</h3>
        <p>O uso é opcional. A extensão sincroniza título, temporada, episódio, URL, duração e posição ao iniciar, pausar, finalizar ou sair do player. Ela utiliza um token exclusivo e revogável e não coleta senhas, cookies de streaming, mensagens pessoais, dados financeiros ou localização precisa.</p>
        <h3 className="pt-3 font-semibold text-zinc-200">Isenção de Responsabilidade</h3>
        <p>O CineSorte é disponibilizado no estado em que se encontra e pode sofrer alterações, pausas, redefinições de dados ou encerramento sem aviso prévio. O uso é por conta e risco do usuário; não garantimos disponibilidade contínua; e a plataforma pode evoluir, mudar regras internas e atualizar os termos quando necessário.</p>
      </>
    ),
  },
  {
    id: 'dados-tratados',
    number: '03',
    title: 'Dados que tratamos',
    icon: Database,
    content: (
      <>
        <p>Para autenticar sua conta, personalizar a experiência, oferecer recursos sociais e proteger a plataforma, podemos tratar:</p>
        <ul>
          <li>nome, username, email e foto de perfil;</li>
          <li>preferências, avaliações, listas, interações e conteúdo publicado;</li>
          <li>data, navegador e versão dos termos aceitos;</li>
          <li>registros técnicos de segurança, como IP, navegador, rota, data, hora e resultado do evento.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'extensao',
    number: '04',
    title: 'Extensão CineSorte Sync',
    icon: Puzzle,
    content: (
      <>
        <p>Quando você instala e conecta voluntariamente a extensão, ela pode identificar nos streamings compatíveis o título do filme ou série, temporada, episódio, URL da página, identificador do conteúdo, duração e posição de reprodução.</p>
        <p>A sincronização pode ocorrer ao iniciar, pausar, finalizar ou sair do player. Essas informações são utilizadas para manter o recurso “Continuar assistindo” atualizado na sua conta.</p>
        <p>A conexão utiliza um token exclusivo e revogável. Esse token não é a senha da sua conta e pode ser invalidado nas configurações de segurança.</p>
        <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] p-4 text-sm leading-6 text-emerald-100/75">
          <strong className="mb-2 block text-emerald-300">A extensão não coleta:</strong>
          senhas, cookies dos serviços de streaming, mensagens pessoais, informações financeiras ou localização precisa do dispositivo.
        </div>
      </>
    ),
  },
  {
    id: 'armazenamento',
    number: '05',
    title: 'Armazenamento e compartilhamento',
    icon: Server,
    content: (
      <>
        <p>Configurações, preferências e progresso recente podem permanecer no armazenamento local do navegador. Com a sincronização habilitada, os dados de progresso são enviados por HTTPS à API oficial do CineSorte e vinculados à sua conta.</p>
        <p>Não vendemos dados pessoais. Prestadores técnicos podem processar informações apenas para operar autenticação, hospedagem, banco de dados, segurança e comunicações essenciais do serviço.</p>
      </>
    ),
  },
  {
    id: 'seguranca',
    number: '06',
    title: 'Segurança e retenção',
    icon: LockKeyhole,
    content: (
      <p>Utilizamos HTTPS, controles de acesso, tokens revogáveis e medidas contra abuso. Os dados são mantidos enquanto necessários para prestar o serviço e proteger a plataforma, ou até que você os remova ou solicite a exclusão da conta, respeitadas eventuais retenções técnicas e legais aplicáveis.</p>
    ),
  },
  {
    id: 'seus-controles',
    number: '07',
    title: 'Seus controles',
    icon: SlidersHorizontal,
    content: (
      <>
        <p>Você mantém controle sobre os dados associados à sua experiência e pode:</p>
        <ul>
          <li>remover itens do histórico de progresso;</li>
          <li>desconectar a CineSorte Sync e revogar dispositivos autorizados;</li>
          <li>atualizar informações do perfil;</li>
          <li>solicitar a exclusão da conta e dos dados pela Central de Chamados.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'terceiros',
    number: '08',
    title: 'Serviços de terceiros',
    icon: FileText,
    content: (
      <p>A extensão funciona somente nos domínios compatíveis declarados em seu pacote. O CineSorte não hospeda filmes ou séries e não controla as políticas dos serviços de streaming. Imagens e metadados do catálogo também podem ser fornecidos pelo TMDB.</p>
    ),
  },
  {
    id: 'atualizacoes',
    number: '09',
    title: 'Atualizações e contato',
    icon: MessageCircleQuestion,
    content: (
      <p>Alterações relevantes geram uma nova versão deste documento e podem exigir um novo aceite. Para dúvidas sobre privacidade ou solicitações relacionadas aos seus dados, utilize a Central de Chamados nas configurações da conta.</p>
    ),
  },
];

const summary = [
  { icon: EyeOff, title: 'Não vendemos seus dados', text: 'Suas informações não são comercializadas com terceiros.' },
  { icon: ShieldCheck, title: 'Acesso controlável', text: 'Conexões da extensão podem ser visualizadas e revogadas.' },
  { icon: UserRoundCheck, title: 'Você mantém o controle', text: 'É possível atualizar ou solicitar a exclusão dos seus dados.' },
];

function goToSection(event, id) {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#08080b] text-zinc-300 selection:bg-violet-500 selection:text-white">
      <Helmet>
        <title>Privacidade e Transparência | CineSorte</title>
        <meta name="description" content="Política de privacidade do CineSorte e da extensão CineSorte Sync." />
      </Helmet>

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(124,58,237,0.13),transparent_30%),radial-gradient(circle_at_92%_30%,rgba(79,70,229,0.06),transparent_28%)]" />

      <header className="relative border-b border-white/[0.06] bg-[#08080b]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link to="/" className="flex items-center gap-3" aria-label="Voltar ao CineSorte">
            <Clapperboard size={24} strokeWidth={2.25} className="text-violet-400" />
            <span className="text-xl font-black tracking-[-0.05em] text-white">Cine<span className="text-violet-400">Sorte</span></span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-black text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white">
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Voltar ao início</span><span className="sm:hidden">Voltar</span>
          </Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
        <nav className="mb-5 inline-flex rounded-xl border border-white/[0.07] bg-white/[0.025] p-1" aria-label="Documentos legais">
          <Link to="/termos" className="rounded-lg px-4 py-2.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-white">Termos de Uso</Link>
          <span className="rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/30">Privacidade</span>
        </nav>
        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[#0d0d12] px-6 py-9 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(124,58,237,0.17),transparent_32%)]" />
          <div className="relative max-w-[820px]">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300"><ShieldCheck size={14} /> Privacidade e transparência</span>
            <h1 className="mt-5 max-w-[760px] text-3xl font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-4xl lg:text-[2.75rem]">Seus dados, explicados com clareza.</h1>
            <p className="mt-5 max-w-[720px] text-sm font-normal leading-7 text-zinc-400 sm:text-base">Entenda quais informações o CineSorte utiliza, por que elas são necessárias e quais controles estão disponíveis para você.</p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-500">
              <span>Versão 4.1</span><span className="text-zinc-700">•</span><span>Vigente desde 13 de julho de 2026</span><span className="text-zinc-700">•</span><span>Documento público</span>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          {summary.map(({ icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              {createElement(icon, { size: 19, className: 'text-violet-300' })}
              <h2 className="mt-4 text-sm font-semibold text-zinc-100">{title}</h2>
              <p className="mt-1.5 text-xs font-normal leading-5 text-zinc-500">{text}</p>
            </article>
          ))}
        </section>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-16">
          <aside className="hidden lg:sticky lg:top-8 lg:block">
            <span className="px-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-600">Neste documento</span>
            <nav className="mt-3 space-y-1" aria-label="Índice da política de privacidade">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} onClick={(event) => goToSection(event, section.id)} className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-zinc-500 transition-all hover:bg-white/[0.04] hover:text-white">
                  <span><span className="mr-2 text-[10px] text-zinc-700 group-hover:text-violet-400">{section.number}</span>{section.title}</span>
                  <ChevronRight size={13} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </nav>
            <div className="mt-6 rounded-2xl border border-violet-300/10 bg-violet-500/[0.05] p-4">
              <ShieldCheck size={18} className="text-violet-300" />
              <p className="mt-3 text-xs font-bold leading-5 text-zinc-400">Precisa exercer algum controle sobre seus dados?</p>
              <Link to="/login" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-violet-300 hover:text-violet-200">Acessar minha conta <ChevronRight size={13} /></Link>
            </div>
          </aside>

          <article className="min-w-0 max-w-[900px]">
            <div className="mb-8 border-b border-white/[0.07] pb-6">
              <p className="text-sm leading-7 text-zinc-400">Esta política foi escrita para facilitar a compreensão sobre o tratamento de dados no CineSorte. Cada seção abaixo apresenta uma parte específica da experiência.</p>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {sections.map(({ id, number, title, icon, content }) => (
                <section id={id} key={id} className="scroll-mt-8 py-9 first:pt-0 sm:py-11">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-violet-300/10 bg-violet-500/[0.07] text-violet-300">{createElement(icon, { size: 19 })}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-600">Seção {number}</span>
                      <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-zinc-100 sm:text-[1.4rem]">{title}</h2>
                      <div className="mt-4 space-y-4 text-sm font-normal leading-7 text-zinc-400 sm:text-[15px] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.72rem] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-violet-500/60 [&_ul]:space-y-2 [&_ul]:pt-1">{content}</div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-violet-300/15 bg-[linear-gradient(120deg,rgba(109,40,217,0.16),rgba(255,255,255,0.02))] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">Privacidade também é controle</span>
                  <h2 className="mt-2 text-xl font-black text-white">Gerencie sua conta e seus dados.</h2>
                  <p className="mt-2 max-w-[570px] text-sm leading-6 text-zinc-400">Entre na plataforma para revisar dispositivos conectados, ajustar seu perfil ou abrir um chamado.</p>
                </div>
                <Link to="/login" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-zinc-950 transition-colors hover:bg-violet-100">Acessar conta <ChevronRight size={14} /></Link>
              </div>
            </section>
          </article>
        </div>
      </div>

      <footer className="relative mt-8 border-t border-white/[0.06] px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex max-w-[1312px] flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CineSorte. Política pública e acessível sem login.</span>
          <span className="inline-flex items-center gap-2"><Check size={13} className="text-emerald-500" /> Última revisão: 13 de julho de 2026</span>
        </div>
      </footer>
    </main>
  );
}
