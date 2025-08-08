'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendKafkaEvent } from 'apps/user-ui/src/actions/track-user';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import {
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTwitter, FaYoutube } from 'react-icons/fa';
import ProductCard from '../../components/cards/ProductCard';

interface SellerProfileProps {
  shop: any;
  followersCount: number;
}

const TABS = ['Products', 'Offers', 'Reviews'];

const SellerProfile = ({ shop, followersCount }: SellerProfileProps) => {
  const [activeTab, setActiveTab] = useState('Products');
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user } = useUser();
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceTracking();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/get-seller-products/${shop.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop.id) return;

      try {
        const res = await axiosInstance.get(`/seller/isfollowing/${shop.id}`);
        setIsFollowing(res.data.isFollowing !== null);
      } catch (error) {
        console.error(`Failed to fetch follow status: ${error}`);
      }
    };

    fetchFollowStatus();
  }, [shop?.id]);

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ['seller-events'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/get-seller-events/${shop.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await axiosInstance.put('/seller/unfollow-shop', { shopId: shop?.id });
      } else {
        await axiosInstance.put('/seller/follow-shop', { shopId: shop?.id });
      }
    },
    onSuccess: () => {
      //   Flip state only after successful request
      if (isFollowing) {
        setFollowers(followers - 1);
      } else {
        setFollowers(followers + 1);
      }
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ['isfollowing', shop?.id] });
    },
    onError: () => {
      console.error('Failed to follow/unfollow the shop');
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (!location || !deviceInfo || !user?.id) return;
      sendKafkaEvent({
        userId: user?.id,
        shopId: shop?.id,
        action: 'shop_visit',
        country: location.country || 'Unknown',
        city: location.city || 'Unknown',
        device: deviceInfo || 'Unknown device',
      });
    }
  }, [location, deviceInfo, isLoading]);

  return (
    <div>
      <div className="relative w-full flex justify-center">
        <Image
          src={shop?.coverBanner || '/images/default-banner.png'}
          alt="Seller cover"
          width={1200}
          height={300}
        />
      </div>
      {/* Seller info section */}
      <div className="w-[85%] lg:w-[75%] mt-[-50px] mx-auto z-20 relative flex flex-col lg:flex-row gap-6">
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative size-24 rounded-full border-4 border-slate-300 overflow-hidden">
              <Image
                src={shop?.avatar || '/images/default-shop.png'}
                alt="avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-1 w-full">
              <h1 className="text-2xl font-semibold text-slate-900">
                {shop?.name}
              </h1>
              <p className="text-slate-800 text-sm mt-1">
                {shop.bio || 'No bio available'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-blue-400 gap-1">
                  <Star size={18} fill="#60a5fa" />
                  <span>{shop.ratings || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-700">
                  <Users size={18} /> <span>{followers} followers</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-slate-700">
                <Clock size={18} />
                <span>{shop.openingHours}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-slate-700">
                <MapPin size={18} />
                <span>{shop.address || 'No address provided'}</span>
              </div>
            </div>
            <button
              disabled={toggleFollowMutation.isPending}
              onClick={() => toggleFollowMutation.mutate()}
              className={`px-6 py-2 h-10 rounded-lg font-semibold flex items-center ${
                isFollowing
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Heart size={18} />
              <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
            </button>
          </div>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
          <h2 className="text-2xl font-semibold text-slate-900">
            Shop Details
          </h2>
          <div className="flex items-center gap-3 mt-3 text-slate-700">
            <Calendar size={18} />
            <span>
              Joined at: {new Date(shop.createdAt).toLocaleDateString()}
            </span>
          </div>
          {shop.website && (
            <div className="flex items-center gap-3 mt-3 text-slate-700">
              <Globe size={18} />
              <Link
                href={shop.website}
                className="hover:underline text-blue-600"
              >
                {shop.website}
              </Link>
            </div>
          )}
          {shop.socialLinks && shop.socialLinks.length > 0 && (
            <div className="mt-3">
              <h3 className="text-lg font-medium text-slate-700">Follow Us:</h3>
              <div className="flex gap-3 mt-2">
                {shop.socialLinks.map((link: any, index: number) => (
                  <Link
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-[0.9]"
                  >
                    {link.type === 'youtube' && <FaYoutube />}
                    {link.type === 'x' && <FaTwitter />}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Tabs section */}
      <div className="mx-auto w-[85%] lg:w-[70%] mt-8">
        {/* Tabs */}
        <div className="flex border-b border-b-gray-300">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-lg font-semibold transition ${
                activeTab === tab
                  ? 'text-slate-800 border-b-2 border-b-blue-600'
                  : 'text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="my-4 bg-gray-200 rounded-lg text-slate-700">
          {activeTab === 'Products' && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-300 h-[250px] animate-pulse rounded-xl"
                  />
                ))
              ) : products.length > 0 ? (
                products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="py-2 text-center">
                  No products available yet!
                </div>
              )}
            </div>
          )}
          {activeTab === 'Offers' && (
            <div className="m-auto grid grid-cols-1 p-4 sm:grid-cols-3 md:grid-cols-4">
              {isEventsLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-300 h-[250px] animate-pulse rounded-xl"
                  />
                ))
              ) : events.length > 0 ? (
                events.map((product: any) => (
                  <ProductCard key={product.id} product={product} isEvent />
                ))
              ) : (
                <div className="py-2 text-center">No events available yet!</div>
              )}
            </div>
          )}
          {activeTab === 'Reviews' && (
            <p className="text-center py-5">No reviews available yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
