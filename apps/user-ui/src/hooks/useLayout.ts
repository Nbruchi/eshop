import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

const fetchLayout = async () => {
  const response = await axiosInstance.get('/get-layouts');
  return response.data.layout;
};

const useLayout = () => {
  const {
    data: layout,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['layout'],
    queryFn: fetchLayout,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  return { layout, isLoading, isError, refetch };
};

export default useLayout;
