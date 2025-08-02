'use client';

import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
  clientSecret: string;
  cartItems: any[];
  coupon: any;
  sessionId: string | null;
}

const CheckoutForm = ({
  clientSecret,
  cartItems,
  coupon,
  sessionId,
}: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'failed' | null>(null);

  const total = cartItems.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?sessionId=${sessionId}`,
        },
      });

      if (result.error) {
        setStatus('failed');
        setErrorMessage(result.error.message || 'Something went wrong');
      } else {
        setStatus('success');
      }
    } catch (error: any) {
      console.error(`Failed to approve payment success: ${error}`);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 my-10">
      <form className="bg-white w-full max-w-lg p-8 rounded-md shadow space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          Secure Payment Checkout
        </h2>
        {/* Dynamic order summary */}
        <div className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 space-y-4">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm pb-1">
              <span>
                {item.quantity} x {item.title}
              </span>
              <span>${(item.quantity * item.salePrice).toFixed(2)}</span>
            </div>
          ))}
          {coupon && (
            <div className="flex justify-between font-semibold pt-2 border-t">
              {!!coupon?.discountAmount && (
                <>
                  <span>Discount</span>
                  <span className="text-green-600">
                    ${(coupon?.discountAmount).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="flex justify-between font-semibold mt-2">
            <span>Total</span>
            <span>${(total - (coupon?.discountAmount || 0)).toFixed(2)}</span>
          </div>
        </div>
        <PaymentElement />
        <button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {isLoading && <Loader2 className="size-5 animate-spin" />}
          {isLoading ? 'Processing...' : 'Pay Now'}
        </button>
        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="size-5" /> {errorMessage}
          </div>
        )}
        {status === 'success' && (
          <div className="flex items-center gap-2 justify-center text-green-600 text-sm">
            <CheckCircle className="size-5" />
            Payment Successful!
          </div>
        )}

        {status === 'failed' && (
          <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
            <XCircle className="size-5" />
            Payment Failed! Please try again!
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
