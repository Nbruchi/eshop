'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sendKafkaEvent } from 'apps/user-ui/src/actions/track-user';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  Heart,
  MapPin,
  Pencil,
  Star,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaTwitter, FaYoutube } from 'react-icons/fa';
import ProductCard from '../shared/components/ProductCard';
import useSeller from '../hooks/useSeller';
import { useRouter } from 'next/navigation';

const TABS = ['Products', 'Offers', 'Reviews'];

const fetchProducts = async () => {
  const res = await axiosInstance.get('/products/get-shop-products');
  const products = res.data.products?.filter((i: any) => !i.startingDate);
  return products;
};

const fetchEvents = async () => {
  const res = await axiosInstance.get('/products/get-shop-events');
  const events = res.data.products?.filter((i: any) => i.startingDate);
  return events;
};

const Page = () => {
  const router = useRouter();
  const { seller } = useSeller();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('Products');
  const [editType, setEditType] = useState<'cover' | 'avatar' | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!seller && !isLoading) router.push('/login');
  }, [seller, isLoading]);

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ['shop-events'],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div>
      {isLoading ? (
        <div></div>
      ) : (
        <div className="w-full bg-gray-900 min-h-screen">
          {/* Back to dashboard button */}
          <div className="w-full px-3 pt-2">
            <button
              className="text-white flex items-center gap-2 font-semibold cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft /> Go back to Order Dashboard
            </button>
          </div>
          <div className="relative w-full flex justify-center">
            {/* Cover banner */}
            <Image
              src={seller.shop?.coverBanner || '/images/default-banner.png'}
              alt="Seller cover"
              width={1200}
              height={300}
              className="w-full h-[400px] object-cover"
            />
            {seller.id && (
              <button
                className="absolute top-3 right-3 bg-gray-700 px-3 py-2 rounded-md"
                onClick={() => setEditType('cover')}
              >
                <Pencil size={16} /> Edit cover
              </button>
            )}
          </div>
          <div className="w-[85%] lg:w-[75%] mt-[-50px] mx-auto z-20 relative flex flex-col lg:flex-row gap-6">
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg flex-1">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative size-24 rounded-full border-4 border-slate-300 overflow-hidden">
                  <Image
                    src={seller.shop?.avatar || '/images/default-shop.png'}
                    alt="avatar"
                    layout="fill"
                    objectFit="cover"
                  />
                  {seller.id && (
                    <label
                      className="absolute bottom-1 right-1 bg-gray-700 p-2 rounded-full"
                      onClick={() => setEditType('avatar')}
                    >
                      <Pencil size={16} color="white" />
                    </label>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {seller.shop?.name}
                  </h1>
                  <p className="text-slate-800 text-sm mt-1">
                    {seller.shop.bio || 'No bio available'}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-blue-400 gap-1">
                      <Star size={18} fill="#60a5fa" />
                      <span>{seller.shop.ratings || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Users size={18} />{' '}
                      <span>{seller.followers} followers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-slate-700">
                    <Clock size={18} />
                    <span>{seller.shop.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-slate-700">
                    <MapPin size={18} />
                    <span>{seller.shop.address || 'No address provided'}</span>
                  </div>
                </div>
                {seller.id ? (
                  <button
                    className="px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center bg-blue-600 hover:bg-blue-700 transition"
                    onClick={() => router.push('/edit-profile')}
                  >
                    <Pencil size={18} /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-6 py-2 h-10 rounded-lg font-semibold flex items-center ${
                      isFollowing
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Heart size={18} />
                    <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
              <h2 className="text-2xl font-semibold text-slate-900">
                Shop Details
              </h2>
              <div className="flex items-center gap-3 mt-3 text-slate-700">
                <Calendar size={18} />
                <span>
                  Joined at:{' '}
                  {new Date(seller.shop.createdAt).toLocaleDateString()}
                </span>
              </div>
              {seller.shop.website && (
                <div className="flex items-center gap-3 mt-3 text-slate-700">
                  <Globe size={18} />
                  <Link
                    href={seller.shop.website}
                    className="hover:underline text-blue-600"
                  >
                    {seller.shop.website}
                  </Link>
                </div>
              )}
              {seller.shop.socialLinks &&
                seller.shop.socialLinks.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-lg font-medium text-slate-700">
                      Follow Us:
                    </h3>
                    <div className="flex gap-3 mt-2">
                      {seller.shop.socialLinks.map(
                        (link: any, index: number) => (
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
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="mx-auto w-[85%] lg:w-[70%] mt-8">
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
                    <div className="py-2 text-center">
                      No events available yet!
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'Reviews' && (
                <p className="text-center py-5">No reviews available yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
