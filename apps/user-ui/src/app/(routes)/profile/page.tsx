'use client';

import { useQueryClient } from '@tanstack/react-query';
import useUser from 'apps/user-ui/src/hooks/useUser';
import QuickActionCard from 'apps/user-ui/src/shared/components/cards/QuickActionCard';
import StatCard from 'apps/user-ui/src/shared/components/cards/StatCard';
import NavItem from 'apps/user-ui/src/shared/widgets/section/NavItem';
import ShippingAddressSection from 'apps/user-ui/src/shared/widgets/section/ShippingAddressSection';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import {
  BadgeCheck,
  Bell,
  CheckCircle,
  Clock,
  Gift,
  Inbox,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  PhoneCall,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isLoading } = useUser();
  const queryTab = searchParams.get('active') || 'Profile';
  const [activeTab, setActiveTab] = useState(queryTab);

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('active', activeTab);
      router.replace(`/profile?${newParams.toString().toLowerCase()}`);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    await axiosInstance.get(`/logout-user`).then((res) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });

      router.push('/login');
    });
  };

  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="md:max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{' '}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="inline animate-spin size-5" />
              ) : (
                `${user.name || 'User'}`
              )}
            </span>
            👋
          </h1>
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title="Total Orders" count={10} Icon={Clock} />
          <StatCard title="Processing Orders" count={4} Icon={Truck} />
          <StatCard title="Completed Orders" count={5} Icon={CheckCircle} />
        </div>
        {/* Sidebar */}
        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* Left navigation */}
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 w-full md:w-1/5">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                isActive={activeTab === 'Profile'}
                onClick={() => setActiveTab('Profile')}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                isActive={activeTab === 'My Orders'}
                onClick={() => setActiveTab('My Orders')}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                isActive={activeTab === 'Inbox'}
                onClick={() => router.push('/inbox')}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                isActive={activeTab === 'Notifications'}
                onClick={() => setActiveTab('Notifications')}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                isActive={activeTab === 'Shipping Address'}
                onClick={() => setActiveTab('Shipping Address')}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                isActive={activeTab === 'Change Password'}
                onClick={() => setActiveTab('Change Password')}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                isDanger
                onClick={handleLogout}
              />
            </nav>
          </div>
          {/* Main content */}
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100 w-full md:w-1/2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {activeTab}
            </h2>
            {activeTab === 'Profile' && !isLoading && user ? (
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Image
                    src={user?.avatar || '/images/profile.png'}
                    alt="avatar"
                    width={60}
                    height={60}
                    className="size-16 rounded-full border border-gray-200"
                  />
                  <button className="flex items-center gap-1 text-xs font-medium text-blue-500">
                    <Pencil className="size-4" />
                    Change Photo
                  </button>
                </div>
                <p>
                  <span className="font-semibold">Joined:</span>{' '}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Earned Points:</span>{' '}
                  {user.points || 0}
                </p>
              </div>
            ) : (
              <p className="text-center">User Information not available yet!</p>
            )}
            {activeTab === 'Shipping Address' && <ShippingAddressSection />}
          </div>
          {/* Right quick panel */}
          <div className="w-full md:w-1/4 space-y-4">
            <QuickActionCard
              Icon={Gift}
              title="Referral Program"
              description="Invite friends and earn rewards"
            />
            <QuickActionCard
              Icon={BadgeCheck}
              title="Your Badges"
              description="View your earned achievements"
            />
            <QuickActionCard
              Icon={Settings}
              title="Account settings"
              description="Manage preferences and security"
            />
            <QuickActionCard
              Icon={Receipt}
              title="Billing History"
              description="Check your recent payments"
            />
            <QuickActionCard
              Icon={PhoneCall}
              title="Support Center"
              description="Need Help? Contact Support."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
