'use client';

import React from 'react';
import Hero from '../shared/components/Hero';
import SectionTitle from '../shared/widgets/section/SectionTitle';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../shared/components/cards/ProductCard';

const Page = () => {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/products/get-all-products?page=1&limit=10'
      );
      return response?.data?.products;
    },
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

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] m-auto my-10">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-400 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
