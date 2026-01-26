import { ShieldCheck, FileText, Info, Database, Film, Server, Lock, UserCheck, Eye, Activity, X, HeartHandshake } from 'lucide-react';
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
                            <h2 className="text-xl font-bold text-white leading-tight">Termos de Uso e Transparência</h2>
                            <p className="text-sm text-zinc-400">Versão 1.0 • CineSorte</p>
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
                            <Info size={18} /> Contexto do Projeto (Portfólio)
                        </h4>
                        <p className="text-sm text-zinc-300 leading-relaxed text-justify">
                            O CineSorte é uma aplicação desenvolvida por <strong>Brian Lucca</strong> com fins estritamente educacionais, servindo como demonstração de competências técnicas em desenvolvimento Fullstack. Este ambiente simula uma aplicação real de alta fidelidade.
                        </p>
                    </div>

                    <div className="space-y-6 text-sm text-zinc-400 leading-relaxed">
                        
                        <section>
                            <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                                <HeartHandshake size={18} className="text-red-400"/> 
                                1. Código de Conduta e Respeito
                            </h4>
                            <div className="pl-4 border-l-2 border-red-500/20 space-y-3">
                                <p className="font-medium text-white/90">
                                    Promovemos um ambiente seguro e acolhedor para todos os amantes de cinema.
                                </p>
                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-red-200/90">
                                    <strong>Tolerância Zero:</strong> Não aceitamos, sob nenhuma circunstância:
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Racismo, homofobia, transfobia ou qualquer forma de discriminação.</li>
                                        <li>Discurso de ódio, assédio, bullying ou ameaças.</li>
                                        <li>Linguagem ofensiva, xingamentos excessivos ou ataques pessoais.</li>
                                    </ul>
                                </div>
                                <p className="text-zinc-500 italic text-xs">
                                    O descumprimento destas regras resultará no banimento imediato e permanente da conta, sem aviso prévio. Nosso sistema utiliza filtros automáticos para detectar e bloquear conteúdo impróprio.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                                <Eye size={18} className="text-amber-400"/> 
                                2. Coleta de Dados e Auditoria
                            </h4>
                            <div className="pl-4 border-l-2 border-amber-500/20 space-y-3">
                                <p>
                                    Para garantir a segurança da sua conta e a integridade da plataforma, coletamos automaticamente algumas informações nas seguintes situações:
                                </p>
                                <ul className="grid grid-cols-1 gap-2 mt-2">
                                    <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                                        <ShieldCheck size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                        <span><strong>Aceite dos Termos:</strong> Registro de Data/Hora e Navegador (User-Agent) para comprovar a ciência das regras.</span>
                                    </li>
                                    <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                                        <Activity size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                        <span><strong>Histórico de Alterações:</strong> Toda vez que você altera dados sensíveis do perfil (Foto, Nome, Username, Bio), registramos essa ação no histórico interno. Isso serve para auditoria de segurança em caso de invasão de conta.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                                <Lock size={18} className="text-emerald-400"/> 
                                3. Segurança e Infraestrutura
                            </h4>
                            <div className="pl-4 border-l-2 border-emerald-500/20 space-y-3">
                                <p>
                                    Mesmo sendo um projeto de estudo, aplicamos rigorosos padrões de segurança de nível industrial:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                    <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                                        <Server size={16} className="text-emerald-500 mt-0.5" />
                                        <span><strong>Gestão de Identidade:</strong> Suas credenciais são processadas pelo Google Firebase Auth. Nós não temos acesso e nem armazenamos sua senha original.</span>
                                    </li>
                                    <li className="bg-zinc-950/50 p-3 rounded-lg border border-white/5 flex items-start gap-2">
                                        <Database size={16} className="text-emerald-500 mt-0.5" />
                                        <span><strong>Tráfego Seguro:</strong> Toda a comunicação entre seu dispositivo e nossos servidores é criptografada via HTTPS (SSL/TLS).</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                                <Film size={18} className="text-pink-500"/> 
                                4. Conteúdo e Direitos Autorais
                            </h4>
                            <div className="pl-4 border-l-2 border-pink-500/20">
                                <p className="mb-2">
                                    O CineSorte opera como um catálogo de organização pessoal e rede social:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 marker:text-pink-500">
                                    <li><strong>Não hospedamos vídeos:</strong> Não é possível assistir filmes ou séries na plataforma. Não armazenamos arquivos protegidos por direitos autorais.</li>
                                    <li><strong>Fonte de Dados:</strong> Sinopses, imagens e datas são consumidos em tempo real da API pública do TMDB (The Movie Database).</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-white font-bold text-base flex items-center gap-2 mb-3">
                                <UserCheck size={18} className="text-blue-400"/> 
                                5. Privacidade e Uso de Dados
                            </h4>
                            <div className="pl-4 border-l-2 border-blue-500/20">
                                <p>
                                    Seus dados são utilizados exclusivamente para o funcionamento das features do site:
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-blue-500">
                                    <li>Criação de perfil público e interação social (seguidores/seguindo).</li>
                                    <li>Algoritmo de recomendação baseado nos seus gostos.</li>
                                    <li>Gamificação (Cálculo de nível baseado em atividades).</li>
                                </ul>
                                <p className="mt-2 text-blue-200/80 italic">
                                    Garantimos que seus dados <strong>jamais</strong> serão vendidos para terceiros ou utilizados para fins publicitários.
                                </p>
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
                                Recusar e Sair
                            </button>
                            <button 
                                onClick={acceptTerms}
                                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-violet-900/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                            >
                                Li, Entendi e Concordo
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white rounded-xl font-bold transition-all"
                        >
                            Fechar Aviso
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}