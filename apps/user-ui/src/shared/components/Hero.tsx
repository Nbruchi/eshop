'use client';

import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useLayout from '../../hooks/useLayout';

const Hero = () => {
  const router = useRouter();
  const { layout } = useLayout();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-normal text-white pb-2 text-xl">
            Starting from $40
          </p>
          <h1 className="text-white text-6xl font-extrabold">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="text-3xl pt-4 text-white">
            Exclusive offer {''}
            <span className="text-yellow-400">10% off</span> this week
          </p>
          <button
            onClick={() => router.push('/products')}
            className="w-[200px] gap-2 font-semibold h-[40px] text-gray-900 hover:text-white bg-white hover:bg-gray-900 flex items-center rounded-lg mt-4 justify-center"
          >
            <span>Shop Now</span> <MoveRight />
          </button>
        </div>
        <div className="md:w-1/2">
          <Image
            src={layout?.banner || '/images/hero-image.png'}
            alt="banner"
            width={450}
            height={450}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
