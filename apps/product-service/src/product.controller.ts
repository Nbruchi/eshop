import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import imageKit from '@packages/libs/imageKit';
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

// Upload product image
export const uploadProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    const response = await imageKit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: 'products',
    });

    return res.status(201).json({
      message: 'Image uploaded successfully',
      fileUrl: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product image
export const deleteProductImage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.params;

    const response = await imageKit.deleteFile(fileId);

    return res.status(200).json({
      message: 'Image deleted successfully',
      response,
    });
  } catch (error) {
    next(error);
  }
};

// Create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      detailedDescription,
      warranty,
      customSpecifications,
      customProperties,
      slug,
      tags,
      cashOnDelivery,
      brand,
      videoUrl,
      category,
      subcategory,
      regularPrice,
      salePrice,
      stock,
      discountCodes,
      images,
      colors,
      sizes,
    } = req.body;

    if (
      !title ||
      !description ||
      !slug ||
      !category ||
      !subcategory ||
      !regularPrice ||
      !salePrice ||
      !stock ||
      !images ||
      !colors ||
      !sizes ||
      !images.length ||
      !colors.length ||
      !sizes.length ||
      !detailedDescription
    ) {
      return next(new ValidationError('All fields are required'));
    }

    if (!req.seller.id) {
      return next(new AuthError('Seller not found'));
    }

    const slugChecking = await prisma.products.findUnique({ where: { slug } });

    if (slugChecking) {
      return next(
        new ValidationError(`Slug already exists! Please use a different slug`)
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        description,
        detailedDescription,
        warranty,
        customSpecifications,
        customProperties,
        slug,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        cashOnDelivery,
        brand,
        videoUrl,
        category,
        subcategory,
        regularPrice: parseFloat(regularPrice),
        salePrice: parseFloat(salePrice),
        stock: parseInt(stock),
        discountCodes: discountCodes.map((code: string) => code),
        images: {
          create: images
            .filter((image: any) => image && image.fileId && image.fileUrl)
            .map((image: any) => ({
              fileId: image.fileId,
              fileUrl: image.fileUrl,
            })),
        },
        colors: colors || [],
        sizes: sizes || [],
        sellerId: req.seller.id,
        shopId: req.seller.shopId,
      },
      include: {
        images: true,
        seller: true,
        shop: true,
      },
    });

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: { shopId: req.seller?.shop?.id },
      include: { images: true },
    });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const product = await prisma.products.findUnique({
      where: { id },
      select: { id: true, shop: true, isDeleted: true },
    });

    console.log(req.seller.shopId);
    console.log(product.shop.id);

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    if (product.shop.id !== req.seller.shopId) {
      return next(new ValidationError('Unauthorized'));
    }

    if (product.isDeleted) {
      return next(new ValidationError('Product already deleted'));
    }

    const deletedProduct = await prisma.products.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      success: true,
      message:
        'Product scheduled for deletion in 24 hours. You can recover it within this time.',
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

// Restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    const product = await prisma.products.findUnique({
      where: { id },
      select: { id: true, shop: true, isDeleted: true },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    if (product.shop.id !== req.seller.shopId) {
      return next(new ValidationError('Unauthorized'));
    }

    if (!product.isDeleted) {
      return next(new ValidationError('Product is not deleted'));
    }

    const restoredProduct = await prisma.products.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      product: restoredProduct,
    });
  } catch (error) {
    next(error);
  }
};
