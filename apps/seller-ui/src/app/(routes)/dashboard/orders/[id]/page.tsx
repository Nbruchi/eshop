'use client';

import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

export const statuses = [
  'Ordered',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderDetails = () => {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setIsUpdating(true);

    try {
      await axiosInstance.put(`/orders/update-status/${order.id}`, {
        deliveryStatus: newStatus,
      });
      setOrder((prev: any) => ({ ...prev, deliveryStatus: newStatus }));
    } catch (error) {
      console.error(`Failed to update status: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
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
          onClick={() => router.push('/dashboard/orders')}
        >
          <ArrowLeft /> Go back to Order Dashboard
        </span>
      </div>
      <h1 className="text-2xl font-bold text-gray-200 mb-4">
        Order #{order.id.slice(-6)}
      </h1>
      {/* Status selector */}
      <div className="mb-6">
        <label
          htmlFor="status"
          className="text-sm font-medium mr-3 text-gray-300"
        >
          Update Delivery Status
        </label>
        <select
          id="status"
          value={order.deliveryStatus}
          onChange={handleStatusChange}
          disabled={isUpdating}
          className="border bg-transparent text-gray-200 border-gray-300 rounded-md"
        >
          {statuses.map((status) => {
            const currentIndex = statuses.indexOf(order.deliveryStatus);
            const statusIndex = statuses.indexOf(status);

            return (
              <option
                value={status}
                key={status}
                disabled={statusIndex < currentIndex}
              >
                {status}
              </option>
            );
          })}
        </select>
      </div>
      {/* Delivery progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium mb-2 text-gray-500">
          {statuses.map((step, index) => {
            const current = step === order.deliveryStatus;
            const passed = statuses.indexOf(order.deliveryStatus) >= index;

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
          {statuses.map((status, index) => {
            const reached = index <= statuses.indexOf(order.deliveryStatus);

            return (
              <div key={status} className="flex-1 flex items-center">
                <div
                  className={`size-4 rounded-full ${
                    reached ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  {index !== status.length - 1 && (
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

export default OrderDetails;
