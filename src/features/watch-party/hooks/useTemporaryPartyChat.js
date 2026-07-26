import { useCallback, useEffect, useRef, useState } from "react";
import { createWatchPartySocket } from "@features/watch-party/services/watchPartySocket";

export function useTemporaryPartyChat(roomId) {
  const socketRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const socket = createWatchPartySocket(roomId);
    socketRef.current = socket;
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
      if (message.type === "chat-expired") {
        setMessages((current) =>
          current.filter(({ id }) => id !== message.payload?.id),
        );
      }
      if (message.type === "presence")
        setParticipants(message.payload?.participants || []);
      if (message.type === "kicked") window.location.assign("/app/watch-party");
    };
    return () => {
      socket.close();
      socketRef.current = null;
      setMessages([]);
      setParticipants([]);
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

  return { messages, participants, sendMessage, kickParticipant };
}
