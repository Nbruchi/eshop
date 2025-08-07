'use client';

import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordSection = () => {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    setMessage('');

    try {
      await axiosInstance.put('/change-password', data);
      setMessage('Password updated successfully!');
      reset();
    } catch (error: any) {
      setError(error?.response?.data?.message);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {message && (
          <p className="text-green-500 text-center text-sm">{message}</p>
        )}
        <div>
          <label
            htmlFor="currentPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            {...register('currentPassword', {
              required: 'Current password is required',
              minLength: {
                value: 8,
                message: 'Must be at least 8 characters',
              },
              validate: {
                hasLower: (value) =>
                  /[a-z]/.test(value) || 'Must include a lowercase letter',
                hasUpper: (value) =>
                  /[A-Z]/.test(value) || 'Must include an uppercase letter',
                hasNumber: (value) =>
                  /\d/.test(value) || 'Must include a number',
              },
            })}
            className="form-input"
            placeholder="Enter current password"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.currentPassword.message)}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Must be at least 8 characters',
              },
              validate: {
                hasLower: (value) =>
                  /[a-z]/.test(value) || 'Must include a lowercase letter',
                hasUpper: (value) =>
                  /[A-Z]/.test(value) || 'Must include an uppercase letter',
                hasNumber: (value) =>
                  /\d/.test(value) || 'Must include a number',
              },
            })}
            className="form-input"
            placeholder="Enter your new password"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.newPassword.message)}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', {
              required: 'Confirmation password is required',
              minLength: {
                value: 8,
                message: 'Must be at least 8 characters',
              },
              validate: {
                hasLower: (value) =>
                  /[a-z]/.test(value) || 'Must include a lowercase letter',
                hasUpper: (value) =>
                  /[A-Z]/.test(value) || 'Must include an uppercase letter',
                hasNumber: (value) =>
                  /\d/.test(value) || 'Must include a number',
              },
            })}
            className="form-input"
            placeholder="Enter your confirmation password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {String(errors.confirmPassword.message)}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-1 bg-blue-500 py-2 text-white rounded-md hover:bg-blue-600 transition"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
      </form>
    </div>
  );
};

export default ChangePasswordSection;
