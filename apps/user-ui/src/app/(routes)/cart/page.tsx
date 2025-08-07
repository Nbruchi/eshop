'use client';

import { useQuery } from '@tanstack/react-query';
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { ChevronRight, Divide, Loader2, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Cart = () => {
  const router = useRouter();
  const { user } = useUser();
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceTracking();
  const [loading, setLoading] = useState(false);
  const cart = useStore((state) => state.cart);
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [storedCouponCode, setStoredCouponCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const removeFromCart = useStore((state) => state.removeFromCart);
  const [discountedProductId, setDiscountedProductId] = useState('');

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };

  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.salePrice,
    0
  );

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const applyCouponCode = async () => {
    setError(' ');

    if (!couponCode.trim()) {
      setError('Coupon code is required');
      return;
    }

    try {
      const res = await axiosInstance.put('/orders/verify-coupon', {
        couponCode: couponCode.trim(),
        cart,
      });

      if (res.data.valid) {
        setStoredCouponCode(couponCode.trim());
        setDiscountAmount(parseFloat(res.data.discountAmount));
        setDiscountPercent(res.data.discount);
        setDiscountedProductId(res.data.discountedProductId);
        setCouponCode('');
      } else {
        setDiscountAmount(0);
        setDiscountPercent(0);
        setDiscountedProductId('');
        setError(res.data.message || 'Coupon not valid for any items in cart');
      }
    } catch (error: any) {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setDiscountedProductId('');
      setError(error.response.data.message);
    }
  };

  // Get address
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: async () => {
      const res = await axiosInstance.get('/shipping-addresses');
      return res.data.addresses;
    },
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((addr: any) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId]);

  const createPaymentSession = async () => {
    if (addresses.length === 0) {
      toast.error('Please set your delivery address to create an order');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/orders/create-payment-session', {
        cart,
        selectedAddressId,
        coupon: {
          code: storedCouponCode,
          discountAmount,
          discountPercent,
          discountedProductId,
        },
      });

      const sessionId = res.data.sessionId;
      router.push(`/checkout?sessionId=${sessionId}`);
    } catch (error) {
      toast.error('Something went wrong!\n Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        <div>
          <h1 className="page-title">Cart</h1>
          <div className="flex items-center text-lg py-4">
            <Link
              href="/"
              className="text-[#55585b] cursor-pointer hover:underline"
            >
              Home
            </Link>
            <ChevronRight size={20} className="opacity-[0.98]" />
            <span className="text-[#55585b]">Cart</span>
          </div>
        </div>
        {cart.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your cart is empty! Start adding products
          </div>
        ) : (
          <div className="lg:flex items-start gap-10">
            <table className="w-full lg:w-[70%] border-collapse">
              <thead className="bg-[#f1f3f4] rounded">
                <tr>
                  <th className="py-3 text-left pl-6 align-middle">Product</th>
                  <th className="py-3 text-center align-middle">Price</th>
                  <th className="py-3 text-center align-middle">Quantity</th>
                  <th className="py-3 text-center align-middle"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item: any) => (
                  <tr key={item.id} className="border-b border-b-[#0000000e]">
                    <td className="flex items-center gap-4 p-4">
                      <Image
                        src={item.images[0]?.fileUrl}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded"
                      />
                      <span>{item.title}</span>
                      {item.selectedOptions && (
                        <div className="text-sm text-gray-500">
                          {item.selectedOptions?.color && (
                            <>
                              <span>
                                Color:{' '}
                                <span
                                  style={{
                                    backgroundColor:
                                      item?.selectedOptions?.color,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '100%',
                                    display: 'inline-block',
                                  }}
                                />
                              </span>
                            </>
                          )}
                          {item?.selectedOptions?.size && (
                            <span className="ml-2">
                              Size: {item?.selectedOptions?.size}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 text-lg text-center">
                      {item.id === discountedProductId ? (
                        <div className="flex flex-col items-center">
                          <span className="line-through text-gray-500">
                            ${item.salePrice.toFixed(2)}
                          </span>
                          <span className="text-green-600 font-semibold">
                            $
                            {(
                              (item.salePrice * (100 - discountPercent)) /
                              100
                            ).toFixed(2)}
                          </span>
                          <span className="text-xs text-green-700">
                            Discount applied
                          </span>
                        </div>
                      ) : (
                        <span>${item.salePrice.toFixed(2)}</span>
                      )}
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
                    <td className="text-center">
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

            <div className="p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg">
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[#010f1c] font-medium pb-1">
                  <span className="font-jost">
                    Discount ({discountPercent}%)
                  </span>
                  <span className="text-green-600">
                    {' '}
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[20px] text-[#010f1c] font-medium pb-3">
                <span className="font-jost">Subtotal</span>
                <span>${(subtotal - discountAmount).toFixed(2)}</span>
              </div>
              <hr className="my-4 text-slate-200" />
              <div className="mb-4">
                <h4 className="mb-[7px] font-[500] text-[15px]">
                  Have a coupon?
                </h4>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    placeholder="Enter coupon code"
                    className="w-full p-2 border border-gray-200 rounded-l-md focus:outline-none focus:border-b-blue-500"
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-600 transition-all"
                    onClick={applyCouponCode}
                  >
                    Apply
                  </button>
                </div>
                {error && <p className="text-sm pt-2 text-red-500">{error}</p>}
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-[7px] font-[500] text-[15px]">
                    Select Shipping Address
                  </h4>
                  {addresses.length > 0 ? (
                    <select
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                    >
                      {addresses.map((address: any) => (
                        <option value={address.id} key={address.id}>
                          {address.label} - {address.city}, {address.country}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-slate-800">
                      Please add an address from profile to create an order
                    </p>
                  )}
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="mb-4">
                  <h4 className="mb-[7px] font-[500] text-[15px]">
                    Select Payment Method
                  </h4>
                  <select className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500">
                    <option value="credit_card">Online Payment</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>
                <hr className="my-4 text-slate-200" />
                <div className="flex justify-between items-center text-[20px] text-[#010f1c] font-medium pb-3">
                  <span className="font-jost">Total</span>
                  <span>${(subtotal - discountAmount).toFixed(2)}</span>
                </div>
                <button
                  disabled={loading}
                  onClick={createPaymentSession}
                  className="w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989ff] transition-all rounded-lg"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? 'Redirecting...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
