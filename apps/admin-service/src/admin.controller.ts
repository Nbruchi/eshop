import { Request, Response, NextFunction } from 'express';
import { AuthError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setCookie } from './utils/cookies/setCookie';

// login admin
export const adminLogin = async (
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

    const isAdmin = (user as any).role === 'ADMIN';

    if (!isAdmin) {
      return next(new AuthError('Unauthorized!'));
    }

    res.clearCookie('seller_access_token');
    res.clearCookie('seller_refresh_token');

    const accessToken = jwt.sign(
      { id: user.id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'admin' },
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

// Get admin orders
export const getAdminOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller.id },
    });

    // Fetch all shop orders
    const orders = await prisma.orders.findMany({
      where: { shopId: shop.id },
      include: {
        user: true,
        shop: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};

// Get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: { startingDate: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          salePrice: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: { select: { fileUrl: true }, take: 1 },
          shop: { select: { name: true } },
        },
      }),
      prisma.products.count({ where: { startingDate: null } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      products,
      meta: { total, currentPage: page, totalPages },
    });
  } catch (error) {
    return next(error);
  }
};

// Get all events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.products.findMany({
        where: { startingDate: { not: null } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          salePrice: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: { select: { fileUrl: true }, take: 1 },
          shop: { select: { name: true } },
        },
      }),
      prisma.products.count({ where: { startingDate: { not: null } } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      events,
      meta: { total, currentPage: page, totalPages },
    });
  } catch (error) {
    return next(error);
  }
};

// Get all admins
export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await prisma.users.findMany({ where: { role: 'admin' } });

    return res.status(200).json({ success: true, admins });
  } catch (error) {
    return next(error);
  }
};

// Add new admin
export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;

    const isUser = await prisma.users.findUnique({ where: { email } });

    if (!isUser) {
      return next(new ValidationError('Something went wrong!'));
    }

    const updateRole = await prisma.users.update({
      where: { email },
      data: { role },
    });

    return res.status(200).json({ success: true, updateRole });
  } catch (error) {
    return next(error);
  }
};

// Fetch customizations
export const getAllCustomizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.siteConfig.findFirst();

    return res.status(200).json({
      success: true,
      categories: config?.categories || [],
      subCategories: config?.subCategories || {},
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (error) {
    return next(error);
  }
};

// Get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.users.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users,
      meta: { total, currentPage: page, totalPages },
    });
  } catch (error) {
    return next(error);
  }
};

// Get all sellers
export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [sellers, total] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
              avatar: true,
              address: true,
            },
          },
        },
      }),
      prisma.sellers.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      sellers,
      meta: { total, currentPage: page, totalPages },
    });
  } catch (error) {
    return next(error);
  }
};
