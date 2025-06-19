import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Fetch user from API
const fetchUser = async () => {
  const response = await axiosInstance.get(`/logged-in-user`);
  return response.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { user, isLoading, isError, refetch };
};

export default useUser;
