import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import {
  fetchSellerMessages,
  fetchUserMessages,
  getSellerConversations,
  getUserConversations,
  newConversation,
} from './chats.controller';
import { isSeller } from '@packages/error-handler/authorizeRoles';

const router = Router();

router.post(
  '/create-user-conversation-group',
  isAuthenticated,
  newConversation
);

router.get('/get-user-conversations', isAuthenticated, getUserConversations);
router.get(
  '/get-seller-conversations',
  isAuthenticated,
  isSeller,
  getSellerConversations
);
router.get('/get-messages/:conversationId', isAuthenticated, fetchUserMessages);
router.get(
  '/get-seller-messages/:conversationId',
  isAuthenticated,
  isSeller,
  fetchSellerMessages
);

export default router;
