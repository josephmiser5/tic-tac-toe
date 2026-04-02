import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket() {
  const wsRef = useRef(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setLastMessage(msg);
      const callbacks = listenersRef.current.get(msg.type);
      if (callbacks) callbacks.forEach((cb) => cb(msg));
    };

    return () => ws.close();
  }, []);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const on = useCallback((type, callback) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type).add(callback);
    return () => listenersRef.current.get(type)?.delete(callback);
  }, []);

  return { send, on, lastMessage, connected };
}
