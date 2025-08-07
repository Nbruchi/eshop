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
  user,
}: {
  children: ReactNode;
  user: any;
}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user.id) return;

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);
    wsRef.current = ws;

    ws.onopen = () => ws.send(`user_${user.id}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'UNSEEN_COUNT_UPDATE') {
        const { conversationId, count } = data.payload;
        setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
      }
    };

    return () => ws.close();
  }, [user?.id]);

  return (
    <WebSocketContext.Provider value={{ ws: wsRef.current, unreadCounts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
