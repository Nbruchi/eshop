import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

// Fetch admin from API
const fetchAdmin = async () => {
  const response = await axiosInstance.get(`/logged-in-admin`);
  return response.data.admin;
};

const useAdmin = () => {
  const {
    data: admin,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['admin'],
    queryFn: fetchAdmin,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  return { admin, isLoading, isError, refetch };
};

export default useAdmin;
