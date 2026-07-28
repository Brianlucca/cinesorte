import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Maximize2, Move, Radio, Square, Undo2 } from "lucide-react";
import LocalVideoStage from "@features/watch-party/components/LocalVideoStage";
import ScreenShareStage from "@features/watch-party/components/ScreenShareStage";

const BroadcastContext = createContext(null);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function DockedBroadcast({ children, onReturn, onStop }) {
  const initialWidth = Math.min(390, window.innerWidth - 32);
  const [geometry, setGeometry] = useState({
    width: initialWidth,
    height: 245,
    x: Math.max(16, window.innerWidth - initialWidth - 20),
    y: Math.max(16, window.innerHeight - 265),
  });
  const interactionRef = useRef(null);

  useEffect(() => {
    const move = (event) => {
      const interaction = interactionRef.current;
      if (!interaction) return;
      const dx = event.clientX - interaction.pointerX;
      const dy = event.clientY - interaction.pointerY;
      if (interaction.type === "move") {
        setGeometry((current) => ({
          ...current,
          x: clamp(interaction.x + dx, 8, Math.max(8, window.innerWidth - current.width - 8)),
          y: clamp(interaction.y + dy, 8, Math.max(8, window.innerHeight - current.height - 8)),
        }));
        return;
      }
      setGeometry((current) => ({
        ...current,
        width: clamp(interaction.width + dx, 300, Math.max(300, window.innerWidth - current.x - 8)),
        height: clamp(interaction.height + dy, 190, Math.max(190, window.innerHeight - current.y - 8)),
      }));
    };
    const end = () => { interactionRef.current = null; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  const beginInteraction = (type) => (event) => {
    event.preventDefault();
    interactionRef.current = {
      type,
      pointerX: event.clientX,
      pointerY: event.clientY,
      ...geometry,
    };
  };

  return (
    <div
      className="fixed z-[85] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_25px_90px_rgba(0,0,0,0.75)]"
      style={{ left: geometry.x, top: geometry.y, width: geometry.width, height: geometry.height }}
    >
      <div className="h-full w-full">{children}</div>
      <div
        onPointerDown={beginInteraction("move")}
        className="absolute inset-x-0 top-0 z-50 flex cursor-move touch-none items-center justify-between bg-gradient-to-b from-black/95 via-black/65 to-transparent p-3 pb-10"
      >
        <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-emerald-300">
          <Move size={12} />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ao vivo
        </span>
        <div className="flex gap-2" onPointerDown={(event) => event.stopPropagation()}>
          <button type="button" onClick={onReturn} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[8px] font-black uppercase text-black">
            <Undo2 size={12} /> Voltar à sala
          </button>
          <button type="button" onClick={onStop} className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/20 bg-black/55 text-red-300" title="Encerrar transmissão">
            <Square size={11} fill="currentColor" />
          </button>
        </div>
      </div>
      <button
        type="button"
        onPointerDown={beginInteraction("resize")}
        className="absolute bottom-0 right-0 z-[60] grid h-8 w-8 cursor-nwse-resize touch-none place-items-center rounded-tl-xl border-l border-t border-white/10 bg-black/75 text-zinc-300"
        aria-label="Redimensionar miniatura"
      >
        <Maximize2 size={14} />
      </button>
    </div>
  );
}

export function WatchPartyBroadcastProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  if (!containerRef.current && typeof document !== "undefined") {
    const node = document.createElement("div");
    node.dataset.cinesorteBroadcast = "true";
    containerRef.current = node;
  }
  const [broadcast, setBroadcast] = useState(null);
  const [docked, setDocked] = useState(false);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const broadcastRef = useRef(null);
  const stopRef = useRef(null);

  const mount = useCallback((config, target) => {
    const owner = broadcastRef.current;
    if (activeRef.current && owner && owner.roomId !== config.roomId) return false;
    const next = owner?.roomId === config.roomId ? { ...owner, ...config } : config;
    broadcastRef.current = next;
    setBroadcast(next);
    if (target && containerRef.current?.parentNode !== target)
      target.appendChild(containerRef.current);
    setDocked(false);
    return true;
  }, []);

  const detach = useCallback((roomId) => {
    if (broadcastRef.current?.roomId !== roomId) return;
    if (!activeRef.current) {
      broadcastRef.current = null;
      setBroadcast(null);
      return;
    }
    if (containerRef.current?.parentNode !== document.body)
      document.body.appendChild(containerRef.current);
    setDocked(true);
  }, []);

  const reportState = useCallback((isActive, stop) => {
    setActive(isActive);
    activeRef.current = isActive;
    stopRef.current = stop || null;
  }, []);

  const stopBroadcast = useCallback(() => {
    stopRef.current?.();
    setActive(false);
    activeRef.current = false;
    setDocked(false);
    setBroadcast(null);
    broadcastRef.current = null;
    containerRef.current?.remove();
  }, []);

  const returnToRoom = useCallback(() => {
    const roomId = broadcastRef.current?.roomId;
    if (roomId) navigate(`/app/watch-party/${roomId}`);
  }, [navigate]);

  const value = useMemo(() => ({
    mount,
    detach,
    active,
    activeRoomId: active ? broadcast?.roomId : null,
    returnToRoom,
  }), [active, broadcast?.roomId, detach, mount, returnToRoom]);
  const Stage = broadcast?.service === "local" ? LocalVideoStage : ScreenShareStage;

  useEffect(() => {
    if (!active) return undefined;
    const warnBeforeClosing = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeClosing);
    return () => window.removeEventListener("beforeunload", warnBeforeClosing);
  }, [active]);

  useEffect(() => {
    if (!docked || active) return;
    setDocked(false);
    setBroadcast(null);
    broadcastRef.current = null;
    containerRef.current?.remove();
  }, [active, docked]);

  useLayoutEffect(() => {
    if (!broadcast || !docked) return undefined;
    if (location.pathname !== `/app/watch-party/${broadcast.roomId}`) return undefined;
    const restore = () => {
      const target = [...document.querySelectorAll("[data-watch-party-broadcast-target]")]
        .find((node) => node.dataset.watchPartyBroadcastTarget === broadcast.roomId);
      if (!target || !containerRef.current) return false;
      if (containerRef.current.parentNode !== target) target.appendChild(containerRef.current);
      setDocked(false);
      return true;
    };
    if (restore()) return undefined;
    const frame = window.requestAnimationFrame(restore);
    return () => window.cancelAnimationFrame(frame);
  }, [broadcast, docked, location.pathname]);

  const stage = broadcast && (
    <Stage
      roomId={broadcast.roomId}
      isHost
      allowGuestControl={broadcast.allowGuestControl}
      cinemaWidget={broadcast.cinemaWidget}
      onBroadcastStateChange={reportState}
      compact={docked}
    />
  );

  return (
    <BroadcastContext.Provider value={value}>
      {children}
      {broadcast && containerRef.current && createPortal(
        docked
          ? <DockedBroadcast onReturn={returnToRoom} onStop={stopBroadcast}>{stage}</DockedBroadcast>
          : <div className="w-full">{stage}</div>,
        containerRef.current,
      )}
    </BroadcastContext.Provider>
  );
}

export function PersistentHostBroadcast({ roomId, service, allowGuestControl, cinemaWidget }) {
  const context = useContext(BroadcastContext);
  const detach = context?.detach;
  const targetRef = useRef(null);
  const hasOtherActiveBroadcast = context?.active && context.activeRoomId !== roomId;
  const attachTarget = useCallback((node) => {
    targetRef.current = node;
    if (node && !hasOtherActiveBroadcast)
      context?.mount({ roomId, service, allowGuestControl, cinemaWidget }, node);
  }, [allowGuestControl, cinemaWidget, context, hasOtherActiveBroadcast, roomId, service]);

  useLayoutEffect(() => {
    if (targetRef.current && !hasOtherActiveBroadcast)
      context?.mount({ roomId, service, allowGuestControl, cinemaWidget }, targetRef.current);
  }, [allowGuestControl, cinemaWidget, context, hasOtherActiveBroadcast, roomId, service]);
  useLayoutEffect(() => () => detach?.(roomId), [detach, roomId]);

  if (hasOtherActiveBroadcast)
    return (
      <div className="grid aspect-video min-h-[260px] place-items-center rounded-[1.5rem] border border-white/[0.08] bg-black p-8 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300"><Radio size={22} /></span>
          <h2 className="mt-4 text-xl font-black text-white">Você já está transmitindo em outra sala</h2>
          <p className="mt-2 text-sm text-zinc-600">Encerre a transmissão atual antes de iniciar uma nova.</p>
          <button type="button" onClick={context.returnToRoom} className="mt-5 rounded-xl bg-white px-5 py-3 text-[10px] font-black uppercase tracking-wider text-black">Voltar à transmissão</button>
        </div>
      </div>
    );

  return <div ref={attachTarget} data-watch-party-broadcast-target={roomId} className="min-h-[260px] w-full" />;
}
