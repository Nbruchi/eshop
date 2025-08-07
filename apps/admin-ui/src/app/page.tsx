'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../utils/axiosInstance';
import { AxiosError } from 'axios';

type FormData = {
  email: string;
  password: string;
};

const Page = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axiosInstance.post('/admin/login', data, {
        withCredentials: true,
      });
      return res.data;
    },
    onSuccess: () => {
      setServerError(null);
      router.push('/dashboard');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid credentials';
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="md:w-[450px] pb-8 bg-slate-800 rounded-md shadow">
        <form className="p-5" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-3xl pb-3 pt-4 font-semibold text-center text-white font-poppins">
            Welcome Admin
          </h1>
          <div>
            <label htmlFor="email" className="block text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm text-center">
                {String(errors.email.message)}
              </p>
            )}
          </div>
          <label htmlFor="password" className="block text-gray-200 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
            >
              {passwordVisible ? <Eye /> : <EyeOff />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm text-center">
              {String(errors.password.message)}
            </p>
          )}
          <button
            type="submit"
            className="w-full mt-5 text-xl flex justify-center font-semibold font-poppins cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>

          {serverError && (
            <p className="text-red-500 text-center text-sm mt-2">
              {serverError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Page;
