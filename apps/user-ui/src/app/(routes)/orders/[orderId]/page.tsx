'use client';

import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const statuses = [
  'Ordered',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const { orderId } = params;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(
          `/orders/get-order-details/${orderId}`
        );
        setOrder(res.data.order);
      } catch (error) {
        setIsLoading(false);
        console.error(`Failed to fetch order details: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[40v]">
        <Loader2 className="size-6 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-red-500">Order not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="my-4">
        <span
          className="text-white flex items-center gap-2 font-semibold cursor-pointer"
          onClick={() => router.push('/profile?active=my+orders')}
        >
          <ArrowLeft /> Go back to Orders
        </span>
      </div>
      <h1 className="text-2xl font-bold text-gray-200 mb-4">
        Order #{order.id.slice(-6)}
      </h1>
      {/* Delivery progress */}
      <div className="my-4">
        <div className="flex items-center justify-between text-xs font-medium mb-2 text-gray-500">
          {statuses.map((step, index) => {
            const current = (
              order.deliveryStatus || 'Processing'
            ).toLowerCase();
            const passed =
              index <=
              statuses.findIndex(
                (s) =>
                  s.toLowerCase() ===
                  (order.deliveryStatus || 'Processing').toLowerCase()
              );

            return (
              <div
                key={step}
                className={`flex-1 text-left ${
                  current
                    ? 'text-blue-600'
                    : passed
                    ? 'text-gray-600'
                    : 'text-gray-400'
                }`}
              >
                {step}
              </div>
            );
          })}
        </div>
        <div className="flex items-center">
          {statuses.map((step, index) => {
            const reached =
              index <=
              statuses.findIndex(
                (s) =>
                  s.toLowerCase() ===
                  (order.deliveryStatus || 'Processing').toLowerCase()
              );

            return (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`size-4 rounded-full ${
                    reached ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  {index !== step.length - 1 && (
                    <div
                      className={`h-1 flex-1 ${
                        reached ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Summary info */}
      <div className="mb-6 space-y-1 text-sm text-gray-200">
        <p>
          <span className="font-semibold">Payment Status: </span>
          <span className="text-green-600 font-medium">{order.status}</span>
        </p>
        <p>
          <span className="font-semibold">Total Paid: </span>
          <span className="font-medium">${order.total.toFixed(2)}</span>
        </p>
        {order?.discountAmount > 0 && (
          <p>
            <span className="font-semibold">Discount Applied: </span>
            <span className="text-green-400">
              {' '}
              -${order.discountAmount.toFixed(2)} (
              {order.couponCode?.discountType === 'percentage'
                ? `${order.couponCode.discountValue}%`
                : `$${order.couponCode.discountValue}`}
              )
            </span>
          </p>
        )}
        {order?.couponCode && (
          <p>
            <span className="font-semibold">Coupon Used: </span>
            <span className="text-blue-400">{order.couponCode.publicName}</span>
          </p>
        )}
        <p>
          <span className="font-semibold">Date: </span>
          <span className="font-medium">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </p>
      </div>
      {/* Shipping address */}
      {order?.shippingAddress && (
        <div className="mb-6 text-sm text-gray-300">
          <h2 className="text-md font-semibold mb-2">Shipping Address</h2>
          <p>{order.shippingAddress.name}</p>
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
            {order.shippingAddress.zip}
          </p>
          <p>{order.shippingAddress.country}</p>
        </div>
      )}
      {/* Order items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div
              className="border border-gray-200 rounded-md p-4 flex items-center gap-4"
              key={item.productId}
            >
              <Image
                src={
                  item.product?.images[0]?.fileUrl || '/images/placeholder.png'
                }
                alt={item.product?.title || 'Product image'}
                fill
                className="size-16 object-cover rounded-md border border-gray-200"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-200">
                  {item.product.title}
                </p>
                <p className="text-sm text-gray-300">
                  Quantity: {item.quantity}
                </p>
                {item.selectedOptions &&
                  Object.keys(item.selectedOptions).length > 0 && (
                    <div className="text-xs mt-1 text-gray-400">
                      {Object.entries(item.selectedOptions).map(
                        ([key, value]: [string, any]) =>
                          value && (
                            <span key={key} className="mr-3">
                              <span className="capitalize font-medium">
                                {key}:{' '}
                              </span>
                              {value}
                            </span>
                          )
                      )}
                    </div>
                  )}
              </div>
              <p className="text-sm font-semibold text-gray-200">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
