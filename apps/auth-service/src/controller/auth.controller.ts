import { NextFunction, Request, Response } from 'express';
import {
  checkOTPRestrictions,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
} from '../utils/auth.helper';
import prisma from 'packages/libs/prisma';
import { ValidationError } from 'packages/error-handler';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

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
