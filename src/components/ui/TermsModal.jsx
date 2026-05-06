import {
  Activity,
  AlertTriangle,
  Eye,
  FileText,
  Film,
  HeartHandshake,
  Info,
  Lock,
  MapPin,
  Server,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TermsModal({ variant = 'action', onClose }) {
  const { acceptTerms, logout } = useAuth();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 bg-zinc-950/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 shrink-0">
              {variant === 'action' ? <ShieldCheck size={28} /> : <FileText size={28} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                Termos de Uso e Transparência
              </h2>
              <p className="text-sm text-zinc-400">Versão 4.0 • CineSorte</p>
            </div>
          </div>
          {variant === 'info' && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 bg-zinc-900/50">
          <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-5 rounded-xl">
            <h4 className="text-violet-300 font-bold text-base mb-2 flex items-center gap-2">
              <Info size={18} /> Contexto do Projeto
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed text-justify">
              O CineSorte é uma aplicação desenvolvida por{' '}
              <span className="font-bold text-violet-400">Brian Lucca</span> com foco
              educacional e de portfólio, simulando uma plataforma social de cinema com
              recursos reais de autenticação, comunidade e personalização.
            </p>
          </div>

          <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
            <section>
              <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                <HeartHandshake size={18} className="text-red-400" />
                1. Código de Conduta e Respeito
              </h4>
              <div className="pl-4 border-l-2 border-red-500/20 space-y-3">
                <p className="font-medium text-white/90">
                  Queremos manter um ambiente seguro, respeitoso e acolhedor para toda a comunidade.
                </p>
                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-200/90">
                  <strong>Tolerância zero:</strong> não aceitamos:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Racismo, homofobia, transfobia ou qualquer discriminação.</li>
                    <li>Discurso de ódio, assédio, bullying ou ameaças.</li>
                    <li>Linguagem ofensiva extrema, ataques pessoais e perseguição.</li>
                  </ul>
                </div>
                <p className="text-zinc-500 italic text-xs">
                  Conteúdos impróprios podem ser bloqueados automaticamente e o descumprimento das regras pode levar à remoção permanente da conta.
                </p>
              </div>
            </section>

            <section>
              <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                <Eye size={18} className="text-amber-400" />
                2. Coleta de Dados e Logs de Segurança
              </h4>
              <div className="pl-4 border-l-2 border-amber-500/20 space-y-3">
                <p>
                  Para proteger contas, combater abuso e investigar acessos indevidos, registramos eventos de segurança relacionados ao uso da plataforma.
                </p>
                <ul className="grid grid-cols-1 gap-2 mt-2">
                  <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      <strong>Aceite dos termos:</strong> registramos data, hora e navegador para comprovar a ciência das regras.
                    </span>
                  </li>
                  <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                    <Activity size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      <strong>Logs de autenticação e segurança:</strong> podemos registrar IP, navegador, rota acessada, data, hora e resultado de eventos como login, logout, redefinição de senha e sessões inválidas, sempre para prevenção de fraude, auditoria e proteção da conta.
                    </span>
                  </li>
                  <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                    <MapPin size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      <strong>Alertas de novo acesso:</strong> ao detectar login, podemos usar o IP do acesso para estimar cidade, região, país e coordenadas aproximadas por meio de serviços externos de geolocalização, como ipapi.co, e renderizar um mapa aproximado no email de segurança. A localização pode variar conforme provedor, VPN, rede móvel ou proxy.
                    </span>
                  </li>
                  <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                    <Activity size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      <strong>Histórico de alterações:</strong> mudanças sensíveis no perfil, como username, foto, capa e biografia, podem ser registradas para auditoria de segurança.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                <Lock size={18} className="text-emerald-400" />
                3. Segurança e Infraestrutura
              </h4>
              <div className="pl-4 border-l-2 border-emerald-500/20 space-y-3">
                <p>
                  Mesmo sendo um projeto independente, aplicamos medidas de segurança para proteger autenticação, sessões e tráfego.
                </p>
                <ul className="grid grid-cols-1 gap-3 mt-2">
                  <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                    <Server size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>
                      <strong>Gestão de identidade:</strong> as credenciais são processadas pelo Google Firebase Auth. O CineSorte não armazena sua senha em texto puro e não tem acesso à senha original da sua conta.
                    </span>
                  </li>
                  <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>
                      <strong>Proteção de acesso:</strong> usamos verificações de segurança, proteção contra abuso automatizado e tráfego criptografado via HTTPS.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                <Film size={18} className="text-pink-500" />
                4. Conteúdo e Direitos Autorais
              </h4>
              <div className="pl-4 border-l-2 border-pink-500/20">
                <p className="mb-2">
                  O CineSorte funciona como catálogo pessoal e rede social de filmes e séries:
                </p>
                <ul className="list-disc pl-5 space-y-1 marker:text-pink-500">
                  <li><strong>Não hospedamos vídeos:</strong> não é possível assistir filmes ou séries dentro da plataforma.</li>
                  <li><strong>Fonte de dados:</strong> sinopses, datas e imagens podem ser consumidas da API pública do TMDB.</li>
                </ul>
              </div>
            </section>

            <section>
              <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                <UserCheck size={18} className="text-blue-400" />
                5. Privacidade e Uso de Dados
              </h4>
              <div className="pl-4 border-l-2 border-blue-500/20">
                <p>Os dados coletados são usados para o funcionamento da plataforma, como:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-blue-500">
                  <li>criação do perfil público e interação social;</li>
                  <li>recomendações e recursos baseados no seu uso;</li>
                  <li>gamificação e progressão da conta;</li>
                  <li>prevenção de fraude, abuso e invasão de conta.</li>
                </ul>
                <p className="mt-2 text-blue-200/80 italic">
                  Seus dados não são vendidos a terceiros e os logs de segurança são usados exclusivamente para proteção da plataforma e dos usuários.
                </p>
              </div>
            </section>

            <section>
              <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-orange-500" />
                6. Isenção de Responsabilidade
              </h4>
              <div className="pl-4 border-l-2 border-orange-500/20">
                <p className="mb-2">
                  O CineSorte é disponibilizado no estado em que se encontra, podendo sofrer alterações, pausas, redefinições de dados ou encerramento sem aviso prévio.
                </p>
                <ul className="list-disc pl-5 space-y-1 marker:text-orange-500">
                  <li>o uso da plataforma é por conta e risco do usuário;</li>
                  <li>o desenvolvedor não garante disponibilidade contínua;</li>
                  <li>a plataforma pode evoluir, mudar regras internas e atualizar estes termos quando necessário.</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col sm:flex-row gap-3 shrink-0">
          {variant === 'action' ? (
            <>
              <button
                onClick={logout}
                className="w-full sm:w-auto px-6 py-4 rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors font-medium text-sm uppercase tracking-wide"
              >
                Recusar e sair
              </button>
              <button
                onClick={acceptTerms}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-violet-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Li, entendi e concordo
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white rounded-xl font-bold transition-all"
            >
              Fechar aviso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
