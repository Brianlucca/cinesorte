import { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Play, ShieldCheck, VolumeX, X } from 'lucide-react';
import { getLatestTrailers } from '@shared/api/api';

const FALLBACK_FEATURE = {
  id: 'cinesorte-feature',
  title: 'Histórias para viver e compartilhar',
  overview: 'Descubra novos títulos, registre o que assistiu e encontre pessoas que amam as mesmas histórias.',
  backdrop_path: '/6UH52Fmau8RPsMAbQbjwN3wJSCj.jpg',
};

function CinematicShowcase() {
  const [features, setFeatures] = useState([FALLBACK_FEATURE]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    setAllowMotion(!reducedMotion && !saveData && window.innerWidth >= 1024);

    let active = true;
    getLatestTrailers()
      .then((items) => {
        if (!active) return;
        const available = (Array.isArray(items) ? items : [])
          .filter((item) => item?.backdrop_path && item?.trailerKey)
          .slice(0, 4);
        if (available.length) setFeatures(available);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!allowMotion || features.length < 2) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % features.length),
      18000,
    );
    return () => window.clearInterval(timer);
  }, [allowMotion, features.length]);

  useEffect(() => setVideoReady(false), [activeIndex]);

  const feature = features[activeIndex] || features[0];
  const title = feature?.title || feature?.name || FALLBACK_FEATURE.title;
  const backdrop = useMemo(
    () => `https://image.tmdb.org/t/p/original${feature?.backdrop_path || FALLBACK_FEATURE.backdrop_path}`,
    [feature?.backdrop_path],
  );
  const trailerKey = allowMotion ? feature?.trailerKey : null;

  return (
    <aside className="relative hidden min-h-[760px] overflow-hidden bg-black lg:block">
      <img
        src={backdrop}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      />
      {trailerKey && (
        <iframe
          key={trailerKey}
          src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3`}
          title={`Trailer de ${title}`}
          allow="autoplay; encrypted-media"
          onLoad={() => setVideoReady(true)}
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[232%] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
          tabIndex="-1"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,11,0.12)_0%,rgba(8,8,11,0.03)_54%,rgba(24,26,32,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#111216_0%,rgba(17,18,22,0.88)_18%,rgba(17,18,22,0.16)_58%,rgba(17,18,22,0.2)_100%)]" />

      <div className="absolute inset-x-0 bottom-0 z-10 p-10 xl:p-12">
        <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
          <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
            {trailerKey ? <VolumeX size={13} /> : <Play size={13} fill="currentColor" />}
            {trailerKey ? 'Trailer em reprodução' : 'Seleção CineSorte'}
          </span>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">Em destaque agora</p>
        <h2 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white xl:text-5xl">{title}</h2>
        <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-300 line-clamp-3">{feature?.overview || FALLBACK_FEATURE.overview}</p>
        <div className="mt-6 flex gap-2" aria-label="Selecionar destaque">
          {features.map((item, index) => (
            <button
              key={`${item.id || item.trailerKey}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1 rounded-full transition-all ${index === activeIndex ? 'w-10 bg-white' : 'w-5 bg-white/25 hover:bg-white/45'}`}
              aria-label={`Exibir destaque ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  onHelp,
  modal = false,
  onClose,
}) {
  useEffect(() => {
    if (!modal) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [modal, onClose]);

  if (modal) {
    return (
      <div
        className="fixed inset-0 z-[90000] overflow-y-auto bg-black/75 px-3 py-4 text-white backdrop-blur-md sm:px-5 sm:py-8"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose?.();
        }}
      >
        <div
          className="flex min-h-full items-center justify-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <section className="relative my-auto w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#181a20] shadow-[0_32px_120px_rgba(0,0,0,0.72)]">
            <div className="pointer-events-none absolute -right-28 -top-32 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-fuchsia-500/[0.05] blur-3xl" />

            <div className="relative flex items-center justify-between px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
              <div className="flex items-center gap-3" aria-label="CineSorte">
                <span className="grid h-10 w-10 shrink-0 place-items-center">
                  <img src="/icons/cinesorte-transparent.png" alt="" className="h-10 w-10 object-contain" />
                </span>
                <span className="text-xl font-semibold tracking-[-0.04em] text-white">
                  Cine<span className="text-violet-400">Sorte</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
                aria-label="Fechar"
              >
                <X size={19} />
              </button>
            </div>

            <div className="relative max-h-[calc(100svh-8rem)] overflow-y-auto px-5 pb-6 pt-3 sm:px-8 sm:pb-8">
              <div className="mx-auto w-full max-w-[500px]">
                <div className="mb-7 text-left">
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                    {eyebrow}
                  </div>
                  <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-[460px] text-sm leading-6 text-zinc-400">{description}</p>
                </div>

                <div>{children}</div>
                <div className="mt-5">{footer}</div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                  <button type="button" onClick={onHelp} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-white">
                    <HelpCircle size={16} /> Preciso de ajuda
                  </button>
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                    <ShieldCheck size={13} /> Acesso protegido
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111216] p-3 text-white sm:p-5 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1480px] items-center justify-center sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)]">
        <div className="grid w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#181a20] lg:min-h-[760px] lg:grid-cols-[minmax(0,1.25fr)_minmax(470px,0.75fr)]">
          <CinematicShowcase />

          <section className="flex min-h-[calc(100vh-1.5rem)] items-center justify-center bg-[#181a20] px-5 py-8 sm:min-h-[calc(100vh-2.5rem)] sm:px-10 lg:min-h-[760px] lg:border-l lg:border-white/[0.06] lg:px-12 xl:px-16">
            <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="mb-9 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3" aria-label="CineSorte">
                  <span className="grid h-10 w-10 shrink-0 place-items-center">
                    <img src="/icons/cinesorte-transparent.png" alt="" className="h-10 w-10 object-contain" />
                  </span>
                  <span className="text-xl font-semibold tracking-[-0.04em] text-white">
                    Cine<span className="text-violet-400">Sorte</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onHelp}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
                  aria-label="Preciso de ajuda"
                >
                  <HelpCircle size={18} />
                </button>
              </div>

              <div className="mb-7 text-left">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                  {eyebrow}
                </div>
                <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-[390px] text-sm leading-6 text-zinc-400">{description}</p>
              </div>

              <div>{children}</div>

              <div className="mt-5">{footer}</div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                <button
                  type="button"
                  onClick={onHelp}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 transition-colors hover:text-white"
                >
                  <HelpCircle size={16} />
                  Preciso de ajuda
                </button>

                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                  <ShieldCheck size={13} />
                  Acesso protegido
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
