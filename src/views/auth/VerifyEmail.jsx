import { Mail, ArrowRight, CheckCircle2, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VerifyEmail() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                    <Film className="w-6 h-6 text-violet-500" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">CineSorte</span>
            </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                <div className="relative w-20 h-20 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner group">
                    <Mail className="w-10 h-10 text-zinc-400 group-hover:text-violet-400 transition-colors duration-500" />
                    <div className="absolute -top-2 -right-2 bg-zinc-900 rounded-full p-1 border border-zinc-800">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Verifique seu Email</h2>
            
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Enviamos um link de confirmação para sua caixa de entrada. Clique no link para ativar sua conta e acessar a plataforma.
            </p>

            <div className="w-full space-y-4">
                <Link 
                    to="/login"
                    className="w-full group flex items-center justify-center gap-2 py-4 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg shadow-white/5 active:scale-[0.99]"
                >
                    Voltar para Login
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="pt-4 border-t border-white/5 w-full">
                    <p className="text-xs text-zinc-500">
                        Não recebeu o email? <br/>
                        <span className="text-zinc-400">Verifique sua pasta de Spam ou Lixo Eletrônico.</span>
                    </p>
                </div>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-xs text-zinc-600 font-medium">
            &copy; 2026 CineSorte Inc.
        </p>
      </div>
    </div>
  );
}