import { useMutation } from '@tanstack/react-query';
import { countWords } from 'apps/seller-ui/src/utils';
import { shopCategories } from 'apps/seller-ui/src/utils/constants';
import axios, { AxiosError } from 'axios';
import { LoaderCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
  sellerId: string;
  setActiveStep: (step: number) => void;
}

const CreateShop = ({ sellerId, setActiveStep }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [serverError, setServerError] = useState<string | null>(null);

  const shopCreationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },

    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid credentials';
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreationMutation.mutate(shopData);
  };

  const categoryOptions = shopCategories.map((category) => ({
    value: category.value,
    label: category.label,
  }));

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Create your shop
        </h3>
        <label htmlFor="name" className="block text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter your shop name"
          className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
          {...register('name', { required: 'Shop name is required' })}
        />
        {errors.name && (
          <p className="text-red-500">{String(errors.name.message)}</p>
        )}
        <label htmlFor="bio" className="block text-gray-700 mb-1">
          Bio (max 100 words) *
        </label>
        <textarea
          id="bio"
          placeholder="Enter your bio"
          className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
          {...register('bio', {
            required: 'Your bio is required',
            validate: (value) => {
              const wordCount = countWords(value);
              if (wordCount > 100) {
                return 'Your bio must be less than 100 words';
              }
              return true;
            },
          })}
        />
        {errors.bio && (
          <p className="text-red-500">{String(errors.bio.message)}</p>
        )}
        <label htmlFor="address" className="block text-gray-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          id="address"
          placeholder="Enter your shop address"
          className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
          {...register('address', {
            required: 'Shop address is required',
          })}
        />
        <label htmlFor="opening_hours" className="block text-gray-700 mb-1">
          Opening hours
        </label>
        <input
          type="text"
          id="opening_hours"
          placeholder="Enter your opening hours"
          className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
          {...register('opening_hours')}
        />
        {errors.bio && (
          <p className="text-red-500">{String(errors.bio.message)}</p>
        )}
        <label htmlFor="website" className="block text-gray-700 mb-1">
          Website
        </label>
        <input
          type="url"
          id="website"
          placeholder="Enter your website"
          className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
          {...register('website', {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/,
              message: 'Invalid website URL',
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500">{String(errors.website.message)}</p>
        )}
        <label htmlFor="category" className="block text-gray-700 mb-1">
          Category *
        </label>
        <select
          id="category"
          className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
          {...register('category', {
            required: 'Category is required',
          })}
        >
          <option value="">Select a category</option>
          {categoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        {errors.category && (
          <p className="text-red-500">{String(errors.category.message)}</p>
        )}

        <button
          type="submit"
          disabled={shopCreationMutation.isPending}
          className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg mt-4 flex items-center justify-center"
        >
          {shopCreationMutation.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            'Create Shop'
          )}
        </button>
        {serverError && <p className="text-error">{String(serverError)}</p>}
      </form>
    </div>
  );
};

export default CreateShop;
