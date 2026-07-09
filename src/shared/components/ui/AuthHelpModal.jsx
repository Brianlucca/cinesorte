import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, HelpCircle, KeyRound, LogIn, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import Modal from '@shared/components/ui/Modal';

const faqs = [
  {
    icon: Mail,
    question: 'Não recebi o email de confirmação. O que faço?',
    answer: 'Confira a pasta de spam, lixo eletrônico e promoções. Veja também se o email digitado está correto. Se ainda não aparecer, volte para a tela de confirmação e clique em reenviar email.',
    actionLabel: 'Ir para confirmação de email',
    actionTo: '/verify-email',
  },
  {
    icon: RefreshCw,
    question: 'O link expirou ou já foi usado?',
    answer: 'Solicite um novo envio pela tela de confirmação e abra apenas o email mais recente recebido. Links antigos podem deixar de funcionar depois de um novo envio.',
  },
  {
    icon: LogIn,
    question: 'Por que não consigo entrar depois do cadastro?',
    answer: 'Contas criadas com email e senha só liberam o login depois que o link de confirmação é aberto no navegador.',
  },
  {
    icon: KeyRound,
    question: 'Esqueci minha senha. Como recupero?',
    answer: 'Na tela de login, clique em "Esqueci minha senha" e informe seu email para receber um link seguro de redefinição.',
  },
  {
    icon: ShieldCheck,
    question: 'A verificação de segurança falhou. E agora?',
    answer: 'Atualize a página, aguarde alguns segundos e tente novamente. Bloqueadores, extensões de privacidade ou VPNs podem atrapalhar a verificação.',
  },
];

export default function AuthHelpModal({ isOpen, onClose }) {
  const location = useLocation();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajuda da conta" size="lg">
      <div className="space-y-5">
        <div className="rounded-2xl border border-white/5 bg-black/25 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">Perguntas frequentes</h4>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                Encontre respostas rápidas para problemas comuns de cadastro, login e confirmação de email.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/60">
          {faqs.map((item, index) => {
            const FaqIcon = item.icon;
            const isOpenItem = openIndex === index;

            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpenItem ? -1 : index)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                  aria-expanded={isOpenItem}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-violet-300">
                    <FaqIcon size={18} />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-100">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-zinc-500 transition-transform ${isOpenItem ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpenItem && (
                  <div className="space-y-4 px-5 pb-5 pl-[4.5rem] pr-6">
                    <p className="text-sm leading-relaxed text-zinc-400">{item.answer}</p>
                    {item.actionTo && (
                      <Link
                        to={`${item.actionTo}${location.search}`}
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition-colors hover:bg-violet-500/20 hover:text-white"
                      >
                        {item.actionLabel}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-300">Contato</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            Se ainda precisar de ajuda, envie uma mensagem para{' '}
            <a href="mailto:cinesorte@gmail.com" className="font-semibold text-white hover:text-emerald-300">
              cinesorte@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </Modal>
  );
}
