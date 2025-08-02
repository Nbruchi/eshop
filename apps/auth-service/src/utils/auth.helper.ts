import { ValidationError } from '@packages/error-handler';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { sendEmail } from 'apps/auth-service/src/utils/sendMail';
import redis from 'packages/libs/redis';
import prisma from '@packages/libs/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, country, phone_number } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!country || !phone_number))
  ) {
    throw new ValidationError(
      `Missing required fields for ${userType} registration`
    );
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const checkOTPRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account is locked due to multiple failed attempts. Please try again after 30 minutes.'
      )
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        'Too many OTP requests. Please wait 1 hour before requesting again.'
      )
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError('Please wait 1 minute before requesting a new OTP.')
    );
  }
};

export const sendOTP = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  await sendEmail(email, `Verify your email`, template, { name, otp });
  await redis.set(`otp:${email}`, otp, 'EX', 300); // Store OTP for 5 minutes
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const trackOTPRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 3600); // Lock for 1 hour
    return next(
      new ValidationError(
        'Too many OTP requests. Please wait 1 hour before requesting again.'
      )
    );
  }
  await redis.set(otpRequestKey, (otpRequests + 1).toString(), 'EX', 3600); // Reset count after 1 hour
};

export const verifyOTP = async (email: string, otp: string) => {
  const storedOTP = await redis.get(`otp:${email}`);
  if (storedOTP !== otp) {
    throw new ValidationError('Invalid or expired OTP');
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOTP !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`opt_lock:${email}`, 'locked', 'EX', 1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP after lock
      throw new ValidationError(
        `Too many failed attempts. Your account is locked for 30 minutes.`
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300); // Increment failed attempts, expire in 5 minutes
    throw new ValidationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left`
    );
  }
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller' = 'user'
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ValidationError('Email is required'));
    }

    const user =
      userType === 'user'
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError(`${userType} not Found`);
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);

    // Generate otp and send email
    await sendOTP(
      user.name,
      email,
      userType === 'user'
        ? 'forgot-password-user-email'
        : 'forgot-password-seller-email'
    );

    return res.status(200).json({
      message: `OTP sent to your email. Please verify your account`,
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgotPasswordOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError('Email and OTP are required');
    }

    await verifyOTP(email, otp);

    return res.status(200).json({
      message: 'OTP verified successfully. You can now reset your password.',
    });
  } catch (error) {
    return next(error);
  }
};
