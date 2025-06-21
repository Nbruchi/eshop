import { NotFoundError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { Request, Response, NextFunction } from 'express';

// Get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.siteConfig.findFirst();
    if (!config) {
      return res.status(404).json({ message: 'Site config not found' });
    }

    // Parse subCategories if it's a string
    let parsedSubCategories = config.subCategories;
    if (typeof config.subCategories === 'string') {
      try {
        parsedSubCategories = JSON.parse(config.subCategories);
      } catch (parseError) {
        console.error('Error parsing subCategories:', parseError);
        parsedSubCategories = {};
      }
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: parsedSubCategories,
    });
  } catch (error) {
    next(error);
  }
};

// Create discount code
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicName, discountType, discountValue, discountCode, sellerId } =
      req.body;

    const existingCode = await prisma.discountCodes.findUnique({
      where: { discountCode },
    });

    if (existingCode) {
      return res.status(400).json({ message: 'Discount code already exists' });
    }

    const newDiscountCode = await prisma.discountCodes.create({
      data: {
        publicName,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req?.seller.id,
      },
    });

    return res.status(201).json({
      message: 'Discount code created successfully',
      discountCode: newDiscountCode,
    });
  } catch (error) {
    next(error);
  }
};

// Get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discountCodes = await prisma.discountCodes.findMany({
      where: { sellerId: req?.seller.id },
    });

    return res.status(200).json({
      message: 'Discount codes fetched successfully',
      discountCodes,
    });
  } catch (error) {
    next(error);
  }
};

// Delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const discountCode = await prisma.discountCodes.findUnique({
      where: { id, sellerId: req?.seller.id },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (discountCode.sellerId !== req?.seller.id) {
      return next(new ValidationError('Unauthorized'));
    }

    await prisma.discountCodes.delete({
      where: { id, sellerId: req?.seller.id },
    });

    return res
      .status(200)
      .json({ message: 'Discount code deleted successfully' });
  } catch (error) {
    next(error);
  }
};
