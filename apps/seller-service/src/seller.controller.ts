import { ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import { NextFunction, Response, Request } from 'express';

export const getSellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const notifications = await prisma.notifications.findMany({
      where: { receiverId: sellerId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return next(error);
  }
};

// Mark notification as read
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return next(new ValidationError('Notification ID is required'));
    }

    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: 'Read' },
    });

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    return next(error);
  }
};
