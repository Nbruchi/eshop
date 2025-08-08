import { sendEmail } from 'apps/auth-service/src/utils/sendMail/index';
import { NextFunction, Request, Response } from 'express';
import stripe from '@packages/libs/stripe';
import { NotFoundError, ValidationError } from '@packages/error-handler';
import redis from '@packages/libs/redis';
import prisma from '@packages/libs/prisma';
import crypto from 'crypto';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';

// Create payment intent
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeId, sessionId } = req.body;

  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.floor(customerAmount * 0.1);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: 'usd',
      payment_method_types: ['card'],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeId,
      },
      metadata: {
        sessionId,
        userId: req.user?.id,
      },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return next(error);
  }
};

// Create payment session
export const createPaymentSession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { cart, coupon, shippingAddressId } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError('Cart is empty!'));
    }

    const normalizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          salePrice: item.salePrice,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys('payment-session:*');
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                salePrice: item.salePrice,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a, b) => a.id.localeCompare(b.id))
          );

          if (existingCart === normalizedCart) {
            return res.status(200).json({ sessionId: key.split(':')[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }
    //   Fetch seller and their stripe account
    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];

    const shops = await prisma.shops.findMany({
      where: { id: { in: uniqueShopIds } },
      select: {
        id: true,
        sellerId: true,
        sellers: { select: { stripeId: true } },
      },
    });

    const sellerData = shops.map((shop) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeId: shop.sellers?.stripeId,
    }));

    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.salePrice;
    }, 0);

    //   Create session payload
    const sessionId = crypto.randomUUID();

    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: shippingAddressId || null,
      coupon: coupon || null,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600, //10 minutes.
      JSON.stringify(sessionData)
    );

    return res.status(201).json({ sessionId });
  } catch (error) {
    return next(error);
  }
};

// Verify payment session
export const verifyPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return next(new ValidationError('Session ID is required'));
    }

    // Fetch session from redis
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return next(new NotFoundError('Session not found or expired'));
    }

    //   Parse and return session
    const session = JSON.parse(sessionData);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// Create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers['stripe-signature'];

    if (!stripeSignature) {
      return next(new ValidationError('Stripe Signature Missing!'));
    }

    const rawBody = (req as any)?.rawBody;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);

      if (!sessionData) {
        console.warn(`Session data expired or missing for ${sessionId}`);
        return res
          .status(200)
          .send('No session found, skipping order creation');
      }

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.users.findUnique({
        where: { id: userId },
      });
      const name = user.name;
      const email = user.email;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce((sum: number, product: any) => {
          sum + product.quantity * product.salePrice;
        }, 0);

        // Apply discount
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );

          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.salePrice *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;
            orderTotal -= discount;
          }
        }
        //   Create order
        const order = await prisma.orders.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: 'Paid',
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.salePrice,
                selectedOptions: item.selectedOptions,
              })),
            },
          },
        });

        //   Update product analytics
        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });

          await prisma.productAnalytics.upsert({
            where: {id: productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
            },
          });

          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
          });

          const newAction = {
            productId,
            shopId,
            action: 'purchase',
            timestamp: Date.now(),
          };

          const currentActions = Array.isArray(existingAnalytics?.actions)
            ? (existingAnalytics?.actions as Prisma.JsonArray)
            : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: { userId, lastVisited: new Date(), actions: [newAction] },
            });
          }
        }

        //   Send email
        await sendEmail(
          email,
          '🛍️ Your Eshop Order Confirmation',
          'order-confirmation',
          {
            name,
            cart,
            totalAmount: coupon?.discountAmount
              ? totalAmount - coupon?.discountAmount
              : totalAmount,
            trackingUrl: `/orders/${order.id}`,
          }
        );

        //   Create notification for sellers
        const createdShopIds = Object.keys(shopGrouped);
        const sellerShops = await prisma.shops.findMany({
          where: { id: { in: createdShopIds } },
          select: { id: true, sellerId: true, name: true },
        });

        for (const shop of sellerShops) {
          const firstProduct = shopGrouped[shop.id][0];
          const productTitle = firstProduct?.title || 'New item';

          await prisma.notifications.create({
            data: {
              title: '🛒 New Order Received',
              message: `A customer just ordered ${productTitle} from your shop!`,
              creatorId: userId,
              receiverId: shop?.sellerId,
              redirectLink: `/orders/${order.id}`,
            },
          });
        }

        //   Create admin notification
        await prisma.notifications.create({
          data: {
            title: '📦 Platform Order Alert',
            message: `A new order was placed by ${name}`,
            creatorId: userId,
            receiverId: 'ADMIN',
            redirectLink: `/orders/${order.id}`,
          },
        });

        await redis.del(sessionKey);
      }
    }
    return res
      .status(201)
      .json({ success: true, message: 'Order created successfully' });
  } catch (error) {
    return next(error);
  }
};

// Get user orders
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all shop orders
    const orders = await prisma.orders.findMany({
      where: { userId: req.user.id },
      include: {
        items: true,
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

// Get seller orders
export const getSellerOrders = async (
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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

// Get order details
export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return next(new ValidationError('Order ID is required'));
    }

    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return next(new NotFoundError(`Order not found`));
    }

    const shippingAddress = order.shippingAddressId
      ? await prisma.addresses.findUnique({
          where: { id: order.shippingAddressId },
        })
      : null;

    const coupon = order.couponCode
      ? await prisma.discountCodes.findUnique({
          where: { discountCode: order.couponCode },
        })
      : null;

    // Fetch all product details in one go
    const productIds = order.items.map((item) => item.productId);

    const products = await prisma.products.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        images: true,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const items = order.items.map((item) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress,
        couponCode: coupon,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Update delivery status
export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus) {
      return next(new ValidationError('Missing required fields'));
    }

    const allowedStatuses = [
      'Ordered',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];

    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError('Invalid delivery status!'));
    }

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return next(new NotFoundError('Order not found'));
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        deliveryStatus,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    return next(error);
  }
};

// Verify coupon code
export const verifyCoupon = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;

    if (!couponCode || !cart || cart.length === 0) {
      return next(new ValidationError('Coupon code and cart are required'));
    }

    // Fetch the discount code
    const discount = await prisma.discountCodes.findUnique({
      where: { discountCode: couponCode },
    });

    if (!discount) {
      return next(new NotFoundError("Coupon code isn't valid!"));
    }

    // Find matching product that includes this discount code
    const matchingProduct = cart.find((item) =>
      item.discountCodes.some((d) => d === discount.id)
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmount: 0,
        message: 'No matching product found in cart for this coupon',
      });
    }

    let discountAmount = 0;
    const price = matchingProduct.salePrice * matchingProduct.quantity;

    if (discount.discountType === 'percentage') {
      discountAmount = (price * discount.discountValue) / 100;
    } else {
      discountAmount = discount.discountValue;
    }

    // Prevent discount from being greater than total price
    discountAmount = Math.min(discountAmount, price);

    return res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountedProductId: matchingProduct.id,
      discountType: discount.discountType,
      message: 'Discount applied to 1 eligible product',
    });
  } catch (error) {
    return next(error);
  }
};

// Get all orders
export const getAllOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    // Fetch all shop orders
    const orders = await prisma.orders.findMany({
      include: {
        items: true,
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
