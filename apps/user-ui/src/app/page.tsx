'use client';

import React from 'react';
import Hero from '../shared/components/Hero';
import SectionTitle from '../shared/widgets/section/SectionTitle';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../shared/components/cards/ProductCard';
import ShopCard from '../shared/components/cards/ShopCard';

const Page = () => {
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/recommendation/get-recommendation-products'
      );
      return response?.data?.recommendations;
    },
    staleTime: 1000 * 60 * 2,
  });

  const {
    data: latestProducts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/products/get-all-products?page=1&limit=10&type=latest'
      );
      return response?.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: shops, isLoading: isShopLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await axiosInstance.get('/products/top-shops');
      return response.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: events, isLoading: isEventLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/products/get-all-events?page=1&limit=10'
      );
      return response.data.events;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        {/* Suggested products */}
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-400 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products.length === 0 ? (
              <p className="text-center">No products available yet!</p>
            ) : (
              products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}

        {/* Latest products */}
        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-400 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {latestProducts.length === 0 ? (
              <p className="text-center">No latest products available yet!</p>
            ) : (
              latestProducts?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}

        {/* Top shops */}
        <div className="my-8 block">
          <SectionTitle title="Top Shops" />
        </div>
        {!isShopLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {shops.length === 0 ? (
              <p className="text-center">No shops available yet!</p>
            ) : (
              shops.map((shop: any) => <ShopCard key={shop.id} shop={shop} />)
            )}
          </div>
        )}

        {/* Top offers */}
        <div className="my-8 block">
          <SectionTitle title="Top Offers" />
        </div>
        {!isEventLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {events.length === 0 ? (
              <p className="text-center">No events available yet!</p>
            ) : (
              events.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isEvent={true}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
