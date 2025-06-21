'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ChevronRight, LoaderCircle, Plus, Trash, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

type FormData = {
  publicName: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountCode: string;
};

const DiscountCodes = () => {
  const [openModal, setOpenModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      publicName: '',
      discountType: 'percentage',
      discountValue: 0,
      discountCode: '',
    },
  });

  const { data: discountCodes, isLoading } = useQuery({
    queryKey: ['discount-codes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/product/get-discount-codes');
      return response.data.discountCodes;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleDelete = async (id: string) => {};

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        '/product/create-discount-code',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      reset();
      setOpenModal(false);
    },
  });

  const onSubmit = (data: FormData) => {
    if (discountCodes?.length >= 8) {
      toast.error('You can only have 8 discount codes');
      return;
    }
    createDiscountCodeMutation.mutate(data);
  };

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setOpenModal(true)}
        >
          <Plus size={18} /> Create Discount Code
        </button>
      </div>
      {/* Breadcrumb */}
      <div className="flex items-center">
        <span className="text-[#80deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[0.98] text-white" />
        <span className="text-white">Discount Code</span>
      </div>
      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount codes
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoaderCircle size={30} className="animate-spin text-white" />
          </div>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodes?.map((code: any) => (
                <tr
                  key={code.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{code.publicName}</td>
                  <td className="p-3 capitalize">
                    {code.discountType === 'percentage'
                      ? 'Percentage (%)'
                      : 'Flat ($)'}
                  </td>
                  <td className="p-3">
                    {code.discountType === 'percentage'
                      ? `${code.discountValue}%`
                      : `$${code.discountValue}`}
                  </td>
                  <td className="p-3">{code.discountCode}</td>
                  <td className="p-3">
                    <button
                      className="text-red-400 hover:text-red-300 transition"
                      onClick={() => handleDelete(code)}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {!isLoading && discountCodes?.length === 0 && (
              <p className="p-4 w-full block text-center text-gray-400">
                No discount codes available!
              </p>
            )}
          </table>
        )}
      </div>
      {openModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Create Discount Code</h3>
              <button
                className="text-gray-400 hover:text-white transition"
                onClick={() => setOpenModal(false)}
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="publicName" className="text-white">
                    Title
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodes;
