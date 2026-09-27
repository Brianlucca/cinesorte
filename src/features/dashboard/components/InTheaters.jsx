import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
} from "lucide-react";

const IBGE_API = "https://servicodados.ibge.gov.br/api/v1/localidades";
const LOCATION_STORAGE_KEY = "cinesorte_cinema_location_v1";

function toIngressoSlug(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readSavedLocation() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_STORAGE_KEY));
    return {
      stateId: String(saved?.stateId || ""),
      stateName: saved?.stateName || "",
      stateUf: saved?.stateUf || "",
      cityId: String(saved?.cityId || ""),
      cityName: saved?.cityName || "",
    };
  } catch {
    return { stateId: "", stateName: "", stateUf: "", cityId: "", cityName: "" };
  }
}

function SelectField({ label, value, onChange, disabled, children }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.03] pl-3 pr-8 text-xs font-medium text-zinc-300 outline-none transition hover:border-white/15 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
      />
    </label>
  );
}

export default function InTheaters({ items = [] }) {
  const railRef = useRef(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [location, setLocation] = useState(readSavedLocation);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [locationError, setLocationError] = useState("");

  const visibleItems = useMemo(
    () => items.filter((item) => item?.id && (item.backdrop_path || item.poster_path)).slice(0, 16),
    [items],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${IBGE_API}/estados?orderBy=nome`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("states-request-failed");
        return response.json();
      })
      .then((result) => {
        setStates(Array.isArray(result) ? result : []);
        setLocationError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLocationError("Não foi possível carregar as cidades agora.");
      })
      .finally(() => setLoadingStates(false));

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!location.stateId) {
      setCities([]);
      return undefined;
    }

    const controller = new AbortController();
    setLoadingCities(true);

    fetch(`${IBGE_API}/estados/${location.stateId}/municipios?orderBy=nome`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("cities-request-failed");
        return response.json();
      })
      .then((result) => {
        setCities(Array.isArray(result) ? result : []);
        setLocationError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setLocationError("Não foi possível carregar as cidades agora.");
      })
      .finally(() => setLoadingCities(false));

    return () => controller.abort();
  }, [location.stateId]);

  const handleStateChange = (event) => {
    const state = states.find((candidate) => String(candidate.id) === event.target.value);
    const nextLocation = {
      stateId: state ? String(state.id) : "",
      stateName: state?.nome || "",
      stateUf: state?.sigla || "",
      cityId: "",
      cityName: "",
    };
    setLocation(nextLocation);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
  };

  const handleCityChange = (event) => {
    const city = cities.find((candidate) => String(candidate.id) === event.target.value);
    const nextLocation = {
      ...location,
      cityId: city ? String(city.id) : "",
      cityName: city?.nome || "",
    };
    setLocation(nextLocation);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
  };

  const slide = (direction) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({
      left: (direction === "left" ? -1 : 1) * railRef.current.clientWidth * 0.78,
      behavior: "smooth",
    });
  };

  if (visibleItems.length === 0) return null;

  return (
    <section className="relative overflow-hidden">
      <div className="flex flex-col gap-3 px-5 sm:px-6 md:flex-row md:items-end md:justify-between md:px-10 xl:px-14 2xl:px-16">
          <div>
            <span className="mb-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300/75">
              <MapPin size={12} /> Perto de você
            </span>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-100 sm:text-xl md:text-2xl">
              {location.cityName ? `Nos cinemas em ${location.cityName}` : "Nos cinemas"}
            </h2>
          </div>

        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div className="order-2 flex w-full min-w-0 flex-1 gap-2 sm:order-none sm:w-[360px] sm:flex-none">
            <SelectField
              label="Estado"
              value={location.stateId}
              onChange={handleStateChange}
              disabled={loadingStates}
            >
              <option value="">{loadingStates ? "Carregando estados..." : "Escolha o estado"}</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>{state.nome}</option>
              ))}
            </SelectField>
            <SelectField
              label="Cidade"
              value={location.cityId}
              onChange={handleCityChange}
              disabled={!location.stateId || loadingCities}
            >
              <option value="">
                {loadingCities ? "Carregando cidades..." : "Escolha a cidade"}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.nome}</option>
              ))}
            </SelectField>
          </div>
          <div className="order-1 flex shrink-0 gap-2 sm:hidden">
            <button type="button" onClick={() => slide("left")} aria-label="Voltar filmes em cartaz" className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => slide("right")} aria-label="Avançar filmes em cartaz" className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="hidden shrink-0 gap-1.5 sm:flex">
            <button type="button" onClick={() => slide("left")} aria-label="Voltar filmes em cartaz" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => slide("right")} aria-label="Avançar filmes em cartaz" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {locationError && <p className="px-5 pt-2 text-xs text-rose-300 sm:px-6 md:px-10 xl:px-14 2xl:px-16">{locationError}</p>}

        <div ref={railRef} className="flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-1 pt-4 scroll-smooth scrollbar-hide md:snap-none md:scroll-px-10 md:px-10 xl:scroll-px-14 xl:px-14 2xl:scroll-px-16 2xl:px-16" style={{ scrollbarWidth: "none" }}>
          {visibleItems.map((item) => {
            const title = item.title || item.name;
            const imagePath = item.backdrop_path || item.poster_path;
            const movieSlug = toIngressoSlug(title);
            const citySlug = toIngressoSlug(location.cityName);
            const ingressoQuery = new URLSearchParams({
              partnership: "home",
              target: "em-cartaz",
            });
            if (citySlug) ingressoQuery.set("city", citySlug);
            const sessionsUrl = `https://www.ingresso.com/filme/${movieSlug}?${ingressoQuery.toString()}`;

            return (
              <article key={item.id} className="w-[210px] flex-none snap-start overflow-hidden rounded-xl bg-white/[0.025] sm:w-[230px] md:w-[250px]">
                <Link to={`/app/movie/${item.id}`} className="group relative block aspect-[16/9] overflow-hidden">
                  <img src={`https://image.tmdb.org/t/p/w780${imagePath}`} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white">{title}</h3>
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-yellow-300">
                      <Star size={10} fill="currentColor" /> {Number(item.vote_average || 0).toFixed(1)}
                    </span>
                  </div>
                </Link>
                <a href={sessionsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between px-3 py-2.5 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">
                  Buscar sessões
                  <ArrowUpRight size={13} className="text-violet-300/80" />
                </a>
              </article>
            );
          })}
          <div className="w-1 flex-none" aria-hidden="true" />
        </div>
      <p className="px-5 pt-2 text-[10px] text-zinc-600 sm:px-6 md:px-10 xl:px-14 2xl:px-16">
        Cartaz nacional. Sessões e valores variam conforme o cinema.
      </p>
    </section>
  );
}
