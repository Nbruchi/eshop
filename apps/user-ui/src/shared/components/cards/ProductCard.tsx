'use client';

import Image from 'next/image';
import Link from 'next/link';
import Ratings from '../Ratings';
import { useEffect, useState } from 'react';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import ProductDetailsCard from './ProductDetailsCard';

interface Props {
  product: any;
  isEvent?: boolean;
}

const ProductCard = ({ product, isEvent = false }: Props) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isEvent && product?.endingDate) {
      const interval = setInterval(() => {
        const now = Date.now();
        const eventDate = new Date(product.endingDate).getTime();
        const difference = eventDate - now;

        if (difference <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isEvent, product?.endingDate]);

  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          Limited Stock
        </div>
      )}
      <Link href={`/products/${product?.slug}`}>
        <Image
          src={product?.images[0]?.fileUrl}
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[300px] object-cover mx-auto rounded-t-md cursor-pointer p-4"
        />
      </Link>
      <Link
        href={`/shops/${product.shop.id}`}
        className="block text-blue-500 text-sm font-medium my-2 px-2"
      >
        {product.shop?.name}
      </Link>
      <Link href={`/products/${product?.slug}`}>
        <h3 className="text-base font-semibold px-2 text-gray-800 line-clamp-1">
          {product?.title}
        </h3>
      </Link>
      <div className="mt-2 px-2">
        <Ratings rating={product?.ratings} />
      </div>
      <div className="mt-3 flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${product.salePrice}
          </span>
          <span className="text-sm line-through text-red-500">
            ${product.regularPrice}
          </span>
        </div>
        <span className="text-green-500 text-sm font-medium">
          {product.totalSales} sold
        </span>
      </div>
      {isEvent && timeLeft && (
        <div className="mt-2">
          <span className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md">
            {timeLeft}
          </span>
        </div>
      )}

      <div className="absolute z-10 flex flex-col gap-3 right-3 top-10">
        <div className="bg-white rounded-full p-[6px] shadow-md">
          <Heart
            className="cursor-pointer hover:scale-110 transition"
            size={22}
            fill="red"
            stroke="red"
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-md">
          <Eye
            className="cursor-pointer hover:scale-110 transition text-[#4b5563]"
            size={22}
            onClick={() => setOpen(true)}
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-md">
          <ShoppingBag
            className="cursor-pointer hover:scale-110 transition text-[#4b5563]"
            size={22}
          />
        </div>
      </div>
      {open && (
        <ProductDetailsCard open={open} setOpen={setOpen} data={product} />
      )}
    </div>
  );
};

export default ProductCard;
