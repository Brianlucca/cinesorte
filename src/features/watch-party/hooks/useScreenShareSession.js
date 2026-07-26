import { useCallback, useEffect, useRef, useState } from "react";
import { createWatchPartySocket } from "@features/watch-party/services/watchPartySocket";

const peerConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function useScreenShareSession(
  roomId,
  { onPlaybackControl, quality } = {},
) {
  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const pendingIceRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const controlHandlerRef = useRef(onPlaybackControl);
  const qualityRef = useRef(quality);
  const mediaMetadataRef = useRef(null);
  const previousTrafficRef = useRef({ bytes: 0, at: Date.now() });
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("idle");
  const [error, setError] = useState("");
  const [technicalStats, setTechnicalStats] = useState(null);
  const [remoteMetadata, setRemoteMetadata] = useState(null);
  useEffect(() => {
    controlHandlerRef.current = onPlaybackControl;
  }, [onPlaybackControl]);
  useEffect(() => {
    qualityRef.current = quality;
  }, [quality]);

  const configureVideoSender = useCallback((sender) => {
    try {
      const parameters = sender.getParameters();
      if (!parameters.encodings?.length) return;
      const selected = qualityRef.current || {};
      const sourceHeight =
        sender.track?.getSettings?.().height || selected.height || 720;
      parameters.encodings[0].maxBitrate =
        Math.max(500, selected.bitrateKbps || 4500) * 1000;
      parameters.encodings[0].maxFramerate = selected.fps || 30;
      parameters.encodings[0].scaleResolutionDownBy = Math.max(
        1,
        sourceHeight / (selected.height || sourceHeight),
      );
      sender.setParameters(parameters).catch(() => undefined);
    } catch {
      /* Compatibilidade: a negociação continua com os padrões do navegador. */
    }
  }, []);

  useEffect(() => {
    peersRef.current.forEach((peer) =>
      peer
        .getSenders()
        .filter(({ track }) => track?.kind === "video")
        .forEach(configureVideoSender),
    );
  }, [configureVideoSender, quality]);

  const sendSignal = useCallback((type, payload = {}, targetId) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN)
      socket.send(
        JSON.stringify({ type, payload, ...(targetId ? { targetId } : {}) }),
      );
  }, []);

  useEffect(() => {
    if (!localStream) return undefined;
    const previewVideo = document.createElement("video");
    previewVideo.muted = true;
    previewVideo.playsInline = true;
    previewVideo.srcObject = localStream;
    previewVideo.play().catch(() => undefined);
    const publishPreview = () => {
      if (previewVideo.readyState < 2 || !previewVideo.videoWidth) return;
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const context = canvas.getContext("2d", { alpha: false });
      context.drawImage(previewVideo, 0, 0, canvas.width, canvas.height);
      sendSignal("room-preview", {
        image: canvas.toDataURL("image/jpeg", 0.48),
      });
    };
    const firstPreview = window.setTimeout(publishPreview, 1500);
    const timer = window.setInterval(publishPreview, 12000);
    return () => {
      window.clearTimeout(firstPreview);
      window.clearInterval(timer);
      previewVideo.pause();
      previewVideo.srcObject = null;
    };
  }, [localStream, sendSignal]);

  const closePeers = useCallback(() => {
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    pendingIceRef.current.clear();
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  const createPeer = useCallback(
    (remoteId) => {
      peersRef.current.get(remoteId)?.close();
      const peer = new RTCPeerConnection(peerConfiguration);
      peer.onicecandidate = ({ candidate }) => {
        if (candidate) sendSignal("ice-candidate", { candidate }, remoteId);
      };
      peer.ontrack = ({ streams }) => {
        setRemoteStream(streams[0]);
        setConnectionState("connected");
      };
      peer.onconnectionstatechange = () => {
        setConnectionState(peer.connectionState);
        if (["failed", "closed"].includes(peer.connectionState))
          peersRef.current.delete(remoteId);
      };
      peersRef.current.set(remoteId, peer);
      return peer;
    },
    [sendSignal],
  );

  const flushIce = useCallback(async (remoteId, peer) => {
    const candidates = pendingIceRef.current.get(remoteId) || [];
    pendingIceRef.current.delete(remoteId);
    for (const candidate of candidates) await peer.addIceCandidate(candidate);
  }, []);

  useEffect(() => {
    if (!("RTCPeerConnection" in window)) {
      setError("Este navegador não oferece suporte a WebRTC.");
      return undefined;
    }
    const socket = createWatchPartySocket(roomId);
    socketRef.current = socket;
    socket.onopen = () => {
      sendSignal("viewer-ready");
      if (mediaMetadataRef.current)
        sendSignal("media-metadata", mediaMetadataRef.current);
    };
    socket.onerror = () =>
      setError("Não foi possível conectar ao servidor da sala.");
    socket.onmessage = async ({ data: rawData }) => {
      const message = JSON.parse(rawData);
      if (["connected", "presence"].includes(message.type)) return;
      const remoteId = message.senderId;
      try {
        if (message.type === "host-ready" && !localStreamRef.current)
          sendSignal("viewer-ready", {}, remoteId);
        if (message.type === "viewer-ready" && localStreamRef.current) {
          const peer = createPeer(remoteId);
          const senders = localStreamRef.current
            .getTracks()
            .map((track) => peer.addTrack(track, localStreamRef.current));
          await peer.setLocalDescription(await peer.createOffer());
          sendSignal("offer", { description: peer.localDescription }, remoteId);
          setConnectionState("connecting");
          senders
            .filter(({ track }) => track?.kind === "video")
            .forEach(configureVideoSender);
        }
        if (message.type === "offer" && !localStreamRef.current) {
          const peer = createPeer(remoteId);
          await peer.setRemoteDescription(message.payload.description);
          await flushIce(remoteId, peer);
          await peer.setLocalDescription(await peer.createAnswer());
          sendSignal(
            "answer",
            { description: peer.localDescription },
            remoteId,
          );
          setConnectionState("connecting");
        }
        if (message.type === "answer") {
          const peer = peersRef.current.get(remoteId);
          if (peer) {
            await peer.setRemoteDescription(message.payload.description);
            await flushIce(remoteId, peer);
          }
        }
        if (message.type === "ice-candidate") {
          const peer = peersRef.current.get(remoteId);
          if (peer?.remoteDescription)
            await peer.addIceCandidate(message.payload.candidate);
          else
            pendingIceRef.current.set(remoteId, [
              ...(pendingIceRef.current.get(remoteId) || []),
              message.payload.candidate,
            ]);
        }
        if (message.type === "stream-stopped") closePeers();
        if (message.type === "playback-control")
          controlHandlerRef.current?.(message.payload);
        if (message.type === "media-metadata")
          setRemoteMetadata(message.payload);
      } catch (signalError) {
        setError(signalError.message || "Falha ao negociar a transmissão.");
      }
    };
    return () => {
      socket.close();
      socketRef.current = null;
      closePeers();
    };
  }, [
    closePeers,
    configureVideoSender,
    createPeer,
    flushIce,
    roomId,
    sendSignal,
  ]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const peers = [...peersRef.current.values()];
      if (!peers.length) {
        setTechnicalStats(null);
        return;
      }
      let bytes = 0;
      let packetsLost = 0;
      let width = 0;
      let height = 0;
      let fps = 0;
      let rtt = 0;
      let direction = localStreamRef.current ? "upload" : "download";
      for (const peer of peers) {
        const reports = await peer.getStats();
        reports.forEach((report) => {
          if (report.type === "outbound-rtp" && report.kind === "video") {
            bytes += report.bytesSent || 0;
            width = Math.max(width, report.frameWidth || 0);
            height = Math.max(height, report.frameHeight || 0);
            fps = Math.max(fps, report.framesPerSecond || 0);
          }
          if (report.type === "inbound-rtp" && report.kind === "video") {
            bytes += report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
            width = Math.max(width, report.frameWidth || 0);
            height = Math.max(height, report.frameHeight || 0);
            fps = Math.max(fps, report.framesPerSecond || 0);
          }
          if (
            report.type === "candidate-pair" &&
            report.nominated &&
            report.state === "succeeded"
          )
            rtt = Math.max(rtt, (report.currentRoundTripTime || 0) * 1000);
        });
      }
      const now = Date.now();
      const previous = previousTrafficRef.current;
      const bitrate = Math.max(
        0,
        ((bytes - previous.bytes) * 8) / Math.max(1, now - previous.at),
      );
      previousTrafficRef.current = { bytes, at: now };
      setTechnicalStats({
        direction,
        bitrateKbps: Math.round(bitrate),
        width,
        height,
        fps: Math.round(fps),
        rttMs: Math.round(rtt),
        packetsLost,
        peers: peers.length,
        connectionState: peers[0].connectionState,
        iceState: peers[0].iceConnectionState,
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const stopSharing = useCallback(
    (stopTracks = true) => {
      if (stopTracks)
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
      closePeers();
      sendSignal("stream-stopped");
    },
    [closePeers, sendSignal],
  );

  const startWithStream = useCallback(
    (stream) => {
      if (!stream?.getVideoTracks().length)
        throw new Error("O vídeo não gerou uma faixa para transmissão.");
      localStreamRef.current = stream;
      setLocalStream(stream);
      setConnectionState("waiting");
      sendSignal("host-ready");
    },
    [sendSignal],
  );

  const sendPlaybackControl = useCallback(
    (action, position) =>
      sendSignal("playback-control", {
        action,
        ...(Number.isFinite(position) ? { position } : {}),
      }),
    [sendSignal],
  );
  const setMediaMetadata = useCallback(
    (metadata) => {
      mediaMetadataRef.current = metadata;
      sendSignal("media-metadata", metadata);
    },
    [sendSignal],
  );

  const startSharing = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 } },
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setConnectionState("waiting");
      stream
        .getVideoTracks()[0]
        ?.addEventListener("ended", stopSharing, { once: true });
      sendSignal("host-ready");
    } catch (captureError) {
      if (captureError.name !== "NotAllowedError")
        setError(
          captureError.message || "Não foi possível compartilhar a tela.",
        );
    }
  }, [sendSignal, stopSharing]);

  return {
    localStream,
    remoteStream,
    remoteMetadata,
    connectionState,
    error,
    technicalStats,
    startSharing,
    startWithStream,
    stopSharing,
    sendPlaybackControl,
    setMediaMetadata,
  };
}
