import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useAuthStore } from '../store/authStore';
import { isProtected } from '../utils/protected';

// Fetch user from API
const fetchUser = async (isLoggedIn: boolean) => {
  const config = isLoggedIn ? isProtected : undefined;

  const response = await axiosInstance.get(`/logged-in-user`, config);
  return response.data.user;
};

const useUser = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuthStore();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(isLoggedIn),
    staleTime: 1000 * 60 * 5,
    retry: false,
    // @ts-ignore
    onSuccess: () => setIsLoggedIn(true),
    onError: () => setIsLoggedIn(false),
  });
  return { user, isLoading, isError };
};

export default useUser;
