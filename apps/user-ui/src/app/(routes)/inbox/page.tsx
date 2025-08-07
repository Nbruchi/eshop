'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import useRequireAuth from 'apps/user-ui/src/hooks/useRequireAuth';
import ChatInput from 'apps/user-ui/src/shared/components/ChatInput';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { isProtected } from 'apps/user-ui/src/utils/protected';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const Inbox = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const conversationId = searchParams.get('conversationId');
  const [hasFetchedOnce, setHasFetchedOnce] = useState(true);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const { user, isLoading: isUserLoading } = useRequireAuth();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        '/chats/get-user-conversations',
        isProtected
      );
      return res.data.conversations;
    },
  });

  useEffect(() => {
    if (conversations) {
      setChats(conversations);
    }
  }, [conversations]);

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  const getLastMessage = (chat: any) => chat.lastMessage || '';

  const { data: messages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId || !hasFetchedOnce) return [];

      const res = await axiosInstance.get(
        `/chats/get-messages/${conversationId}?page=${page}`,
        isProtected
      );
      setPage(1);
      setHasMore(res.data.hasMore);
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });

  const loadMoreMessages = async () => {
    const nextPage = page + 1;
    const res = await axiosInstance.get(
      `/chats/get-messages/${conversationId}?page=${nextPage}`,
      isProtected
    );

    queryClient.setQueryData(
      ['messages', conversationId],
      (old: any[] = []) => [...res.data.messages.reverse(), ...old]
    );
    setPage(nextPage);
    setHasMore(res.data.hasMore);
  };

  const handleSend = () => {};

  const handleChatSelect = async (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
    router.push(`?conversationId=${chat.conversationId}`);
  };
 
  return (
    <div className="w-full">
      <div className="mx-auto md:w-[80%] pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <div className="border-r w-[320px] border-r-gray-200 bg-gray-50">
            <h2 className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </h2>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <p className="p-4 text-sm text-gray-500">Loading...</p>
              ) : chats.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No conversation</p>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      key={chat.conversationId}
                      className={`w-full text-left px-4 py-3 transition hover:bg-blue-50 ${
                        isActive && 'bg-blue-100'
                      }`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            chat?.seller?.avatar || '/images/placeholder.png'
                          }
                          alt={chat?.seller?.name}
                          width={36}
                          height={36}
                          className="rounded-full border size-[40px] object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {chat?.seller?.name}
                            </span>
                            {chat.seller?.isOnline && (
                              <div className="size-2 rounded-full bg-green-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-[170px]">
                            {getLastMessage(chat)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-100">
            {selectedChat ? (
              <>
                <div className="p-4 border-b bg-white border-b-gray-200 flex items-center gap-3">
                  <Image
                    src={
                      selectedChat.seller?.avatar || '/images/placeholder.png'
                    }
                    alt={selectedChat?.seller.name}
                    width={40}
                    height={40}
                    className="rounded-full border size-10 object-cover border-gray-200"
                  />
                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {selectedChat.seller?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.seller?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto p-6 text-sm space-y-4"
                >
                  {hasMore && (
                    <button
                      className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300 transition"
                      onClick={loadMoreMessages}
                    >
                      Load previous messages
                    </button>
                  )}
                  {messages.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[80%] ${
                        msg.senderType === 'user'
                          ? 'items-end ml-auto'
                          : 'items-start'
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg shadow-sm w-fit ${
                          msg.senderType === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800'
                        }`}
                      >
                        {msg.text || msg.content}
                      </div>
                      <div
                        className={`text-[11px] text-gray-400 mt-1 flex items-center gap-1 ${
                          msg.senderType === 'user'
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
                  <div ref={scrollAnchorRef} />
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
    </div>
  );
};

export default Inbox;
