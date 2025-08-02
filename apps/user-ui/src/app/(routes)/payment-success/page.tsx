'use client';

import { useStore } from 'apps/user-ui/src/store';
import confetti from 'canvas-confetti';
import { CheckCircle, Truck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const router = useRouter();

  useEffect(() => {
    useStore.setState({ cart: [] });

    // Confetti
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg max-w-md">
        <div className="text-green-500 mb-4">
          <CheckCircle className="size-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Payment Successful 🎊
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Thank you for your purchase. Your order has been placed Successfully!
        </p>
        <button
          onClick={() => router.push('/profile?active=my+orders')}
          className="inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition px-5 py-2"
        >
          <Truck className="size-4" /> Track order
        </button>
        <div className="mt-8 text-xs text-gray-400">
          Payment SessionId: <span className="font-mono">{sessionId}</span>
        </div>
      </div>
    </div>
  );
};

export default Page;
