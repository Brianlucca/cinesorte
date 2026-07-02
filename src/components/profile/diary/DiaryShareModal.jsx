import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Loader2, X } from 'lucide-react';
import { createDiaryShareImageBlob, downloadDiaryShareImage } from './diaryShareImage';

export default function DiaryShareModal({ items, isOpen, onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const previewItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl('');
      setPreviewError('');
      setIsPreviewLoading(false);
      return undefined;
    }

    let isActive = true;
    let objectUrl = '';

    setPreviewUrl('');
    setPreviewError('');
    setIsPreviewLoading(true);

    createDiaryShareImageBlob(previewItems)
      .then((blob) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (isActive) setPreviewError('Não foi possível carregar a prévia agora.');
      })
      .finally(() => {
        if (isActive) setIsPreviewLoading(false);
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isOpen, previewItems]);

  const handleDownloadShare = async () => {
    setExportError('');
    setIsExporting(true);

    try {
      await downloadDiaryShareImage(previewItems);
    } catch {
      setExportError('Não foi possível gerar a imagem agora. Tente novamente em alguns segundos.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] overflow-y-auto bg-black/[0.88] px-3 py-5 backdrop-blur-xl animate-in fade-in duration-200 sm:px-6 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diary-share-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar compartilhamento"
        onClick={onClose}
      />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[460px] flex-col items-center gap-4 py-3 sm:py-5">
        <div className="flex w-full max-w-[390px] items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">Compartilhar diário</p>
            <h3 id="diary-share-title" className="mt-1 text-lg font-black tracking-[-0.02em] text-white">Top 10 do diário</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-zinc-300 transition-colors hover:bg-white/[0.1] hover:text-white"
            aria-label="Fechar modal de compartilhamento"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid w-full place-items-center">
          {isPreviewLoading && (
            <div className="grid aspect-[9/16] w-[320px] max-w-[calc(100vw-2rem)] place-items-center bg-white/[0.025] text-violet-200 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:w-[360px] lg:w-[390px]">
              <Loader2 size={28} className="animate-spin" />
            </div>
          )}

          {!isPreviewLoading && previewUrl && (
            <img
              src={previewUrl}
              alt="Prévia da imagem do diário"
              className="block h-auto max-h-[72vh] w-[320px] max-w-[calc(100vw-2rem)] object-contain shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:w-[360px] lg:w-[390px]"
            />
          )}

          {!isPreviewLoading && !previewUrl && previewError && (
            <div className="grid aspect-[9/16] w-[320px] max-w-[calc(100vw-2rem)] place-items-center bg-white/[0.025] px-6 text-center text-sm font-semibold text-red-300 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:w-[360px] lg:w-[390px]">
              {previewError}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownloadShare}
          disabled={isExporting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-400/[0.12] px-5 text-[11px] font-black uppercase tracking-[0.16em] text-violet-100 transition-colors hover:border-violet-300/[0.35] hover:bg-violet-400/[0.18] disabled:pointer-events-none disabled:opacity-60"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isExporting ? 'Gerando...' : 'Baixar imagem'}
        </button>
        {exportError && <p className="max-w-sm text-center text-xs font-semibold text-red-300">{exportError}</p>}
      </div>
    </div>,
    document.body
  );
}
