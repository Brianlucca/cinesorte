import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const CREDITS_PER_PAGE = 18;

function getCreditDate(credit) {
  return credit.release_date || credit.first_air_date || "";
}

function getCreditType(credit) {
  return credit.media_type || (credit.title ? "movie" : "tv");
}

function FilmographyCredit({ credit }) {
  const type = getCreditType(credit);
  const title = credit.title || credit.name || "Título sem nome";

  return (
    <Link
      to={`/app/${type}/${credit.id}`}
      className="group block min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.018] px-3 py-2.5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <h4 className="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-violet-200">
        {title}
      </h4>
      <p
        className="mt-1 truncate text-xs text-zinc-500"
        title={credit.character || "Papel não informado"}
      >
        {credit.character || "Papel não informado"}
      </p>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-6 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-4"
      aria-label="Paginação da filmografia"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/[0.07] px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40 sm:gap-1.5 sm:px-3"
      >
        <ChevronLeft size={15} />
        Anterior
      </button>
      <span className="text-center text-xs tabular-nums text-zinc-500" aria-live="polite">
        Página {currentPage} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-white/[0.07] px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40 sm:gap-1.5 sm:px-3"
      >
        Próxima
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}

export default function PersonFilmography({ credits }) {
  const [currentPage, setCurrentPage] = useState(1);
  const uniqueCredits = new Map();

  (credits?.cast || []).forEach((credit) => {
    if (!credit?.id) return;
    const type = getCreditType(credit);
    const key = `${type}-${credit.id}`;
    if (!uniqueCredits.has(key)) uniqueCredits.set(key, { ...credit, media_type: type });
  });

  const sortedCredits = Array.from(uniqueCredits.values()).sort((a, b) => {
    const dateA = getCreditDate(a);
    const dateB = getCreditDate(b);
    if (!dateA && dateB) return 1;
    if (dateA && !dateB) return -1;
    const dateDifference = dateB.localeCompare(dateA);
    if (dateDifference !== 0) return dateDifference;
    return (b.vote_count || 0) - (a.vote_count || 0);
  });

  const totalPages = Math.ceil(sortedCredits.length / CREDITS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const pageCredits = sortedCredits.slice(
    (page - 1) * CREDITS_PER_PAGE,
    page * CREDITS_PER_PAGE,
  );
  const years = new Map();

  pageCredits.forEach((credit) => {
    const date = getCreditDate(credit);
    const year = date ? date.slice(0, 4) : "Data não informada";
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(credit);
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [credits]);

  if (sortedCredits.length === 0) return null;

  return (
    <section id="person-filmography" aria-labelledby="person-filmography-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
            Carreira completa
          </span>
          <h2
            id="person-filmography-title"
            className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-white md:text-2xl"
          >
            Filmografia
          </h2>
        </div>
        <span className="text-xs font-medium text-zinc-500">
          {sortedCredits.length} {sortedCredits.length === 1 ? "trabalho" : "trabalhos"}
        </span>
      </div>

      <ol className="space-y-6">
        {Array.from(years, ([year, yearCredits]) => (
          <li key={year} className="min-w-0">
            <div className="mb-3 flex items-baseline gap-2 border-l border-violet-300/50 pl-3">
              <h3 className="text-sm font-medium text-zinc-300">{year}</h3>
              <span className="text-[10px] text-zinc-600">
                {yearCredits.length} {yearCredits.length === 1 ? "título" : "títulos"}
              </span>
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {yearCredits.map((credit) => (
                <FilmographyCredit
                  key={`${credit.media_type}-${credit.id}`}
                  credit={credit}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
