'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type EmailFormData = {
  email: string;
};

type PasswordFormData = {
  password: string;
};

const ForgotPasswordPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [isPassword, setIsPassword] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    mode: 'onBlur',
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    mode: 'onBlur',
  });

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

  const requestOTPMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/forgot-password-user`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid OTP. Try again';
      setServerError(errorMessage);
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join('') }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('reset');
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid OTP. Try again';
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password-user`,
        { email: userEmail, password }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('email');
      setServerError(null);
      toast.success(
        `Password reset successfully!\nPlease login with your new password`
      );
      router.push('/login');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid OTP. Try again';
      setServerError(errorMessage);
    },
  });

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

  const onSubmitEmail = ({ email }: EmailFormData) => {
    requestOTPMutation.mutate({ email });
  };

  const onSubmitPassword = ({ password }: PasswordFormData) => {
    resetPasswordMutation.mutate({ password });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          {step === 'email' && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Enter Email
              </h3>
              <form onSubmit={handleSubmitEmail(onSubmitEmail)}>
                <label htmlFor="email" className="block text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full p-2 border border-gray-300 outline-none rounded mb-1"
                  {...registerEmail('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {emailErrors.email && (
                  <p className="text-red-500 text-sm text-center">
                    {String(emailErrors.email.message)}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={requestOTPMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg flex items-center justify-center mt-4"
                >
                  {requestOTPMutation.isPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </button>
                {serverError && <p className="text-error">{serverError}</p>}
              </form>
              <p className="text-center text-gray-500 my-4">
                Go back to{' '}
                <Link href="/login" className="text-blue-500">
                  Login
                </Link>
              </p>
            </>
          )}
          {step === 'otp' && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp.map((digit, index) => (
                  <input
                    type="text"
                    key={index}
                    maxLength={1}
                    value={digit}
                    className="w-12 h-12 text-center border border-gray-300 outline-none"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                onClick={() => verifyOTPMutation.mutate()}
                disabled={verifyOTPMutation.isPending}
                className="w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-md flex items-center justify-center"
              >
                {verifyOTPMutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  'Verify OTP'
                )}
              </button>
              {canResend ? (
                <button
                  onClick={() =>
                    requestOTPMutation.mutate({ email: userEmail! })
                  }
                  className="text-blue-500 text-center mt-4 cursor-pointer"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-center text-sm mt-4">
                  Resend OTP in {timer}s
                </p>
              )}
              {serverError && <p className="text-error">{serverError}</p>}
            </>
          )}
          {step === 'reset' && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <label htmlFor="password" className="block mb-1 text-gray-700">
                  New Password
                </label>
                <div className="relative flex items-center justify-between">
                  <input
                    type={isPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                    {...registerPassword('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <span
                    className="absolute right-2 text-gray-400"
                    onClick={() => setIsPassword(!isPassword)}
                  >
                    {isPassword ? <Eye /> : <EyeOff />}
                  </span>
                </div>
                {passwordErrors.password && (
                  <p className="text-red-500 text-sm text-center">
                    {String(passwordErrors.password.message)}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full mt-4 text-lg cursor-pointer bg-black text-white flex items-center justify-center py-2 rounded-md"
                >
                  {resetPasswordMutation.isPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
                {serverError && <p className="text-error">{serverError}</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
