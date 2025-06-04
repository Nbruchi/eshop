import crypto from 'crypto';
import { NextFunction } from 'express';
import { ValidationError } from '@packages/error-handler';
import { sendEmail } from './sendMail';
import redis from 'packages/libs/redis';

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

export const verifyOTP = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOTP = await redis.get(`otp:${email}`);
  if (storedOTP !== otp) {
    return next(new ValidationError('Invalid or expired OTP'));
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOTP !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`opt_lock:${email}`, 'locked', 'EX', 1800); // Lock for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey); // Clear OTP after lock
      return next(
        new ValidationError(
          `Too many failed attempts. Your account is locked for 30 minutes.`
        )
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300); // Increment failed attempts, expire in 5 minutes
    return next(
      new ValidationError(`Incorect OTP. ${2 - failedAttempts} attempts left`)
    );
  }
  await redis.del(`otp:${email}`, failedAttemptsKey);
};
