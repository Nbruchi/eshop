import { NextFunction, Request, Response } from 'express';
import { validateRegistrationData } from '../utils/auth.helper';
import prisma from 'packages/libs/prisma';
import { ValidationError } from 'packages/error-handler';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateRegistrationData(req.body, 'user');
  const { name, email, password } = req.body;

    const existing = await prisma.users.findUnique({ where: { email } });
    
    if (existing) {
        return next(new ValidationError(`User with email ${email} already exists`));
    }
};
