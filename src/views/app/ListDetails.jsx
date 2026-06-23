import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Copy,
  Film,
  Layers3,
  Search,
  User,
  X,
} from "lucide-react";
import { cloneList, getListDetails } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import MediaCard from "../../components/ui/MediaCard";

const getTitle = (item) => item.title || item.name || "Sem título";
const getType = (item) => item.media_type || (item.first_air_date ? "tv" : "movie");

export default function ListDetails() {
  const { username, listId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (!username || !listId) return;
      try {
        const data = await getListDetails(username, listId);
        setList(data);
      } catch {
        toastRef.current.error("Erro", "Não foi possível carregar a lista.");
        navigate("/app/feed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username, listId, navigate]);

  const handleClone = async () => {
    if (!user) return toast.error("Login necessário", "Entre para salvar a lista.");
    if (user.username === username) return toast.error("Ops", "Você já é o dono desta lista.");

    setCloning(true);
    try {
      await cloneList({
        originalListId: list.id,
        ownerUsername: list.owner?.username,
      });
      toast.success("Lista salva", "A coleção foi adicionada à sua biblioteca.");
      navigate("/app/lists");
    } catch (error) {
      toast.error("Erro", error.response?.data?.message || "Falha ao salvar a lista.");
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#08080b] animate-in fade-in duration-500">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Abrindo coleção</p>
      </div>
    );
  }

  if (!list) return null;

  const items = list.items || [];
  const heroImage = items.find((item) => item.backdrop_path)?.backdrop_path;
  const posterPreview = items.filter((item) => item.poster_path).slice(0, 3);
  const ownerName = list.clonedFrom?.owner || list.owner?.username || username;
  const isOwner = user?.username === username;
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const visibleItems = items.filter((item) => {
    const matchesType = filter === "all" || getType(item) === filter;
    const matchesQuery = !normalizedQuery || getTitle(item).toLocaleLowerCase("pt-BR").includes(normalizedQuery);
    return matchesType && matchesQuery;
  });
  const moviesCount = items.filter((item) => getType(item) === "movie").length;
  const seriesCount = items.filter((item) => getType(item) === "tv").length;
  const formattedDate = list.updatedAt
    ? new Date(list.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#08080b] pb-24 text-white animate-in fade-in duration-500">
      <section className="relative min-h-[480px] overflow-hidden border-b border-white/[0.06] md:min-h-[520px]">
        <div className="absolute inset-0 bg-[#0b0b0f]">
          {heroImage && (
            <img
              src={`https://image.tmdb.org/t/p/original${heroImage}`}
              alt=""
              className="h-full w-full object-cover opacity-35"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#08080b_0%,rgba(8,8,11,0.92)_38%,rgba(8,8,11,0.28)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-transparent to-black/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.12),transparent_32%)]" />

        <div className="relative z-10 mx-auto flex min-h-[480px] max-w-[1600px] flex-col justify-between px-4 py-6 sm:px-6 md:min-h-[520px] md:px-10 md:py-8 xl:px-14">
          <Link
            to="/app/lists"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.09] bg-black/25 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.13em] text-zinc-300 backdrop-blur-xl transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={14} /> Minhas listas
          </Link>

          <div className="flex items-end justify-between gap-10 pb-5 md:pb-8">
            <div className="max-w-4xl">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300 backdrop-blur-xl">
                  <Layers3 size={12} /> Coleção
                </span>
                {list.clonedFrom && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-zinc-400 backdrop-blur-xl">
                    <Copy size={11} /> Lista salva
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl break-words text-3xl font-black leading-[1.04] tracking-[-0.045em] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
                {list.name}
              </h1>
              {list.description && (
                <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-zinc-300/85 md:text-base md:leading-7">
                  {list.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3 text-[10px] font-bold text-zinc-400">
                <Link
                  to={`/app/profile/${ownerName}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-black/25 py-2 pl-2 pr-3.5 backdrop-blur-xl transition-colors hover:bg-white/[0.07] hover:text-white"
                >
                  <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-white/[0.08] text-[10px] font-black text-white">
                    {!list.clonedFrom && list.owner?.photoURL ? (
                      <img src={list.owner.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      ownerName?.[0]?.toUpperCase() || <User size={13} />
                    )}
                  </span>
                  @{ownerName}
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/25 px-3.5 py-2.5 backdrop-blur-xl">
                  <Film size={13} /> {items.length} {items.length === 1 ? "título" : "títulos"}
                </span>
                {formattedDate && (
                  <span className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-black/25 px-3.5 py-2.5 backdrop-blur-xl sm:inline-flex">
                    <Calendar size={13} /> {formattedDate}
                  </span>
                )}
              </div>

              {!isOwner && (
                <button
                  type="button"
                  onClick={handleClone}
                  disabled={cloning}
                  className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.13em] text-black transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Copy size={15} /> {cloning ? "Salvando..." : "Salvar na minha biblioteca"}
                </button>
              )}
            </div>

            {posterPreview.length > 0 && (
              <div className="relative mr-10 hidden h-64 w-60 shrink-0 lg:block xl:mr-20">
                {posterPreview.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="absolute bottom-0 right-0 aspect-[2/3] w-32 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-[0_25px_50px_rgba(0,0,0,0.55)]"
                    style={{
                      transform: `translateX(${index * 42}px) translateY(${index * -4}px) rotate(${(index - 1) * 4}deg)`,
                      zIndex: 3 - index,
                    }}
                  >
                    <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1600px] px-4 pt-7 sm:px-6 md:px-10 md:pt-10 xl:px-14">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.06] pb-6 lg:flex-row lg:items-end">
          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-400">Dentro da lista</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">Todos os títulos</h2>
          </div>

          {items.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.025] p-1">
                {[
                  ["all", `Todos ${items.length}`],
                  ["movie", `Filmes ${moviesCount}`],
                  ["tv", `Séries ${seriesCount}`],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] transition-colors ${
                      filter === value ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="relative block min-w-0 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar nesta lista"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] py-3 pl-10 pr-10 text-xs text-white outline-none transition-colors placeholder:text-zinc-700 focus:border-violet-400/35"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            </div>
          )}
        </div>

        {visibleItems.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {visibleItems.map((item) => (
              <MediaCard key={`${getType(item)}-${item.id}`} media={item} />
            ))}
          </div>
        ) : (
          <div className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/[0.09] bg-white/[0.015] px-6 text-center">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-zinc-600">
              {items.length === 0 ? <Film size={25} /> : <Search size={23} />}
            </div>
            <h3 className="text-lg font-black text-white">
              {items.length === 0 ? "Esta lista ainda está vazia" : "Nenhum título encontrado"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">
              {items.length === 0
                ? "Os filmes e séries adicionados aparecerão organizados aqui."
                : "Tente outro nome ou altere o filtro selecionado."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
