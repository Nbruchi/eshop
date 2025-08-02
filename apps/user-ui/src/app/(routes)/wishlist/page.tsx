'use client';

import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Wishlist = () => {
  const wishlist = useStore((state) => state.wishlist);
  const addToCart = useStore((state) => state.addToCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const { user } = useUser();
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceTracking();

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
  };

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div>
          <h1 className="page-title">Wishlist</h1>
          {/* Breadcrumb */}
          <div className="flex items-center text-lg py-4">
            <Link
              href="/"
              className="text-[#55585b] cursor-pointer hover:underline"
            >
              Home
            </Link>
            <ChevronRight size={20} className="opacity-[0.98]" />
            <span className="text-[#55585b]">Wishlist</span>
          </div>
        </div>

        {/* For empty wishlist */}
        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your wishlist is empty! Start adding products
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Wishlist table items */}
            <table className="w-full border-collapse">
              <thead className="bg-[#f1f3f4]">
                <tr>
                  <th className="py-3 text-left pl-4">Product</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Quantity</th>
                  <th className="py-3 text-left">Action</th>
                  <th className="py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {wishlist.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="flex items-center gap-3 p-4">
                      <Image
                        src={item.images[0]?.fileUrl}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <span>{item.title}</span>
                    </td>
                    <td className="px-6 text-lg">
                      ${item.salePrice.toFixed(2)}
                    </td>
                    <td>
                      <div className="flex justify-center items-center border border-gray-200">
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => decreaseQuantity(item.id)}
                        >
                          <Minus />
                        </button>
                        <span className="px-4">{item.quantity}</span>
                        <button
                          className="text-black cursor-pointer text-xl"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          <Plus />
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        className="bg-[#2295ff] cursor-pointer text-white px-5 py-2 rounded-md hover:bg-[#007bff] transition-all"
                        onClick={() =>
                          addToCart(item, user, location, deviceInfo)
                        }
                      >
                        Add to cart
                      </button>
                    </td>
                    <td>
                      <button
                        className="text-[#818487] cursor-pointer hover:text-[#ff1826] transition duration-200"
                        onClick={() => removeItem(item.id)}
                      >
                        X Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
