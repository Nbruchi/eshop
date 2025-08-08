import { useRouter } from 'next/navigation';
import useSeller from './useSeller';
import { useEffect } from 'react';

const useRequireAuth = () => {
  const router = useRouter();
  const { seller, isLoading } = useSeller();

  useEffect(() => {
    if (!isLoading && !seller) {
      router.replace('/login');
    }
  }, [router, isLoading, seller]);

  return { seller, isLoading };
};

export default useRequireAuth;
