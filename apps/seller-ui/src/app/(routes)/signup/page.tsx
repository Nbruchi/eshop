'use client';

import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';
import { countries } from 'apps/seller-ui/src/utils/constants';
import CreateShop from 'apps/seller-ui/src/shared/components/CreateShop';
import Image from 'next/image';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';

const SignupPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [sellerId, setSellerId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post('/register-seller', data);
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOTP(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const onSubmit = async (data: any) => {
    signupMutation.mutate(data);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axiosInstance.post('/verify-seller', {
        ...sellerData,
        otp: otp.join(''),
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data.seller?.id);
      setActiveStep(2);
    },
  });

  const resendOTP = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe = async () => {
    try {
      const response = await axiosInstance.post('/create-stripe-link', {
        sellerId,
      });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error(`Stripe connection failed: ${error}`);
    }
  };

  return (
    <div className="w-full pt-10 flex flex-col items-center min-h-screen">
      <div className="relative flex items-center justify-between md:w-[50%] mb-8">
        <div className="absolute top-[30%] left-0 w-[80%] md:w-[90%] h-1 bg-gray-300 -z-10" />
        {[1, 2, 3].map((step) => (
          <div key={step}>
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step <= activeStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px] mt-1">
              {step === 1
                ? 'Create Account'
                : step === 2
                ? 'Setup Shop'
                : 'Connect Bank'}
            </span>
          </div>
        ))}
      </div>
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOTP ? (
              <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <h3 className="text-2xl font-semibold text-center mb-4">
                    Create seller account
                  </h3>
                  <label htmlFor="name" className="block text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">
                      {String(errors.name.message)}
                    </p>
                  )}
                  <label htmlFor="email" className="block text-gray-700 mb-1">
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
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {String(errors.email.message)}
                    </p>
                  )}
                  <label htmlFor="phone" className="block text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="0123456789"
                    className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
                    {...register('phone', {
                      required: `Phone number is required`,
                      pattern: {
                        value: /^(?:\+250|250|0)7\d{8}$/,
                        message: `Invalid phone number format`,
                      },
                      minLength: {
                        value: 10,
                        message: `Phone number must be at least 10 digits`,
                      },
                      maxLength: {
                        value: 15,
                        message: `Phone number cannot exceed 15 digits`,
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">
                      {String(errors.phone.message)}
                    </p>
                  )}
                  <label htmlFor="country" className="block text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
                    {...register('country', {
                      required: `Country is required`,
                    })}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option value={country.code} key={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm">
                      {String(errors.country.message)}
                    </p>
                  )}
                  <label
                    htmlFor="password"
                    className="block text-gray-700 mb-1"
                  >
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
                    <p className="text-red-500 text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg mt-4 flex items-center justify-center"
                  >
                    {signupMutation.isPending ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      'Sign Up'
                    )}
                  </button>
                  {signupMutation.isError &&
                    signupMutation.error instanceof AxiosError && (
                      <p className="text-error">
                        {signupMutation.error.response?.data?.message ||
                          signupMutation.error.message}
                      </p>
                    )}
                </form>
                <p className="text-center text-gray-500 my-4">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-500">
                    Login
                  </Link>
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-center mb-4">
                  Enter OTP
                </h3>
                <div className="flex justify-center gap-6">
                  {otp?.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-12 text-center border border-gray-300 outline-none rounded"
                    />
                  ))}
                </div>
                <button
                  className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center"
                  disabled={verifyOTPMutation.isPending}
                  onClick={() => verifyOTPMutation.mutate()}
                >
                  {verifyOTPMutation.isPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button
                      onClick={resendOTP}
                      className="text-blue-500 cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>
                {verifyOTPMutation.isError &&
                  verifyOTPMutation.error instanceof AxiosError && (
                    <p className="text-error">
                      {verifyOTPMutation.error.response?.data?.message ||
                        verifyOTPMutation.error.message}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg"
              onClick={connectStripe}
            >
              Connect Stripe
              <Image src="/stripe.svg" alt="stripe" width={20} height={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
