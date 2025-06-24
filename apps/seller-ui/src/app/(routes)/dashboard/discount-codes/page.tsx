'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/DeleteDiscountCodeModal';
import Input from 'apps/seller-ui/src/shared/components/input';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { ChevronRight, LoaderCircle, Plus, Trash, X } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

type FormData = {
  publicName: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountCode: string;
};

const DiscountCodes = () => {
  const [openModal, setOpenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<any>(null);
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
      const response = await axiosInstance.get('/products/get-discount-codes');
      return response.data.discountCodes;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleDelete = async (code: FormData) => {
    setShowDeleteModal(true);
    setSelectedDiscountCode(code);
  };

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post(
        '/products/create-discount-code',
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

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(
        `/products/delete-discount-code/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discount-codes'] });
      setShowDeleteModal(false);
    },
  });

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
              {!isLoading && discountCodes?.length === 0 && (
                <p className="p-4 text-center text-gray-400">
                  No discount codes available!
                </p>
              )}
            </tbody>
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
                  <Input
                    label="Title (Public Name)"
                    {...register('publicName', {
                      required: `Public Name is required`,
                    })}
                  />
                  {errors.publicName && (
                    <p className="text-red-500">{errors.publicName.message}</p>
                  )}
                  <div className="mt-4">
                    <label
                      htmlFor="discountType"
                      className="block font-semibold text-gray-300 mb-1"
                    >
                      Discount Type
                    </label>
                    <Controller
                      control={control}
                      name="discountType"
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full p-2 rounded-md border border-gray-700 outline-none bg-gray-800 text-white"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat ($)</option>
                        </select>
                      )}
                    />
                    {errors.discountType && (
                      <p className="text-red-500">
                        {errors.discountType.message}
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={1}
                      label="Discount Value"
                      {...register('discountValue', {
                        required: `Discount Value is required`,
                      })}
                    />
                    {errors.discountValue && (
                      <p className="text-red-500">
                        {errors.discountValue.message}
                      </p>
                    )}
                  </div>
                  <div className="mt-2">
                    <Input
                      label="Discount Code"
                      {...register('discountCode', {
                        required: `Discount Code is required`,
                      })}
                    />
                    {errors.discountCode && (
                      <p className="text-red-500">
                        {errors.discountCode.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={createDiscountCodeMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center mt-4 w-full"
                  >
                    {createDiscountCodeMutation.isPending ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={18} />
                        Create
                      </>
                    )}
                  </button>
                  {createDiscountCodeMutation.isError && (
                    <p className="text-red-500 mt-2 text-sn">
                      {(
                        createDiscountCodeMutation.error as AxiosError<{
                          message: string;
                        }>
                      )?.response?.data?.message || 'Something went wrong'}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDiscountCode && (
        <DeleteDiscountCodeModal
          discount={selectedDiscountCode}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() =>
            deleteDiscountCodeMutation.mutate(selectedDiscountCode.id)
          }
        />
      )}
    </div>
  );
};

export default DiscountCodes;
