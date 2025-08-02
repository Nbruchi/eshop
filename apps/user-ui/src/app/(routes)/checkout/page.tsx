'use client';

import { loadStripe, Appearance } from '@stripe/stripe-js';
import {Elements} from "@stripe/react-stripe-js"
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from 'apps/user-ui/src/shared/components/checkout/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const Page = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [coupon, setCoupon] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    const fetchSessionAndClientSecret = async () => {
      if (!sessionId) {
        setError('Invalid session. Please try again');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const verifyRes = await axiosInstance.get(
          `/orders/verify-payment-session?sessionId=${sessionId}`
        );

        const { totalAmount, sellers, cart, coupon } = verifyRes.data.session;

        if (
          !sellers ||
          sellers.length === 0 ||
          totalAmount === undefined ||
          totalAmount === null
        ) {
          throw new Error('Invalid payment session data');
        }

        setCartItems(cart);
        setCoupon(coupon);
        const sellerStripeId = sellers[0].stripeAccountId;

        const intentRes = await axiosInstance.post(
          '/orders/create-payment-intent',
          {
            amount: coupon?.discountAmount
              ? totalAmount - coupon.discountAmount
              : totalAmount,
            sellerStripeId,
            sessionId,
          }
        );

        setClientSecret(intentRes.data.clientSecret);
      } catch (error: any) {
        console.error(error);
        setError('Something went wrong while preparing your payment');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndClientSecret();
  }, [sessionId]);

  const appearance: Appearance = {
    theme: 'stripe',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="animate-spin size-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <div className="w-full text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="text-red-500 size-10" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Payment Failed
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {error} <br className="hidden sm:block" /> Please go back and try
            checking out again!
          </p>
          <button
            onClick={() => router.push('/cart')}
            className="bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 transition"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return clientSecret && (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <CheckoutForm clientSecret={clientSecret} cartItems={cartItems} coupon={coupon} sessionId={sessionId} />
    </Elements>
  )
};

export default Page;
