import { useRouter } from 'next/navigation';
import useUser from './useUser';
import { useEffect } from 'react';

const useRequireAuth = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [router, isLoading, user]);

  return { user, isLoading };
};

export default useRequireAuth;
