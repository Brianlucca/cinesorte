import { Film, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@shared/context/useAuth";

const currentYear = new Date().getFullYear();

export default function SiteFooter() {
  const { user } = useAuth();

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#111216]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_68%)]" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-6 md:px-10 md:py-12 xl:px-12">
        <div className="flex flex-col gap-9 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="CineSorte — Início">
              <img
                src="/icons/cinesorte-transparent.png"
                alt=""
                className="h-11 w-11 object-contain"
              />
              <span className="text-xl font-semibold tracking-[-0.035em] text-white">
                Cine<span className="text-violet-400">Sorte</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              Descubra histórias, organize o que quer assistir e compartilhe sua experiência com quem também ama cinema.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:flex sm:flex-wrap sm:justify-end sm:gap-x-6">
            <Link to="/" className="font-medium text-zinc-400 transition-colors hover:text-white">
              Início
            </Link>
            <Link to="/app/roulette" className="font-medium text-zinc-400 transition-colors hover:text-white">
              Roleta
            </Link>
            {user && (
              <>
                <Link to="/app/lists" className="font-medium text-zinc-400 transition-colors hover:text-white">
                  Minhas listas
                </Link>
                <Link to="/app/settings" className="font-medium text-zinc-400 transition-colors hover:text-white">
                  Configurações
                </Link>
              </>
            )}
            <Link to="/privacidade" className="font-medium text-zinc-400 transition-colors hover:text-white">
              Privacidade
            </Link>
            <Link to="/termos" className="font-medium text-zinc-400 transition-colors hover:text-white">
              Termos
            </Link>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-4 border-t border-white/[0.06] pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2">
            <Film size={13} className="text-violet-400/70" />
            © {currentYear} CineSorte. Todos os direitos reservados.
          </p>
          <a
            href="https://www.linkedin.com/in/brian-lucca-cardozo/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-medium text-zinc-400 transition-colors hover:text-violet-300"
          >
            Desenvolvido por Brian Lucca
            <Linkedin size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
