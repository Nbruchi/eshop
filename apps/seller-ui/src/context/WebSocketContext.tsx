'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({
  children,
  seller,
}: {
  children: ReactNode;
  seller: any;
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [wsReady, setWsReady] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!seller.id) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(`seller_${seller.id}`);
      setWsReady(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'UNSEEN_COUNT_UPDATE') {
        const { conversationId, count } = data.payload;
        setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
      }
    };

    return () => ws.close();
  }, [seller?.id]);

  if (!wsReady) return null;

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
