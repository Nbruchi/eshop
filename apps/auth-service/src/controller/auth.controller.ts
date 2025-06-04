import { NextFunction, Request, Response } from 'express';
import {
  checkOTPRestrictions,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
  verifyOTP,
} from '../utils/auth.helper';
import prisma from '@packages/libs/prisma';
import bcrypt from 'bcrypt';
import { ValidationError } from '@packages/error-handler';

// Register user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email, password } = req.body;

    const existing = await prisma.users.findUnique({ where: { email } });

    if (existing) {
      return next(
        new ValidationError(`User with email ${email} already exists`)
      );
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, 'user-activation-mail');

    return res.status(200).json({
      message: 'OTP sent successfully. Please check your email.',
    });
  } catch (error) {
    return next(error);
  }
};

// Verify user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, otp, password } = req.body;

    if (!name || !email || !otp || !password) {
      throw new ValidationError('All fields are required');
    }

    const existing = await prisma.users.findUnique({ where: { email } });

    if (!existing) {
      throw new ValidationError(`User with email ${email} already exists`);
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
     await prisma.users.create({
      data: { name, email, password: hashedPassword },
     });
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    })
  } catch (error) {
    return next(error);
  }
};
