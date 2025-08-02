'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { countries } from 'apps/user-ui/src/configs/constants';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { Loader2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const ShippingAddressSection = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      label: 'Home',
      name: '',
      street: '',
      city: '',
      zip: '',
      country: 'Rwanda',
      isDefault: false,
    },
  });

  // Get address
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['shipping-addresses'],
    queryFn: async () => {
      const res = await axiosInstance.get('/shipping-addresses');
      return res.data.addresses;
    },
  });

  const addressMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/add-address', payload);
      return res.data.address;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
      reset();
      setShowModal(false);
    },
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`/delete-address/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-addresses'] });
    },
  });

  const onSubmit = async (data: any) => {
    addressMutation.mutate({
      ...data,
      isDefault: data.isDefault === 'true',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Saved Addresses</h2>
        <button
          className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
          onClick={() => setShowModal(true)}
        >
          <Plus className="siz-4" /> Add New Address
        </button>
      </div>
      {/* Address list */}
      <div>
        {isLoading ? (
          <span className="text-gray-700 text-center">
            <Loader2 size={18} />
          </span>
        ) : addresses.length === 0 ? (
          <p className="text-center">No saved addresses found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((address: any) => (
              <div
                className="border border-gray-200 rounded-md p-4 relative"
                key={address.id}
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs py-0.5 px-2 rounded-full">
                    Default
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="size-5 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {address.label} - {address.name}
                    </p>
                    <p>
                      {address.street}, {address.city}, {address.zip}{' '}
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    className="flex items-center gap-1 cursor-pointer text-xs text-red-500 hover:text-red-600 transition"
                    onClick={() => deleteAddress(address.id)}
                  >
                    <Trash2 className="size-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-md shadow-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X className="size-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add New Address
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <select id="label" {...register('label')} className="form-input">
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
              {errors.label && (
                <p className="text-red-500 text-xs">{errors.label.message}</p>
              )}
              <input
                type="text"
                id="name"
                placeholder="Name"
                {...register('name', { required: 'Name is required' })}
                className="form-input"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
              <input
                type="text"
                id="street"
                placeholder="Street"
                {...register('street', { required: 'Street is required' })}
                className="form-input"
              />
              {errors.street && (
                <p className="text-red-500 text-xs">{errors.street.message}</p>
              )}
              <input
                type="text"
                id="city"
                placeholder="City"
                {...register('city', { required: 'City is required' })}
                className="form-input"
              />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city.message}</p>
              )}
              <input
                type="text"
                id="zip"
                placeholder="Zip Code"
                {...register('zip', { required: 'Zip code is required' })}
                className="form-input"
              />
              {errors.zip && (
                <p className="text-red-500 text-xs">{errors.zip.message}</p>
              )}
              <select
                id="country"
                {...register('country')}
                className="form-input"
              >
                {countries.map((country) => (
                  <option value={country.toLowerCase()} key={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-red-500 text-xs">{errors.country.message}</p>
              )}
              <select
                id="isDefault"
                {...register('isDefault')}
                className="form-input"
              >
                <option value="true">Set as Default</option>
                <option value="false">Not Default</option>
              </select>
              {errors.isDefault && (
                <p className="text-red-500 text-xs">
                  {errors.isDefault.message}
                </p>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white text-sm py-2 rounded-md transition hover:bg-blue-700"
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;
