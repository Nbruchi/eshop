'use client';

import { useQuery } from '@tanstack/react-query';
import Breadcrumb from 'apps/seller-ui/src/shared/components/Breadcrumb';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import Link from 'next/link';
import { useState } from 'react';

const Page = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axiosInstance.get('/seller/seller-notifications');
      return res.data.notifications;
    },
  });

  const markAsRead = async (notificationId: string) => {
    await axiosInstance.put(`/seller/mark-as-read`, {
      notificationId,
    });
  };

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">Notifications</h2>
      <Breadcrumb title="Notifications" />
      {isLoading ? (
        <p className="text-center pt-24 text-white text-sm font-poppins">
          Loading...
        </p>
      ) : data.length > 0 ? (
        <div className="md:w-[80%] my-6 rounded-lg divide-y divide-gray-800 bg-black/40 shadow-sm backdrop-blur-sm">
          {data.map((notification: any) => (
            <Link
              href={notification.redirectLink}
              key={notification.id}
              className={`block px-5 py-4 transition ${
                notification.status !== 'Unread'
                  ? 'hover:bg-gray-800/40'
                  : 'bg-gray-800/50 hover:bg-gray-800/70'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="text-white font-medium">
                    {notification.title}
                  </span>
                  <span className="text-gray-300 text-sm">
                    {notification.message}
                  </span>
                  <span className="text-gray-500 text-xs mt-1">
                    {new Date(notification.createdAt).toLocaleDateString(
                      'en-UK',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center pt-24 text-white text-sm font-poppins">
          No notifications available yet!
        </p>
      )}
    </div>
  );
};

export default Page;
