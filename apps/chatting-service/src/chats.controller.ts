import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import redis from '@packages/libs/redis';
import {
  clearUnseenCount,
  getUnseenCount,
} from '@packages/libs/redis/message.redis';
import { NextFunction, Response } from 'express';

// Create a new conversation
export const newConversation = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    const userId = req.user?.id;

    if (!sellerId) {
      return next(new ValidationError('Seller ID is required'));
    }

    // Directly check if a conversation group already exists for this user and seller
    const existingGroup = await prisma.conversationGroups.findFirst({
      where: {
        isGroup: false,
        participantIds: {
          hasEvery: [userId, sellerId],
        },
      },
    });

    if (existingGroup) {
      return res
        .status(200)
        .json({ conversation: existingGroup, isNew: false });
    }

    //   Create a new conversation and participants
    const newGroup = await prisma.conversationGroups.create({
      data: {
        isGroup: false,
        creatorId: userId,
        participantIds: [userId, sellerId],
      },
    });

    await prisma.participants.createMany({
      data: [
        { conversationId: newGroup.id, userId },
        { conversationId: newGroup.id, sellerId },
      ],
    });

    return res.status(201).json({ conversation: newGroup, isNew: true });
  } catch (error) {
    return next(error);
  }
};

export const getUserConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    // Find all conversation groups where the user is a participant
    const conversations = await prisma.conversationGroups.findMany({
      where: { participantIds: { has: userId } },
      orderBy: { updatedAt: 'desc' },
    });

    await Promise.all(
      conversations.map(async (group) => {
        //   Get the seller participant inside tihs conversation
        const sellerParticipant = await prisma.participants.findFirst({
          where: { conversationId: group.id, sellerId: { not: null } },
        });

        //   Get seller's full info
        let seller;
        if (sellerParticipant?.sellerId) {
          seller = await prisma.sellers.findUnique({
            where: { id: sellerParticipant.sellerId },
            include: { shop: true },
          });
        }

        //   Get last message in the conversation
        const lastMessage = await prisma.messages.findFirst({
          where: { conversationId: group.id },
          orderBy: { createdAt: 'desc' },
        });

        //   Check online status from redis
        let isOnline = false;
        if (sellerParticipant?.sellerId) {
          const redisKey = `online:seller:seller_${sellerParticipant.sellerId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount('user', group.id);

        return res.status(200).json({
          conversationId: group.id,
          seller: {
            id: seller.id || null,
            name: seller.shop.name || 'Unknown',
            isOnline,
            avatar: seller.shop?.avatar,
          },
          lastMessage:
            lastMessage.content || 'Say something to start a conversation',
          lastMessageAt: lastMessage.createdAt || lastMessage.updatedAt,
          unreadCount,
        });
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const getSellerConversations = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    // Find all conversation groups where the user is a participant
    const conversations = await prisma.conversationGroups.findMany({
      where: { participantIds: { has: sellerId } },
      orderBy: { updatedAt: 'desc' },
    });

    await Promise.all(
      conversations.map(async (group) => {
        //   Get the seller participant inside tihs conversation
        const userParticipant = await prisma.participants.findFirst({
          where: { conversationId: group.id, userId: { not: null } },
        });

        //   Get user's full info
        let user;
        if (userParticipant?.userId) {
          user = await prisma.users.findUnique({
            where: { id: userParticipant.userId },
            include: { avatar: true },
          });
        }

        //   Get last message in the conversation
        const lastMessage = await prisma.messages.findFirst({
          where: { conversationId: group.id },
          orderBy: { createdAt: 'desc' },
        });

        //   Check online status from redis
        let isOnline = false;
        if (userParticipant?.userId) {
          const redisKey = `online:user:user_${userParticipant.userId}`;
          const redisResult = await redis.get(redisKey);
          isOnline = !!redisResult;
        }

        const unreadCount = await getUnseenCount('seller', group.id);

        return res.status(200).json({
          conversationId: group.id,
          user: {
            id: user.id || null,
            name: user.name || 'Unknown',
            isOnline,
            avatar: user.avatar,
          },
          lastMessage:
            lastMessage.content || 'Say something to start a conversation',
          lastMessageAt: lastMessage.createdAt || lastMessage.updatedAt,
          unreadCount,
        });
      })
    );
  } catch (error) {
    return next(error);
  }
};

export const fetchUserMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError('Conversation ID is required!'));
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroups.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    const hasAccess = conversation.participantIds.includes(userId);
    if (!hasAccess) {
      return next(new AuthError('Access denied to this conversation!'));
    }

    // Clear unseen messages for this user
    await clearUnseenCount('user', conversationId);

    // Get the seller participant
    const sellerParticipant = await prisma.participants.findFirst({
      where: {
        conversationId,
        sellerId: { not: null },
      },
    });

    //  Fetch seller info
    let seller = null;
    let isOnline = false;

    if (sellerParticipant.sellerId) {
      seller = await prisma.sellers.findUnique({
        where: { id: sellerParticipant.sellerId },
        include: { shop: true },
      });

      const redisKey = `online:seller:seller_${sellerParticipant.sellerId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    //   Fetch paginated messages (latest first)
    const messages = await prisma.messages.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      seller: {
        id: seller.id || null,
        name: seller.shop.name || 'Unknown',
        isOnline,
        avatar: seller.shop?.avatar,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchSellerMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;

    if (!conversationId) {
      return next(new ValidationError('Conversation ID is required!'));
    }

    // Check if user has access to this conversation
    const conversation = await prisma.conversationGroups.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return next(new NotFoundError('Conversation not found'));
    }

    const hasAccess = conversation.participantIds.includes(sellerId);
    if (!hasAccess) {
      return next(new AuthError('Access denied to this conversation!'));
    }

    // Clear unseen messages for this user
    await clearUnseenCount('seller', conversationId);

    // Get the seller participant
    const userParticipant = await prisma.participants.findFirst({
      where: {
        conversationId,
        userId: { not: null },
      },
    });

    //  Fetch seller info
    let user = null;
    let isOnline = false;

    if (userParticipant.userId) {
      user = await prisma.users.findUnique({
        where: { id: userParticipant.userId },
        include: { avatar: true },
      });

      const redisKey = `online:user:user_${userParticipant.userId}`;
      const redisResult = await redis.get(redisKey);
      isOnline = !!redisResult;
    }

    //   Fetch paginated messages (latest first)
    const messages = await prisma.messages.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json({
      messages,
      user: {
        id: user.id || null,
        name: user.name || 'Unknown',
        isOnline,
        avatar: user?.avatar,
      },
      currentPage: page,
      hasMore: messages.length === pageSize,
    });
  } catch (error) {
    return next(error);
  }
};
