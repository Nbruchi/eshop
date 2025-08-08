'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from 'apps/seller-ui/src/context/WebSocketContext';
import ChatInput from 'apps/seller-ui/src/shared/components/ChatInput';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, FormEvent } from 'react';

const Inbox = () => {
  const router = useRouter();
  const { ws } = useWebSocket();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const conversationId = searchParams.get('conversationId');
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const { data: messages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !hasFetchedOnce) return [];

      const res = await axiosInstance.get(
        `/chats/get-seller-messages/${conversationId}?page=1`
      );
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  const scrollToBottom = () =>
    requestAnimationFrame(() => {
      setTimeout(() => {
        const container = messageContainerRef.current;

        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    });

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;
    const timout = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timout);
  }, [conversationId, messages.length]);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await axiosInstance.get('/chats/get-seller-conversations');
      return res.data.conversations;
    },
  });

  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversatioId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event: any) => {
      const data = JSON.parse(event.data);

      if (data.type === 'NEW_MESSAGE') {
        const newMessage = data?.payload;

        if (newMessage.conversationId === conversationId) {
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: any[] = []) => [
              ...old,
              {
                content: newMessage.messageBody || newMessage.content || '',
                senderType: newMessage.senderType,
                seen: false,
                createdAt: newMessage.createdAt || new Date().toISOString(),
              },
            ]
          );
          scrollToBottom();
        }
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === newMessage.conversationId
              ? { ...chat, lastMessage: newMessage.content }
              : chat
          )
        );
      }
      if (data.type === 'UNSEEN_COUNT_UPDATE') {
        const { conversationId, count } = data.payload;
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.conversationId === conversationId
              ? { ...chat, unreadCount: count }
              : chat
          )
        );
      }
    };
  }, [ws, conversationId]);

  const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);

    setChats((prevChats) =>
      prevChats.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );

    router.push(`?conversationId=${chat.conversationId}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'MARK_AS_SEEN',
          conversationId: chat.conversatioId,
        })
      );
    }
  };

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !message.trim() ||
      !selectedChat ||
      !ws ||
      ws.readyState !== WebSocket.OPEN
    )
      return;

    const payload = {
      from: 'seller',
      text: message,
      time: new Date().toLocaleDateString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      seen: false,
    };

    ws.send(JSON.stringify(payload));

    setMessage('');
    scrollToBottom();
  };

  const getLastMessage = (chat: any) =>
    chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1].text
      : '';

  return (
    <div className="w-full">
      <div className="flex h-screen shadow-inner overflow-hidden bg-gray-950 text-gray-200">
        {/* Sidebar */}
        <div className="border-b w-[320px] border-r-gray-800 bg-gray-950">
          <h2 className="p-4 border-b border-gray-800 text-lg font-semibold">
            Messages
          </h2>
          <div className="divide-y divide-gray-900">
            {isLoading ? (
              <p className="text-center py-5 text-sm">Loading...</p>
            ) : chats.length > 0 ? (
              chats.map((chat) => {
                const isActive =
                  selectedChat.conversationId === chat.conversationId;
                return (
                  <button
                    key={chat.conversatioId}
                    onClick={() => handleChatSelect(chat)}
                    className={`w-full text-left px-4 py-3 transition ${
                      isActive ? 'bg-blue-950' : 'hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={chat.user?.avatar || '/images/placeholder.png'}
                        alt={chat.user.name}
                        width={36}
                        height={36}
                        className="rounded-full border size-10 object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-800 font-semibold">
                            {chat?.user?.name}
                          </span>
                          {chat.user?.isOnline && (
                            <div className="size-2 rounded-full bg-green-500" />
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 truncate max-w-[170px]">
                            {getLastMessage(chat)}
                          </p>
                          {chat?.unreadCount > 0 && (
                            <span className="ml-2 text-[10px] bg-blue-600 text-white">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-center pt-5">No conversations available yet</p>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 bg-gray-100">
          {selectedChat ? (
            <>
              <div className="p-4 border-b bg-white border-b-gray-200 flex items-center gap-3">
                <Image
                  src={selectedChat.user?.avatar || '/images/placeholder.png'}
                  alt={selectedChat?.user.name}
                  width={40}
                  height={40}
                  className="rounded-full border size-10 object-cover border-gray-200"
                />
                <div>
                  <h2 className="text-gray-800 font-semibold text-base">
                    {selectedChat.user?.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedChat.user?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-6 text-sm space-y-4"
              >
                {messages.map((msg: any, index: number) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[80%] ${
                      msg.senderType === 'seller'
                        ? 'items-end ml-auto'
                        : 'items-start'
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg shadow-sm w-fit ${
                        msg.senderType === 'seller'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800'
                      }`}
                    >
                      {msg.text || msg.content}
                    </div>
                    <div
                      className={`text-[11px] text-gray-400 mt-1 flex items-center gap-1 ${
                        msg.senderType === 'seller'
                          ? 'mr-1 justify-end'
                          : 'ml-1'
                      }`}
                    >
                      {msg.time ||
                        new Date(msg.createdAt).toLocaleDateString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    </div>
                  </div>
                ))}
              </div>
              <ChatInput
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSend}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
