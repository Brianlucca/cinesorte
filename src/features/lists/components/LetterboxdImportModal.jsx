import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  FileArchive,
  LoaderCircle,
  Search,
  Upload,
} from "lucide-react";
import Modal from "@shared/components/ui/Modal";
import {
  addMediaToList,
  createOrUpdateList,
  getTmdbSearch,
} from "@shared/api/api";
import { useToast } from "@shared/context/useToast";
import {
  getUniqueTitleCount,
  LETTERBOXD_IMPORT_LIMIT,
  normalizeLetterboxdTitle,
  parseLetterboxdExport,
  pickBestTmdbMatch,
} from "@features/lists/lib/letterboxdImport";

const sourceKey = (item) => `${normalizeLetterboxdTitle(item.title)}:${item.year}`;

const initialProgress = { current: 0, total: 0 };

export default function LetterboxdImportModal({ isOpen, onClose, onImported, existingLists = [] }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [stage, setStage] = useState("file");
  const [bundle, setBundle] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [resolvedLists, setResolvedLists] = useState([]);
  const [progress, setProgress] = useState(initialProgress);
  const [error, setError] = useState("");

  const selectedLists = useMemo(
    () => (bundle?.lists || []).filter((list) => selectedIds.has(list.id)),
    [bundle, selectedIds],
  );
  const selectedTitleCount = useMemo(
    () => getUniqueTitleCount(selectedLists),
    [selectedLists],
  );
  const importableCount = resolvedLists.reduce(
    (total, list) => total + list.matchedItems.length,
    0,
  );
  const unmatchedCount = resolvedLists.reduce(
    (total, list) => total + list.unmatchedItems.length,
    0,
  );
  const isBusy = stage === "reading" || stage === "matching" || stage === "importing";

  const reset = () => {
    setStage("file");
    setBundle(null);
    setSelectedIds(new Set());
    setResolvedLists([]);
    setProgress(initialProgress);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const close = () => {
    if (isBusy) return;
    reset();
    onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;
    setStage("reading");
    setError("");

    try {
      const parsed = await parseLetterboxdExport(file);
      let runningTotal = 0;
      const initiallySelected = new Set();

      parsed.lists.forEach((list, index) => {
        const nextTotal = getUniqueTitleCount(
          parsed.lists.filter((candidate) => initiallySelected.has(candidate.id)).concat(list),
        );
        if (nextTotal <= LETTERBOXD_IMPORT_LIMIT || index === 0) {
          initiallySelected.add(list.id);
          runningTotal = nextTotal;
        }
      });

      setBundle(parsed);
      setSelectedIds(initiallySelected);
      setStage("select");
      if (runningTotal > LETTERBOXD_IMPORT_LIMIT) {
        setError(`A primeira lista possui mais de ${LETTERBOXD_IMPORT_LIMIT} títulos. Use um CSV menor para importá-la em lotes.`);
      }
    } catch (fileError) {
      setError(fileError.message || "Não foi possível analisar o arquivo.");
      setStage("file");
    }
  };

  const toggleList = (listId) => {
    setError("");
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(listId)) next.delete(listId);
      else next.add(listId);
      return next;
    });
  };

  const prepareImport = async () => {
    if (selectedLists.length === 0) {
      setError("Selecione pelo menos uma lista.");
      return;
    }
    if (selectedTitleCount > LETTERBOXD_IMPORT_LIMIT) {
      setError(`Selecione no máximo ${LETTERBOXD_IMPORT_LIMIT} títulos únicos por lote.`);
      return;
    }

    setError("");
    setStage("matching");

    const uniqueSources = new Map();
    selectedLists.forEach((list) => {
      list.items.forEach((item) => {
        const key = sourceKey(item);
        if (!uniqueSources.has(key)) uniqueSources.set(key, item);
      });
    });

    const sources = [...uniqueSources.entries()];
    const matches = new Map();
    let cursor = 0;
    let completed = 0;
    setProgress({ current: 0, total: sources.length });

    const worker = async () => {
      while (cursor < sources.length) {
        const currentIndex = cursor;
        cursor += 1;
        const [key, source] = sources[currentIndex];

        try {
          const results = await getTmdbSearch(source.title);
          let match = pickBestTmdbMatch(source, results);

          if (!match) {
            const englishResults = await getTmdbSearch(source.title, "en-US");
            match = pickBestTmdbMatch(source, englishResults);
          }

          matches.set(key, match);
        } catch {
          matches.set(key, null);
        } finally {
          completed += 1;
          setProgress({ current: completed, total: sources.length });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(4, sources.length) }, worker));

    setResolvedLists(selectedLists.map((list) => {
      const matchedItems = [];
      const unmatchedItems = [];
      list.items.forEach((item) => {
        const match = matches.get(sourceKey(item));
        if (match) matchedItems.push({ source: item, media: match });
        else unmatchedItems.push(item);
      });
      return { ...list, matchedItems, unmatchedItems };
    }));
    setStage("review");
  };

  const importLists = async () => {
    const listsToImport = resolvedLists.filter((list) => list.matchedItems.length > 0);
    if (listsToImport.length === 0) {
      setError("Nenhum título pôde ser importado.");
      return;
    }

    const importPlans = listsToImport.map((list) => {
      const existingList = existingLists.find(
        (candidate) => candidate.name.trim().toLocaleLowerCase("pt-BR") === list.name.trim().toLocaleLowerCase("pt-BR"),
      );
      const existingMediaIds = new Set(
        (existingList?.items || []).map((item) => String(item.id)),
      );
      const itemsToAdd = list.matchedItems.filter(
        ({ media }) => !existingMediaIds.has(String(media.id)),
      );
      return { list, existingList, itemsToAdd };
    });

    const totalOperations = importPlans.reduce(
      (total, plan) => total + plan.itemsToAdd.length + 1,
      0,
    );
    let completed = 0;
    setProgress({ current: 0, total: totalOperations });
    setStage("importing");
    setError("");

    try {
      for (const { list, existingList, itemsToAdd } of importPlans) {
        const response = await createOrUpdateList({
          listId: existingList?.id,
          listName: list.name.slice(0, 60),
          description: `Importada do Letterboxd · ${list.matchedItems.length} de ${list.items.length} títulos identificados.`,
          isPublic: existingList?.isPublic ?? true,
        });
        const listId = response?.listId || response?.data?.listId;
        if (!listId) throw new Error(`Não foi possível criar a lista ${list.name}.`);

        completed += 1;
        setProgress({ current: completed, total: totalOperations });

        for (const { media } of itemsToAdd) {
          await addMediaToList(listId, media);
          completed += 1;
          setProgress({ current: completed, total: totalOperations });
        }
      }

      await onImported?.();
      setStage("done");
      toast.success(
        "Importação concluída",
        `${importableCount} ${importableCount === 1 ? "título foi importado" : "títulos foram importados"}.`,
      );
    } catch (importError) {
      await onImported?.();
      setError(importError.message || "A importação foi interrompida. Os itens já concluídos foram mantidos.");
      setStage("review");
    }
  };

  const progressPercentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Importar do Letterboxd"
      size="lg"
      appearance="cinematic"
    >
      <div className="space-y-5">
        {stage === "file" && (
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex w-full flex-col items-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.018] px-6 py-12 text-center transition-colors hover:border-violet-400/35 hover:bg-violet-500/[0.045]"
            >
              <span className="grid h-14 w-14 place-items-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                <FileArchive size={26} />
              </span>
              <span className="mt-5 text-base font-semibold text-white">Selecione o export do Letterboxd</span>
              <span className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Aceitamos o arquivo ZIP completo gerado nas configurações do Letterboxd ou um CSV individual de lista.
              </span>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors group-hover:bg-violet-100">
                <Upload size={14} /> Escolher arquivo
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.csv,text/csv,application/zip"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <p className="mt-4 text-center text-xs text-zinc-600">
              O arquivo é processado localmente; apenas os títulos confirmados são enviados ao CineSorte.
            </p>
          </div>
        )}

        {stage === "select" && bundle && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
              <FileArchive size={19} className="mt-0.5 shrink-0 text-violet-300" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{bundle.fileName}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {bundle.lists.length} {bundle.lists.length === 1 ? "lista compatível encontrada" : "listas compatíveis encontradas"}.
                </p>
              </div>
              <button type="button" onClick={reset} className="ml-auto text-xs font-semibold text-zinc-500 hover:text-white">
                Trocar
              </button>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Escolha as listas</h4>
                  <p className="mt-1 text-xs text-zinc-500">Você pode repetir o processo para importar outros lotes.</p>
                </div>
                <span className={`text-xs font-semibold ${selectedTitleCount > LETTERBOXD_IMPORT_LIMIT ? "text-red-300" : "text-zinc-400"}`}>
                  {selectedTitleCount}/{LETTERBOXD_IMPORT_LIMIT} títulos únicos
                </span>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 content-scrollbar">
                {bundle.lists.map((list) => {
                  const selected = selectedIds.has(list.id);
                  return (
                    <button
                      type="button"
                      key={list.id}
                      onClick={() => toggleList(list.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                        selected
                          ? "border-violet-400/25 bg-violet-500/[0.08]"
                          : "border-white/[0.06] bg-white/[0.012] hover:bg-white/[0.035]"
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border ${selected ? "border-violet-300/40 bg-violet-500 text-white" : "border-white/10 text-transparent"}`}>
                        <Check size={14} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100">{list.name}</span>
                      <span className="shrink-0 text-xs text-zinc-500">{list.items.length} títulos</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
              <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-white/[0.04] hover:text-white">
                Cancelar
              </button>
              <button type="button" onClick={prepareImport} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-violet-100">
                <Search size={15} /> Localizar títulos
              </button>
            </div>
          </>
        )}

        {(stage === "reading" || stage === "matching" || stage === "importing") && (
          <div className="py-9 text-center">
            <LoaderCircle size={34} className="mx-auto animate-spin text-violet-400" />
            <h4 className="mt-5 text-base font-semibold text-white">
              {stage === "reading" && "Abrindo seu export"}
              {stage === "matching" && "Localizando títulos no catálogo"}
              {stage === "importing" && "Criando suas listas"}
            </h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              {stage === "reading" && "Estamos identificando a watchlist e as listas personalizadas."}
              {stage === "matching" && "Comparamos nome e ano para evitar associações incorretas."}
              {stage === "importing" && "A ordem original dos títulos será preservada."}
            </p>
            {stage !== "reading" && (
              <div className="mx-auto mt-6 max-w-md">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-violet-500 transition-[width] duration-300" style={{ width: `${progressPercentage}%` }} />
                </div>
                <p className="mt-2 text-xs tabular-nums text-zinc-600">{progress.current} de {progress.total}</p>
              </div>
            )}
          </div>
        )}

        {stage === "review" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.07] p-4">
                <CheckCircle2 size={19} className="text-emerald-300" />
                <p className="mt-3 text-2xl font-semibold text-white">{importableCount}</p>
                <p className="mt-1 text-xs text-emerald-200/65">títulos identificados</p>
              </div>
              <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.06] p-4">
                <AlertCircle size={19} className="text-amber-300" />
                <p className="mt-3 text-2xl font-semibold text-white">{unmatchedCount}</p>
                <p className="mt-1 text-xs text-amber-200/65">não encontrados e ignorados</p>
              </div>
            </div>

            <div className="max-h-72 space-y-3 overflow-y-auto pr-1 content-scrollbar">
              {resolvedLists.map((list) => (
                <div key={list.id} className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="truncate text-sm font-semibold text-white">{list.name}</h4>
                    <span className="shrink-0 text-xs text-zinc-500">{list.matchedItems.length}/{list.items.length}</span>
                  </div>
                  {list.unmatchedItems.length > 0 && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-600">
                      Não encontrados: {list.unmatchedItems.slice(0, 5).map((item) => item.title).join(", ")}
                      {list.unmatchedItems.length > 5 ? "…" : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
              <button type="button" onClick={() => setStage("select")} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-white/[0.04] hover:text-white">
                Voltar
              </button>
              <button type="button" onClick={importLists} disabled={importableCount === 0} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40">
                <Download size={15} /> Importar {importableCount} títulos
              </button>
            </div>
          </>
        )}

        {stage === "done" && (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-300/20 bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 size={30} />
            </span>
            <h4 className="mt-5 text-xl font-semibold text-white">Listas importadas</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              {importableCount} títulos foram adicionados às suas coleções na ordem original do Letterboxd.
            </p>
            <button type="button" onClick={close} className="mt-6 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-violet-100">
              Concluir
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-400/15 bg-red-500/[0.08] p-4 text-sm leading-6 text-red-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
