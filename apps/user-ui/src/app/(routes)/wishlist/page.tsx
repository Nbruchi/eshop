'use client';

import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

const Wishlist = () => {
  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const { user } = useUser();
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceTracking();

  return (
    <div className="w-full bg-white">
      <div className="pb-[50px]">
        {/* Breadcrumb */}
        <div className="flex items-center text-lg py-4">
          <Link href="/" className="text-[#80deea] cursor-pointer">
            Home
          </Link>
          <ChevronRight size={20} className="opacity-[0.98]" />
          <span>Wishlist</span>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
