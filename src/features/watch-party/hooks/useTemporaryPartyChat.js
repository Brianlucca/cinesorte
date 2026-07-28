import { useCallback, useEffect, useRef, useState } from "react";
import { createWatchPartySocket } from "@features/watch-party/services/watchPartySocket";

export function useTemporaryPartyChat(roomId) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let disposed = false;
    let retryTimer = null;
    let retryAttempt = 0;

    const connect = () => {
      if (disposed) return;
      const socket = createWatchPartySocket(roomId);
      socketRef.current = socket;
      socket.onopen = () => {
        retryAttempt = 0;
        setConnected(true);
      };
      socket.onmessage = ({ data }) => {
        const message = JSON.parse(data);
        if (message.type === "chat-history") {
          setMessages(
            (message.payload?.messages || []).map((item) => ({
              ...item,
              text: item.body,
            })),
          );
        }
        if (message.type === "chat-message") {
          const item = message.payload;
          setMessages((current) =>
            current.some(({ id }) => id === item.id)
              ? current
              : [...current, { ...item, text: item.body }],
          );
        }
        if (message.type === "chat-expired")
          setMessages((current) =>
            current.filter(({ id }) => id !== message.payload?.id),
          );
        if (message.type === "presence")
          setParticipants(message.payload?.participants || []);
        if (message.type === "kicked" || message.type === "room-deleted") {
          disposed = true;
          window.location.assign("/app/watch-party");
        }
      };
      socket.onclose = (event) => {
        if (socketRef.current === socket) socketRef.current = null;
        setConnected(false);
        if (disposed || [4003, 4004].includes(event.code)) return;
        const delay = Math.min(1000 * 2 ** retryAttempt, 10000);
        retryAttempt += 1;
        retryTimer = window.setTimeout(connect, delay);
      };
      socket.onerror = () => socket.close();
    };

    connect();
    return () => {
      disposed = true;
      window.clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
      setMessages([]);
      setParticipants([]);
      setConnected(false);
    };
  }, [roomId]);

  const sendMessage = useCallback((text) => {
    const body = text.trim().slice(0, 500);
    const socket = socketRef.current;
    if (!body || socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: "chat-message", payload: { body } }));
    return true;
  }, []);

  const kickParticipant = useCallback((userId) => {
    const socket = socketRef.current;
    if (!userId || socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: "kick-user", payload: { userId } }));
    return true;
  }, []);

  return { messages, participants, connected, sendMessage, kickParticipant };
}
