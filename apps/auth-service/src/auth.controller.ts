import { NextFunction, Request, Response } from 'express';
import {
  checkOTPRestrictions,
  handleForgotPassword,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
  verifyForgotPasswordOTP,
  verifyOTP,
} from './utils/auth.helper';
import prisma from '@packages/libs/prisma';
import bcrypt from 'bcrypt';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import { setCookie } from './utils/cookies/setCookie';
import stripe from '@packages/libs/stripe';

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

    if (existing) {
      throw new ValidationError(`User with email ${email} already exists`);
    }

    await verifyOTP(email, otp);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// login user
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AuthError(`All fields are required`));
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError(`User with email ${email} does not exist`));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AuthError(`Invalid password`));
    }

    res.clearCookie('seller_access_token');
    res.clearCookie('seller_refresh_token');

    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // Store access and refresh token in an httpOnly cookie
    setCookie(res, 'access_token', accessToken);
    setCookie(res, 'refresh_token', refreshToken);

    return res.status(200).json({
      message: `Logged in successfully!`,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// refresh token
export const handleRefreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies['refresh_token'] ||
      req.cookies['seller_refresh_token'] ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!refreshToken) {
      throw new ValidationError(`Unauthorized, no refresh token!`);
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError(`Forbidden!Invalid refresh token`);
    }

    let account;
    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    }

    if (!account) {
      return new AuthError(`Forbidden! User/Seller not found!`);
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    if (decoded.role === 'user') {
      setCookie(res, 'access_token', newAccessToken);
    } else if (decoded.role === 'seller') {
      setCookie(res, 'seller_access_token', newAccessToken);
    }

    req.role = decoded.role;

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, 'user');
};

// Verify user forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOTP(req, res, next);
};

// Reset user password
export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(
        new ValidationError(`User with email ${email} does not exist`)
      );
    }

    // Compare existing with new password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return next(
        new ValidationError(
          'New password cannot be the same as the old password'
        )
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// Get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email } = req.body;

    const existing = await prisma.sellers.findUnique({ where: { email } });

    if (existing) {
      throw new ValidationError(`Seller with this email already exists`);
    }
    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, 'seller-activation-email');
    return res
      .status(200)
      .json({ message: `OTP sent to email.Please verify your account` });
  } catch (error) {
    return next(error);
  }
};

// Verify seller wit otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone, country } = req.body;

    if (!email || !otp || !password || !name || !phone || !country) {
      throw new ValidationError(`All fields are required`);
    }

    const existing = await prisma.sellers.findUnique({ where: { email } });

    if (existing) {
      throw new ValidationError(`Seller with this email already exists`);
    }

    await verifyOTP(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: { name, email, password: hashedPassword, phone, country },
    });

    return res
      .status(201)
      .json({ message: `Seller registered successfully!`, seller });
  } catch (error) {
    return next(error);
  }
};

// Create a shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      throw new ValidationError(`All fields are required!`);
    }

    const shopData = {
      name,
      bio,
      address,
      opening_hours,
      website,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({ data: shopData });

    return res.status(201).json({ success: true, shop });
  } catch (error) {
    return next(error);
  }
};

// Connect stripe
export const createStripeLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      throw new ValidationError(`Seller ID is required`);
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });

    if (!seller) {
      throw new ValidationError(`Seller not found`);
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: seller.country,
      email: seller.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/success`,
      return_url: `${process.env.FRONTEND_URL}/success`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

// Login seller
export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AuthError(`All fields are required`));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });

    if (!seller) {
      return next(new AuthError(`User with email ${email} does not exist`));
    }

    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      return next(new AuthError(`Invalid password`));
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // Store access and refresh token in an httpOnly cookie
    setCookie(res, 'seller_access_token', accessToken);
    setCookie(res, 'seller_refresh_token', refreshToken);

    return res.status(200).json({
      message: `Logged in successfully!`,
      user: seller,
    });
  } catch (error) {
    return next(error);
  }
};

// Get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    return res.status(200).json({ success: true, seller });
  } catch (error) {
    return next(error);
  }
};

// Logout user
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// Logout seller
export const logoutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('seller_access_token');
    res.clearCookie('seller_refresh_token');

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

// Create address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, country, zip, isDefault } = req.body;

    if (!label || !name || !street || !city || !country || !zip) {
      return next(new ValidationError(`All fields are required`));
    }

    if (isDefault) {
      await prisma.addresses.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.addresses.create({
      data: { userId, label, name, street, city, zip, country, isDefault },
    });

    return res.status(201).json({ success: true, address });
  } catch (error) {
    return next(error);
  }
};

export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!id) {
      return next(new ValidationError('Address ID is required'));
    }

    const existingAddress = await prisma.addresses.findFirst({
      where: { id, userId },
    });

    if (!existingAddress) {
      return next(new NotFoundError('Address not found'));
    }

    await prisma.addresses.delete({ where: { id } });

    return res
      .status(200)
      .json({ success: true, message: 'Address deleted successfully!' });
  } catch (error) {
    return next(error);
  }
};

export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!addresses) {
      return next(new NotFoundError('No addresses found'));
    }

    return res.status(200).json({ success: true, addresses });
  } catch (error) {
    return next(error);
  }
};

// Change password
export const changePassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError('All fields are required'));
    }

    if (newPassword !== confirmPassword) {
      return next(new ValidationError("Passwords don't match!"));
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          "New password can't be the same as current password!"
        )
      );
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      return next(new NotFoundError('User not found'));
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(new ValidationError('Current password is incorect'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
};

// Fetch layout data
export const getLayoutData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const layout = await prisma.siteConfig.findFirst()

    return res.status(200).json({
      success:true,layout
    })
  } catch (error) {
    return next(error)
  }
}