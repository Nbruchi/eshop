import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import imageKit from '@packages/libs/imageKit';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    return next(error);
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
    const type = req.query.type || 'latest';

    const baseFilter = {
      OR: [{ isDeleted: false }, { isDeleted: null }],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === 'latest'
        ? { createdAt: 'desc' as Prisma.SortOrder }
        : { createdAt: 'asc' as Prisma.SortOrder };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        orderBy,
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({
        where: baseFilter,
      }),
    ]);

    return res.status(200).json({
      products,
      total,
      type,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// Get product details
export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: true,
        shop: true,
      },
    });

    return res.status(200).json({
      success: true,
      product,
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

    const baseFilter = {
      OR: [{ startingDate: { not: null } }, { endingDate: { not: null } }],
    };

    const [events, total,top10Sales] = await Promise.all([
      prisma.products.findMany({
        where: baseFilter,
        skip,
        take: limit,
        include: {
          images: true,
          shop: true,
        },
        orderBy: {
          totalSales: 'desc'
        }
      }),
      prisma.products.count({
        where: baseFilter,
      }),
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        orderBy: {
          totalSales:'desc'
        }
      })
    ]);

    return res.status(200).json({
      events,
      total,
      top10Sales,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered products
export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === 'string'
        ? priceRange.split(',').map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      salePrice: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      startingDate: null,
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered events
export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === 'string'
        ? priceRange.split(',').map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      salePrice: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        startingDate: null,
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get filtered shops
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (countries && (countries as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(countries) ? countries : String(countries).split(','),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          products: true,
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    return res.json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Search products
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return next(new ValidationError(`Search query is required`));
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    return next(error);
  }
};

// Get top shops
export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Aggregate total sales per shop from orders
    const topShopsData = await prisma.orders.groupBy({
      by: ['shopId'],
      _sum: { total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    // Fetch corresponding shop details
    const shopIds = topShopsData.map((item) => item.shopId);

    const shops = await prisma.shops.findMany({
      where: { id: { in: shopIds } },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        category: true,
      },
    });

    // Merge sales with shop data
    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((s) => s.shopId === shop.id);

      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
  } catch (error) {
    return next(error);
  }
};
